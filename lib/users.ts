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
      const now = new Date().toISOString()

      // Try to find existing user first
      const existingUsers = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal("userId", data.userId),
      ])

      if (existingUsers.documents.length > 0) {
        // Update existing user
        const user = await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, existingUsers.documents[0].$id, {
          username: data.username,
          email: data.email,
          isOnline: true,
          lastSeen: now,
          updatedAt: now, // Add updatedAt field
        })
        return user as User
      } else {
        // Create new user
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
            createdAt: now, // Add required createdAt field
            updatedAt: now, // Add updatedAt field
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(data.userId)),
            Permission.delete(Role.user(data.userId)),
          ],
        )
        return user as User
      }
    } catch (error) {
      console.error("Error creating/updating user:", error)
      throw error
    }
  }

  // Get all online users
  static async getOnlineUsers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
        Query.equal("isOnline", true),
        Query.orderDesc("lastSeen"),
      ])

      return response.documents as User[]
    } catch (error) {
      console.error("Error fetching online users:", error)
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
          updatedAt: new Date().toISOString(),
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
