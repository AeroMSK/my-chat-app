"use client"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, LogOut, X, MessageCircle } from "lucide-react"
import { ConversationSelector } from "./conversation-selector"
import type { User } from "@/lib/users"
import { useRouter } from "next/navigation"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onConversationSelect: (conversationId: string, otherUser: User) => void
  selectedConversationId?: string
}

export function Sidebar({ isOpen, onToggle, onConversationSelect, selectedConversationId }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />}

      <div
        className={`fixed left-0 top-0 h-full w-80 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 z-50 transform transition-all duration-300 ease-out shadow-2xl lg:relative lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50">
            <div>
              <h1 className="text-2xl font-brand text-primary">Ruvox</h1>
              <div className="flex items-center gap-2 mt-1">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-sidebar-foreground/70 font-medium">Stay Connected, Always</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden hover:bg-sidebar-accent/10">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 border-b border-sidebar-border/50">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage src={`/generic-user-avatar.png`} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-sidebar-foreground truncate">{user?.name || "User"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm text-sidebar-foreground/70 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <ConversationSelector
                onConversationSelect={onConversationSelect}
                selectedConversationId={selectedConversationId}
              />
            </ScrollArea>
          </div>

          <div className="p-6 border-t border-sidebar-border/50">
            <div className="flex gap-3 mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start hover:bg-sidebar-accent/10"
                onClick={handleSettings}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center">
              <p className="text-xs text-sidebar-foreground/50">
                Developed by <span className="font-semibold text-primary">Musa Khan</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
