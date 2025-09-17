"use client"

import { useState, useEffect } from "react"
import { ConversationService, type Conversation } from "@/lib/conversations"
import { useAuth } from "@/hooks/use-auth"

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userConversations = await ConversationService.getUserConversations(user.$id)
      setConversations(userConversations)
      setError(null)
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch conversations")
    } finally {
      setLoading(false)
    }
  }

  const createOrGetConversation = async (otherUserId: string): Promise<Conversation | null> => {
    if (!user) return null

    try {
      const conversation = await ConversationService.createOrGetConversation([user.$id, otherUserId])

      // Update local conversations list
      setConversations((prev) => {
        const exists = prev.find((c) => c.$id === conversation.$id)
        if (exists) return prev
        return [conversation, ...prev]
      })

      return conversation
    } catch (err) {
      console.error("Error creating conversation:", err)
      setError(err instanceof Error ? err.message : "Failed to create conversation")
      return null
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  return {
    conversations,
    loading,
    error,
    createOrGetConversation,
    refetch: fetchConversations,
  }
}
