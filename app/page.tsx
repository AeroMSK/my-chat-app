"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/chat")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-violet-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="text-center space-y-8 max-w-2xl relative z-10">
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-brand gradient-text">RUVOX</h1>
          <p className="text-xl md:text-2xl text-primary font-semibold tracking-wide">STAY CONNECTED, ALWAYS</p>
          <p className="text-sm text-muted-foreground/80">Developed by Musa Khan</p>
        </div>

        <p className="text-lg md:text-xl text-foreground/90 font-medium leading-relaxed">
          HIGH-IMPACT REAL-TIME MESSAGING FOR MODERN TEAMS
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
          >
            <Link href="/login">Chat With Us</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-primary/50 hover:border-primary text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300 bg-transparent"
          >
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
