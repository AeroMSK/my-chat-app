"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUsers } from "@/hooks/use-users"
import { useConversations } from "@/hooks/use-conversations"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users } from "lucide-react"
import type { User } from "@/lib/users"
import type { Conversation } from "@/lib/conversations"

interface ConversationSelectorProps {
  onConversationSelect: (conversationId: string, otherUser: User) => void
  selectedConversationId?: string
}

export function ConversationSelector({ onConversationSelect, selectedConversationId }: ConversationSelectorProps) {
  const { user } = useAuth()
  const { users } = useUsers()
  const { conversations, createOrGetConversation } = useConversations()
  const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations")

  console.log("[v0] ConversationSelector - Current user:", user?.$id)
  console.log("[v0] ConversationSelector - All users:", users.length)
  console.log(
    "[v0] ConversationSelector - Users data:",
    users.map((u) => ({
      username: u.username,
      userId: u.userId,
      isOnline: u.isOnline,
    })),
  )

  const handleUserSelect = async (selectedUser: User) => {
    if (!user || selectedUser.userId === user.$id) return

    const conversation = await createOrGetConversation(selectedUser.userId)
    if (conversation) {
      onConversationSelect(conversation.$id, selectedUser)
    }
  }

  const getOtherUser = (conversation: Conversation): User | undefined => {
    if (!user) return undefined
    let participants: string[]
    try {
      participants = JSON.parse(conversation.participants)
    } catch (error) {
      console.error("Failed to parse participants:", error)
      return undefined
    }
    const otherUserId = participants.find((p) => p !== user.$id)
    return users.find((u) => u.userId === otherUserId)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-border/40">
        <Button
          variant={activeTab === "conversations" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("conversations")}
          className="flex-1 rounded-none"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chats
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("users")}
          className="flex-1 rounded-none"
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "conversations" ? (
          <div className="space-y-1 p-2">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start chatting with someone!</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation)
                if (!otherUser) return null

                return (
                  <Button
                    key={conversation.$id}
                    variant={selectedConversationId === conversation.$id ? "secondary" : "ghost"}
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => onConversationSelect(conversation.$id, otherUser)}
                  >
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={`/generic-user-avatar.png`} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
                        {otherUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{otherUser.username}</span>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      )}
                    </div>
                  </Button>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {console.log(
              "[v0] Rendering users tab, filtered users:",
              users.filter((u) => u.userId !== user?.$id).length,
            )}

            {users.filter((u) => u.userId !== user?.$id).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No other users online</p>
                <p className="text-sm">Create another account to test messaging!</p>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
                  <p>
                    <strong>Debug Info:</strong>
                  </p>
                  <p>Total users loaded: {users.length}</p>
                  <p>Current user ID: {user?.$id}</p>
                  <p>Check browser console for more details</p>
                </div>
              </div>
            ) : (
              users
                .filter((u) => u.userId !== user?.$id)
                .map((selectedUser) => (
                  <Button
                    key={selectedUser.$id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto"
                    onClick={() => handleUserSelect(selectedUser)}
                  >
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={`/generic-user-avatar.png`} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-violet-500 text-white">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedUser.username}</span>
                        {selectedUser.isOnline && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
                            Online
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </Button>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
