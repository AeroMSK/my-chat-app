"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useMessages } from "@/hooks/use-messages"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/users"

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const [currentOtherUser, setCurrentOtherUser] = useState<User | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  const {
    messages,
    loading: messagesLoading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMore,
    loadingMore,
    connectionStatus, // Added connection status
  } = useMessages(currentConversationId)

  const isConnected = connectionStatus === "connected"

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleConversationSelect = (conversationId: string, otherUser: User) => {
    setCurrentConversationId(conversationId)
    setCurrentOtherUser(otherUser)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleSendMessage = async (content: string) => {
    if (!user || sendingMessage || !currentConversationId) return

    try {
      setSendingMessage(true)
      await sendMessage(content, currentConversationId, user.$id, user.name || "Anonymous")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSendingMessage(false)
    }
  }

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onConversationSelect={handleConversationSelect}
        selectedConversationId={currentConversationId}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {currentOtherUser ? (
          <ChatHeader
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            roomName={currentOtherUser.username}
            onlineCount={currentOtherUser.isOnline ? 1 : 0}
            isConnected={isConnected}
          />
        ) : (
          <div className="border-b border-border/40 p-4 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="text-center flex-1">
                <h2 className="text-lg font-semibold text-foreground">Welcome to Ruvox</h2>
                <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "reconnecting"
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "reconnecting"
                      ? "Reconnecting..."
                      : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === "disconnected" && error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertDescription>
                Connection lost.{" "}
                {error.includes("Max reconnection attempts")
                  ? "Please refresh the page to reconnect."
                  : "Attempting to reconnect..."}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {currentConversationId ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <MessageList
                messages={messages}
                loading={messagesLoading}
                error={error}
                currentUserId={user.$id}
                hasMore={hasMore}
                onLoadMore={loadMoreMessages}
                loadingMore={loadingMore}
              />
            </div>

            <div className="flex-shrink-0 border-t border-border/40 bg-card/50 backdrop-blur-sm">
              <MessageInput onSendMessage={handleSendMessage} disabled={sendingMessage || !user} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
              <p className="text-sm">Choose someone from the sidebar to begin chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
