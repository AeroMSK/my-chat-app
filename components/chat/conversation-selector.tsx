"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUsers } from "@/hooks/use-users"
import { useConversations } from "@/hooks/use-conversations"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, RefreshCw, Plus } from "lucide-react"
import type { User } from "@/lib/users"
import type { Conversation } from "@/lib/conversations"
import { UserService } from "@/lib/users"

interface ConversationSelectorProps {
  onConversationSelect: (conversationId: string, otherUser: User) => void
  selectedConversationId?: string
}

export function ConversationSelector({ onConversationSelect, selectedConversationId }: ConversationSelectorProps) {
  const { user } = useAuth()
  const { users, refetch } = useUsers()
  const { conversations, createOrGetConversation } = useConversations()
  const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations")
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreatingCurrentUser, setIsCreatingCurrentUser] = useState(false)

  useEffect(() => {
    const testDatabase = async () => {
      try {
        console.log("[v0] Testing database connection from ConversationSelector...")
        await UserService.testDatabaseConnection()
        console.log("[v0] Database test completed successfully")
      } catch (error) {
        console.error("[v0] Database test failed:", error)
      }
    }

    if (activeTab === "users") {
      testDatabase()
    }
  }, [activeTab])

  console.log("[v0] ConversationSelector Debug Info:")
  console.log("[v0] Current user:", user?.$id)
  console.log("[v0] All users loaded:", users.length)
  console.log("[v0] Users data:", users)
  console.log(
    "[v0] Filtered users (excluding current):",
    users.filter((u) => u.userId !== user?.$id),
  )

  const createTestUser = async () => {
    if (!user) return

    setIsCreatingTestUser(true)
    try {
      console.log("[v0] Creating test user manually...")

      // Create a test user entry
      const testUserData = {
        userId: `test-${Date.now()}`,
        username: `TestUser${Math.floor(Math.random() * 1000)}`,
        email: `test${Math.floor(Math.random() * 1000)}@example.com`,
      }

      console.log("[v0] Test user data:", testUserData)

      const createdUser = await UserService.createOrUpdateUser(testUserData)
      console.log("[v0] Test user created successfully:", createdUser)

      // Refresh the users list
      await refetch()

      alert("Test user created successfully! Check the console for details.")
    } catch (error) {
      console.error("[v0] Failed to create test user:", error)
      alert(`Failed to create test user: ${error.message}`)
    } finally {
      setIsCreatingTestUser(false)
    }
  }

  const createCurrentUserProfile = async () => {
    if (!user) return

    setIsCreatingCurrentUser(true)
    try {
      console.log("[v0] Manually creating current user profile...")
      console.log("[v0] Current user data:", {
        id: user.$id,
        name: user.name,
        email: user.email,
      })

      const createdUser = await UserService.createOrUpdateUser({
        userId: user.$id,
        username: user.name,
        email: user.email,
      })
      console.log("[v0] Current user profile created successfully:", createdUser)

      // Refresh the users list
      await refetch()

      alert("Current user profile created successfully! Check the console for details.")
    } catch (error) {
      console.error("[v0] Failed to create current user profile:", error)
      alert(`Failed to create current user profile: ${error.message}`)
    } finally {
      setIsCreatingCurrentUser(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log("[v0] Manually refreshing users...")
      await refetch()
      console.log("[v0] Users refreshed successfully")
    } catch (error) {
      console.error("[v0] Failed to refresh users:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

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
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex-1 bg-transparent"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh Users
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={createTestUser}
                  disabled={isCreatingTestUser}
                  className="flex-1 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isCreatingTestUser ? "Creating..." : "Create Test User"}
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={createCurrentUserProfile}
                disabled={isCreatingCurrentUser}
                className="w-full bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreatingCurrentUser ? "Creating..." : "Create My Profile"}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded mb-2 space-y-1">
              <p className="font-medium">Debug Info:</p>
              <p>Total users loaded: {users.length}</p>
              <p>Current user ID: {user?.$id}</p>
              <p>Filtered users: {users.filter((u) => u.userId !== user?.$id).length}</p>
              <p className="text-orange-600">Check browser console (F12) for detailed logs</p>
              {users.length > 0 && (
                <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                  <p className="font-medium mb-2">Sample user data:</p>
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(users[0], null, 2)}</pre>
                </div>
              )}
            </div>

            {users.filter((u) => u.userId !== user?.$id).length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No other users online</p>
                <p className="text-sm">Create another account to test messaging!</p>
                <div className="mt-4 p-3 bg-muted/30 rounded text-xs text-left">
                  <p className="font-medium mb-2">Troubleshooting:</p>
                  <ul className="space-y-1 text-left">
                    <li>1. Try the "Create Test User" button above</li>
                    <li>2. Check browser console for errors</li>
                    <li>3. Verify Appwrite database connection</li>
                    <li>4. Ensure users are being created during registration</li>
                    <li>5. Check database permissions in Appwrite console</li>
                  </ul>
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
