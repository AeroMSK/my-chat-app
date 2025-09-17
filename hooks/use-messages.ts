"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { MessageService, type Message } from "@/lib/messages"
import { ConversationService } from "@/lib/conversations"
import { client, DATABASE_ID, MESSAGES_COLLECTION_ID } from "@/lib/appwrite"

interface UseMessagesReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  sendMessage: (content: string, conversationId: string, userId: string, username: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  hasMore: boolean
  refreshMessages: () => Promise<void>
  loadingMore: boolean
  connectionStatus: "connected" | "disconnected" | "reconnecting"
}

export function useMessages(conversationId: string): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">(
    "disconnected",
  )

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3
  const baseReconnectDelay = 2000
  const connectionStateRef = useRef<{
    isConnecting: boolean
    isConnected: boolean
    currentConversationId: string | null
  }>({
    isConnecting: false,
    isConnected: false,
    currentConversationId: null,
  })

  const cleanupConnection = useCallback(() => {
    console.log("[v0] Cleaning up realtime connection...")

    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current()
      } catch (err) {
        console.warn("Error during subscription cleanup:", err)
      }
      unsubscribeRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    connectionStateRef.current = {
      isConnecting: false,
      isConnected: false,
      currentConversationId: null,
    }
    setConnectionStatus("disconnected")
  }, [])

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      setLoading(true)
      setError(null)
      const fetchedMessages = await MessageService.getLatestMessages(conversationId, 20)
      setMessages(fetchedMessages)
      setHasMore(fetchedMessages.length === 20)
    } catch (err: any) {
      setError(err.message || "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const setupRealtimeSubscription = useCallback(() => {
    if (!conversationId) return

    if (
      connectionStateRef.current.isConnecting ||
      (connectionStateRef.current.isConnected && connectionStateRef.current.currentConversationId === conversationId)
    ) {
      console.log("[v0] Realtime connection already exists for this conversation")
      return
    }

    // Clean up existing subscription if switching conversations
    if (connectionStateRef.current.currentConversationId !== conversationId) {
      cleanupConnection()
    }

    const attemptConnection = () => {
      if (connectionStateRef.current.isConnecting) {
        console.log("[v0] Connection attempt already in progress")
        return
      }

      try {
        console.log("[v0] Attempting realtime connection for conversation:", conversationId)
        connectionStateRef.current.isConnecting = true
        connectionStateRef.current.currentConversationId = conversationId
        setConnectionStatus("reconnecting")

        const subscriptionChannel = `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`

        const unsubscribe = client.subscribe(
          [subscriptionChannel],
          (response) => {
            console.log("[v0] Realtime message received")

            if (!connectionStateRef.current.isConnected) {
              setConnectionStatus("connected")
              connectionStateRef.current.isConnected = true
              connectionStateRef.current.isConnecting = false
              reconnectAttemptsRef.current = 0
            }

            const { events, payload } = response

            // Handle new message creation
            if (events.includes(`${subscriptionChannel}.*.create`)) {
              const newMessage = payload as Message

              if (newMessage.conversationId === conversationId) {
                setMessages((prev) => {
                  const exists = prev.some((msg) => msg.$id === newMessage.$id)
                  if (exists) return prev
                  return [...prev, newMessage]
                })
              }
            }

            // Handle message updates
            if (events.includes(`${subscriptionChannel}.*.update`)) {
              const updatedMessage = payload as Message

              if (updatedMessage.conversationId === conversationId) {
                setMessages((prev) => prev.map((msg) => (msg.$id === updatedMessage.$id ? updatedMessage : msg)))
              }
            }

            // Handle message deletion
            if (events.includes(`${subscriptionChannel}.*.delete`)) {
              const deletedMessage = payload as Message
              setMessages((prev) => prev.filter((msg) => msg.$id !== deletedMessage.$id))
            }
          },
          (error) => {
            console.error("[v0] Realtime connection error:", error)

            connectionStateRef.current.isConnecting = false
            connectionStateRef.current.isConnected = false
            setConnectionStatus("disconnected")

            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
              const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
              reconnectAttemptsRef.current++

              console.log(
                `[v0] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
              )

              reconnectTimeoutRef.current = setTimeout(() => {
                attemptConnection()
              }, delay)
            } else {
              console.error("[v0] Max reconnection attempts reached")
              setError("Real-time connection failed. Please refresh the page to reconnect.")
            }
          },
        )

        unsubscribeRef.current = unsubscribe
        console.log("[v0] Realtime subscription established")
      } catch (err: any) {
        console.error("[v0] Failed to set up real-time subscription:", err)

        connectionStateRef.current.isConnecting = false
        connectionStateRef.current.isConnected = false
        setConnectionStatus("disconnected")

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current)
          reconnectAttemptsRef.current++

          reconnectTimeoutRef.current = setTimeout(() => {
            attemptConnection()
          }, delay)
        } else {
          setError("Real-time connection failed. Messages may not update automatically.")
        }
      }
    }

    attemptConnection()
  }, [conversationId, cleanupConnection])

  // Load more messages (pagination) with improved error handling
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || loadingMore || !hasMore || messages.length === 0) return

    try {
      setLoadingMore(true)
      setError(null)

      const oldestMessage = messages[0]
      const result = await MessageService.getMessages(conversationId, 20, oldestMessage.$id)

      if (result.messages.length > 0) {
        setMessages((prev) => [...result.messages, ...prev])
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    } catch (err: any) {
      console.error("Failed to load more messages:", err)
      setError(err.message || "Failed to load more messages")
    } finally {
      setLoadingMore(false)
    }
  }, [conversationId, loadingMore, hasMore, messages])

  const sendMessage = useCallback(async (content: string, conversationId: string, userId: string, username: string) => {
    try {
      setError(null)
      await MessageService.createMessage({
        content,
        conversationId,
        userId,
        username,
      })

      await ConversationService.updateLastMessage(conversationId, content)
    } catch (err: any) {
      setError(err.message || "Failed to send message")
      throw err
    }
  }, [])

  const refreshMessages = useCallback(async () => {
    await loadMessages()
  }, [loadMessages])

  useEffect(() => {
    if (!conversationId) return

    loadMessages()

    const timer = setTimeout(() => {
      setupRealtimeSubscription()
    }, 1000) // Increased delay to ensure messages load first

    return () => {
      clearTimeout(timer)
      cleanupConnection()
    }
  }, [conversationId]) // Removed other dependencies to prevent unnecessary re-runs

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMore,
    refreshMessages,
    loadingMore,
    connectionStatus,
  }
}
