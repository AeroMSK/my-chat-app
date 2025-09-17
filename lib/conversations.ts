import { databases, DATABASE_ID, CONVERSATIONS_COLLECTION_ID, Query } from "./appwrite"
import { ID, Permission, Role } from "appwrite"

export interface Conversation {
  $id: string
  participants: string
  lastMessage?: string
  lastMessageAt?: string
  $createdAt: string
  $updatedAt: string
}

export interface CreateConversationData {
  participants: string[]
}

export class ConversationService {
  // Create or get existing conversation between users
  static async createOrGetConversation(participants: string[]): Promise<Conversation> {
    try {
      const sortedParticipants = participants.sort()
      const participantsString = JSON.stringify(sortedParticipants)

      // Try to find existing conversation
      const existingConversations = await databases.listDocuments(DATABASE_ID, CONVERSATIONS_COLLECTION_ID, [
        Query.equal("participants", participantsString),
      ])

      if (existingConversations.documents.length > 0) {
        return existingConversations.documents[0] as Conversation
      }

      const conversation = await databases.createDocument(
        DATABASE_ID,
        CONVERSATIONS_COLLECTION_ID,
        ID.unique(),
        {
          participants: participantsString,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        [Permission.read(Role.users()), Permission.update(Role.users()), Permission.delete(Role.users())],
      )
      return conversation as Conversation
    } catch (error) {
      console.error("Error creating/getting conversation:", error)
      throw error
    }
  }

  // Get user's conversations
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const response = await databases.listDocuments(DATABASE_ID, CONVERSATIONS_COLLECTION_ID, [
        Query.orderDesc("$updatedAt"),
      ])

      // Filter conversations where user is a participant
      const userConversations = response.documents.filter((doc: any) => {
        try {
          const participants = JSON.parse(doc.participants)
          return participants.includes(userId)
        } catch {
          return false
        }
      })

      return userConversations as Conversation[]
    } catch (error) {
      console.error("Error fetching user conversations:", error)
      throw error
    }
  }

  // Update conversation with last message
  static async updateLastMessage(conversationId: string, message: string): Promise<void> {
    try {
      await databases.updateDocument(DATABASE_ID, CONVERSATIONS_COLLECTION_ID, conversationId, {
        lastMessage: message,
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating last message:", error)
      throw error
    }
  }

  static getOtherParticipant(conversation: Conversation, currentUserId: string): string {
    try {
      const participants = JSON.parse(conversation.participants)
      return participants.find((id: string) => id !== currentUserId) || ""
    } catch {
      return ""
    }
  }
}
