"use client"

import { useEffect, useRef, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MessageBubble } from "./message-bubble"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Message } from "@/lib/messages"

interface MessageListProps {
  messages: Message[]
  loading?: boolean
  error?: string | null
  currentUserId: string
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
}

export function MessageList({
  messages,
  loading = false,
  error,
  currentUserId,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(messages.length)
  const hasInitialScrolled = useRef(false)

  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolled.current && !loading) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "instant" })
        hasInitialScrolled.current = true
      }, 100)
    }
  }, [messages.length, loading])

  // Auto-scroll to bottom when new messages arrive (but not when loading older messages)
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && hasInitialScrolled.current) {
      // Only scroll if we're adding messages to the end (new messages)
      const newMessagesCount = messages.length - lastMessageCountRef.current
      const lastMessages = messages.slice(-newMessagesCount)
      const hasNewMessage = lastMessages.some(
        (msg) => msg.userId === currentUserId || new Date(msg.createdAt).getTime() > Date.now() - 5000,
      ) // Recent message from others

      if (hasNewMessage) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
    lastMessageCountRef.current = messages.length
  }, [messages, currentUserId])

  // Intersection Observer for auto-loading more messages when scrolling to top
  const handleScroll = useCallback(() => {
    if (!hasMore || loadingMore || !onLoadMore) return

    const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (!scrollElement) return

    // Check if user scrolled near the top
    if (scrollElement.scrollTop < 100) {
      onLoadMore()
    }
  }, [hasMore, loadingMore, onLoadMore])

  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (!scrollElement) return

    scrollElement.addEventListener("scroll", handleScroll)
    return () => scrollElement.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading messages...
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
      <div className="p-4">
        <div ref={topRef} />

        {error && (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Load more button and loading indicator */}
        {(hasMore || loadingMore) && (
          <div className="p-4 text-center">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading older messages...
              </div>
            ) : (
              hasMore &&
              onLoadMore && (
                <Button variant="outline" onClick={onLoadMore} size="sm">
                  Load older messages
                </Button>
              )
            )}
          </div>
        )}

        {messages.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble key={message.$id} message={message} currentUserId={currentUserId} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
