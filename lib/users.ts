import { databases, DATABASE_ID, USERS_COLLECTION_ID, Query, validateCollections } from "./appwrite"
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

      // Validate collections exist before proceeding
      const collectionsValid = await validateCollections()
      if (!collectionsValid) {
        throw new Error("Appwrite collections are not properly configured. Please run the setup script first.")
      }

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
      console.error("[v0] Error details:", error.message)

      if (
        error.message?.includes("Collection with the requested ID could not be found") ||
        error.message?.includes("collections are not properly configured")
      ) {
        console.error("[v0] SETUP REQUIRED:")
        console.error("[v0] 1. Run the setup script: node scripts/setup-appwrite-collections.js")
        console.error("[v0] 2. Set the environment variables with the generated collection IDs")
        console.error("[v0] 3. Make sure your Appwrite API key has proper permissions")
        console.error("[v0] Current configuration:")
        console.error("[v0] - DATABASE_ID:", DATABASE_ID)
        console.error("[v0] - USERS_COLLECTION_ID:", USERS_COLLECTION_ID)
      }
      throw error
    }
  }

  static async testDatabaseConnection(): Promise<void> {
    try {
      console.log("[v0] Testing database connection...")
      console.log("[v0] Database ID:", DATABASE_ID)
      console.log("[v0] Users Collection ID:", USERS_COLLECTION_ID)

      const collectionsValid = await validateCollections()
      if (!collectionsValid) {
        throw new Error("Collections not found. Please run setup script.")
      }

      // Try to list documents to test connection
      const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(1)])

      console.log("[v0] Database connection successful!")
      console.log("[v0] Collection exists and is accessible")
    } catch (error) {
      console.error("[v0] Database connection failed!")
      console.error("[v0] Error:", error.message)
      console.error("[v0] SETUP INSTRUCTIONS:")
      console.error("[v0] 1. Run: node scripts/setup-appwrite-collections.js")
      console.error("[v0] 2. Update your environment variables")
      console.error("[v0] 3. Restart your development server")
      throw error
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      console.log("[v0] Fetching all users for debugging...")
      const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ])
      console.log("[v0] Successfully fetched", response.documents.length, "users")
      return response.documents as User[]
    } catch (error) {
      console.error("[v0] Error fetching all users:", error.message)
      throw error
    }
  }

  static async getOnlineUsers(): Promise<User[]> {
    try {
      console.log("[v0] Starting getOnlineUsers...")

      const collectionsValid = await validateCollections()
      if (!collectionsValid) {
        console.warn("[v0] Collections not configured properly, returning empty array")
        return []
      }

      console.log("[v0] Fetching users from database...")

      // Get all users first to debug
      const allUsersResponse = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ])

      console.log("[v0] Database query successful!")
      console.log("[v0] Total users in database:", allUsersResponse.documents.length)

      if (allUsersResponse.documents.length === 0) {
        console.warn("[v0] No users found in database!")
        console.warn("[v0] This could mean users haven't registered yet or there's a configuration issue")
      }

      return allUsersResponse.documents as User[]
    } catch (error) {
      console.error("[v0] Error in getOnlineUsers:", error)
      console.error("[v0] Error details:", error.message)

      // Return empty array instead of throwing to prevent app crash
      console.warn("[v0] Returning empty array to prevent app crash")
      return []
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
