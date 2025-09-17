"use client"

import { useState, useEffect } from "react"
import { UserService, type User } from "@/lib/users"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const onlineUsers = await UserService.getOnlineUsers()
      setUsers(onlineUsers)
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()

    const interval = setInterval(fetchUsers, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  }
}
