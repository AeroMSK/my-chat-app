import { databases, DATABASE_ID, MESSAGES_COLLECTION_ID, Query } from "./appwrite"
import { ID, Permission, Role } from "appwrite"

export interface Message {
  $id: string
  userId: string // Changed from senderId to userId to match database schema
  username: string // Changed from senderName to username to match database schema
  content: string
  conversationId: string // Changed from chatId to conversationId to match database schema
  $createdAt: string
  $updatedAt: string // Added updatedAt field to match database schema
}

export interface CreateMessageData {
  userId: string // Changed from senderId to userId to match database schema
  username: string // Changed from senderName to username to match database schema
  content: string
  conversationId: string // Changed from chatId to conversationId to match database schema
}

export class MessageService {
  // Create a new message
  static async createMessage(data: CreateMessageData): Promise<Message> {
    try {
      const now = new Date().toISOString()
      const message = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          userId: data.userId, // Changed from senderId to userId to match database schema
          username: data.username, // Changed from senderName to username to match database schema
          content: data.content,
          conversationId: data.conversationId, // Changed from chatId to conversationId to match database schema
          createdAt: now,
          updatedAt: now, // Added updatedAt field to match database schema
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(data.userId)), // Updated to use userId
          Permission.delete(Role.user(data.userId)), // Updated to use userId
        ],
      )
      return message as Message
    } catch (error) {
      console.error("Error creating message:", error)
      if (error instanceof Error && error.message.includes("not authorized")) {
        throw new Error(
          "Permission denied. Please configure collection permissions in Appwrite Console:\n1. Go to Database > Messages Collection\n2. Add permissions: Create (Any), Read (Any), Update (Users), Delete (Users)",
        )
      }
      throw error
    }
  }

  // Get messages for a room with pagination
  static async getMessages(
    conversationId: string, // Changed parameter from chatId to conversationId
    limit = 20,
    cursorBefore?: string,
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    try {
      const queries = [
        Query.equal("conversationId", conversationId), // Changed from chatId to conversationId
        Query.orderDesc("$createdAt"),
        Query.limit(limit + 1), // Get one extra to check if there are more
      ]

      if (cursorBefore) {
        queries.push(Query.cursorBefore(cursorBefore))
      }

      const response = await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, queries)

      const messages = response.documents as Message[]
      const hasMore = messages.length > limit

      // Remove the extra message if we have more than the limit
      if (hasMore) {
        messages.pop()
      }

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        hasMore,
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      throw error
    }
  }

  // Get latest messages for a room
  static async getLatestMessages(conversationId: string, limit = 20): Promise<Message[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, MESSAGES_COLLECTION_ID, [
        Query.equal("conversationId", conversationId), // Changed from chatId to conversationId
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ])

      return (response.documents as Message[]).reverse()
    } catch (error) {
      console.error("Error fetching latest messages:", error)
      if (error instanceof Error && error.message.includes("not authorized")) {
        throw new Error(
          "Permission denied. Configure collection permissions in Appwrite Console:\n1. Go to Database > Collections > Messages\n2. Settings > Permissions\n3. Add: Read (Any), Create (Any), Update (Users), Delete (Users)",
        )
      }
      throw error
    }
  }

  // Delete a message (for moderation)
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  }
}
