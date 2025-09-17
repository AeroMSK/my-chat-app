"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, Users, Phone, Video, MoreVertical, Wifi, WifiOff } from "lucide-react"

interface ChatHeaderProps {
  onMenuToggle: () => void
  roomName: string
  onlineCount: number
  isConnected?: boolean
}

export function ChatHeader({ onMenuToggle, roomName, onlineCount, isConnected = true }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onMenuToggle} className="lg:hidden hover:bg-accent/10">
          <Menu className="h-4 w-4" />
        </Button>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-lg text-card-foreground font-sans">{roomName}</h2>
            {isConnected ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">{onlineCount} members online</span>
            {isConnected && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                Live
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent">
          <Users className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent/10 hover:text-accent">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
