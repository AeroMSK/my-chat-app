"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, User, Mail, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view settings</h1>
          <Button onClick={() => router.push("/")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/chat")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and preferences</p>
          </div>
        </div>

        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-green-400" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-400">Your account details and personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 ring-2 ring-green-400/30">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback className="bg-green-400 text-black text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                <p className="text-gray-400">Active user</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Full Name</span>
                </div>
                <p className="text-white font-medium pl-6">{user.name || "Not provided"}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">Email Address</span>
                </div>
                <p className="text-white font-medium pl-6">{user.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <p className="text-white font-medium pl-6">
                  {new Date(user.$createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-green-400 font-medium pl-6">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">More Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Additional settings and preferences will be available here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 italic">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
