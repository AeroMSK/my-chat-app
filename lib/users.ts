import { databases, DATABASE_ID, USERS_COLLECTION_ID, Query } from "./appwrite"
import { ID, Permission, Role } from "appwrite"

export interface User {
  $id: string
  userId: string
  username: string
  email: string
  isOnline: boolean
  lastSeen: string
  $createdAt: string
  $updatedAt: string
}

export interface CreateUserData {
  userId: string
  username: string
  email: string
}

export class UserService {
  // Create or update user profile
  static async createOrUpdateUser(data: CreateUserData): Promise<User> {
    try {
      console.log("[v0] Creating/updating user:", data)
      const now = new Date().toISOString()

      // Try to find existing user first
      const existingUsers = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal("userId", data.userId),
      ])

      console.log("[v0] Existing users found:", existingUsers.documents.length)

      if (existingUsers.documents.length > 0) {
        // Update existing user
        console.log("[v0] Updating existing user...")
        const user = await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, existingUsers.documents[0].$id, {
          username: data.username,
          email: data.email,
          isOnline: true,
          lastSeen: now,
        })
        console.log("[v0] User updated successfully:", user)
        return user as User
      } else {
        // Create new user
        console.log("[v0] Creating new user...")
        const user = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: data.userId,
            username: data.username,
            email: data.email,
            isOnline: true,
            lastSeen: now,
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(data.userId)),
            Permission.delete(Role.user(data.userId)),
          ],
        )
        console.log("[v0] User created successfully:", user)
        return user as User
      }
    } catch (error) {
      console.error("[v0] Error creating/updating user:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        type: error.type,
      })
      throw error
    }
  }

  // Get all online users
  static async getOnlineUsers(): Promise<User[]> {
    try {
      console.log("[v0] Fetching users from database...")
      console.log("[v0] Database ID:", DATABASE_ID)
      console.log("[v0] Users Collection ID:", USERS_COLLECTION_ID)

      // Get all users first to debug
      const allUsersResponse = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.orderDesc("lastSeen"),
      ])

      console.log("[v0] Database query successful!")
      console.log("[v0] Total users in database:", allUsersResponse.documents.length)
      console.log("[v0] All users:", allUsersResponse.documents)

      console.log("[v0] Returning all users for debugging")
      return allUsersResponse.documents as User[]
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      console.error("[v0] Error details:", {
        message: error.message,
        code: error.code,
        type: error.type,
      })
      throw error
    }
  }

  // Update user online status
  static async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const users = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.equal("userId", userId)])

      if (users.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, users.documents[0].$id, {
          isOnline,
          lastSeen: new Date().toISOString(),
        })
      }

      clearTimeout(timeoutId)
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.warn("Online status update timed out - this is normal during page unload")
        return // Don't throw for timeout errors during page unload
      }

      if (error.message?.includes("NetworkError") || error.message?.includes("Failed to fetch")) {
        console.warn("Network error updating online status - user may be offline")
        return // Don't throw for network connectivity issues
      }

      console.error("Error updating online status:", error)
      // Only throw for unexpected errors, not network issues
      if (!error.message?.includes("fetch")) {
        throw error
      }
    }
  }
}
