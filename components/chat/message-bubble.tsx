"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { Message } from "@/lib/messages"

interface MessageBubbleProps {
  message: Message
  currentUserId: string
}

export function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const { username, content, $createdAt, userId } = message
  const isOwn = userId === currentUserId

  return (
    <div
      className={`flex gap-4 px-6 py-3 ${isOwn ? "flex-row-reverse" : "flex-row"} group hover:bg-muted/30 transition-colors`}
    >
      {!isOwn && (
        <Avatar className="w-10 h-10 ring-2 ring-border/50">
          <AvatarImage src={`/generic-user-avatar.png?height=40&width=40&query=user avatar for ${username}`} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col gap-2 max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && <span className="text-sm font-semibold text-foreground/80 px-1">{username}</span>}

        <div
          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md shadow-primary/20"
              : "bg-card text-card-foreground border border-border/50 rounded-bl-md shadow-md"
          }`}
        >
          <p className="text-sm leading-relaxed font-medium">{content}</p>
        </div>

        <span
          className={`text-xs text-muted-foreground/70 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "text-right" : "text-left"}`}
        >
          {formatDistanceToNow(new Date($createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
