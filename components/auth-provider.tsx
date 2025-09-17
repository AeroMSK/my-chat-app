"use client"

import { useState, useEffect, type ReactNode } from "react"
import { account } from "@/lib/appwrite"
import { AuthContext } from "@/hooks/use-auth"
import type { Models } from "appwrite"
import { ID } from "appwrite"
import { UserService } from "@/lib/users"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, []) // Empty dependency array - runs only once on mount

  useEffect(() => {
    if (!user) return

    const handleBeforeUnload = () => {
      try {
        // Try sendBeacon first (more reliable for page unload)
        const data = JSON.stringify({ userId: user.$id, isOnline: false })
        if (navigator.sendBeacon) {
          // Note: This would need a server endpoint, fallback to regular call
          navigator.sendBeacon("/update-online-status", data)
        } else {
          UserService.updateOnlineStatus(user.$id, false).catch(() => {
            // Silently fail during page unload - this is expected
          })
        }
      } catch (error) {
        // Silently fail during page unload
      }
    }

    const handleVisibilityChange = () => {
      UserService.updateOnlineStatus(user.$id, !document.hidden).catch((error) => {
        console.warn("Failed to update online status on visibility change:", error)
        // Don't throw - this is not critical
      })
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser)

      if (currentUser) {
        try {
          await UserService.createOrUpdateUser({
            userId: currentUser.$id,
            username: currentUser.name,
            email: currentUser.email,
          })
          console.log("[v0] User profile synchronized successfully")
        } catch (userError) {
          console.error("[v0] Error creating/updating user:", userError)
          console.warn("[v0] User profile sync failed - this may affect chat functionality")
          // Don't throw - user is still authenticated even if profile update fails
        }
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser)

      try {
        await UserService.createOrUpdateUser({
          userId: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
        })
        console.log("[v0] User profile updated successfully on login")
      } catch (userError) {
        console.error("[v0] Error creating/updating user profile:", userError)
        console.warn("[v0] Profile creation failed - this may affect chat functionality")
        // Don't throw - login was successful even if profile creation fails
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("[v0] Starting registration process...")
      console.log("[v0] Email:", email, "Name:", name)
      console.log("[v0] Current URL:", window.location.origin)

      const userId = ID.unique()
      console.log("[v0] Generated user ID:", userId)

      try {
        await account.deleteSession("current")
        console.log("[v0] Deleted existing session before registration")
      } catch (error) {
        // No existing session, continue
        console.log("[v0] No existing session to delete")
      }

      await account.create(userId, email, password, name)
      console.log("[v0] Account created successfully, now creating session...")

      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser)

      try {
        console.log("[v0] Creating user profile in database...")
        console.log("[v0] Profile data:", {
          userId: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
        })

        const userProfile = await UserService.createOrUpdateUser({
          userId: currentUser.$id,
          username: currentUser.name,
          email: currentUser.email,
        })
        console.log("[v0] User profile created successfully:", userProfile.$id)
        console.log("[v0] Full profile data:", userProfile)
      } catch (userError) {
        console.error("[v0] CRITICAL: User profile creation failed during registration!")
        console.error("[v0] Error details:", userError)
        console.error("[v0] Error message:", userError.message)
        console.error("[v0] Error code:", userError.code)
        console.error("[v0] User account was created but profile creation failed")
        console.error("[v0] This means the user can login but won't appear in the chat")

        throw new Error(
          `Registration completed but profile creation failed: ${userError.message}\n\n` +
            "Your account was created successfully, but there was an issue setting up your profile. " +
            "Please check the browser console for detailed error information. " +
            "You can try logging in again, or contact support if the issue persists.\n\n" +
            "Debug info: Check console for Appwrite collection configuration errors.",
        )
      }

      console.log("[v0] Registration completed successfully")
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error type:", error.type)
      console.error("[v0] Current origin:", window.location.origin)

      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        const currentDomain = window.location.hostname
        throw new Error(
          `CORS Error: Your v0 preview URL is not allowed by Appwrite.\n\n` +
            "Steps to fix:\n" +
            "1. Go to your Appwrite Console (https://fra.cloud.appwrite.io)\n" +
            "2. Select your project (68938bea001ed4b0a8b0)\n" +
            "3. Go to Overview > Platforms\n" +
            "4. Update your Web Platform hostname to: *.vusercontent.net\n" +
            "5. This wildcard will work with all v0 preview URLs\n" +
            "6. Click Update to save changes\n\n" +
            `Your current domain is: ${currentDomain}\n` +
            "Use *.vusercontent.net to handle all v0 preview URLs!",
        )
      }

      throw error
    }
  }

  const logout = async () => {
    try {
      if (user) {
        try {
          await UserService.updateOnlineStatus(user.$id, false)
        } catch (error) {
          console.warn("Failed to update online status during logout:", error)
          // Don't prevent logout if status update fails
        }
      }
      await account.deleteSession("current")
      setUser(null)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
