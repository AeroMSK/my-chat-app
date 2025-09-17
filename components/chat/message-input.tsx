"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Smile } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  return (
    <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled}
            className="pr-12 h-12 rounded-xl border-border/50 bg-input/50 backdrop-blur-sm focus:bg-input focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="shrink-0 h-12 px-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
