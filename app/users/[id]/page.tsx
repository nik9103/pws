"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { UserProfile } from "@/components/users/user-profile"
import { mockUser } from "@/lib/mock-users"
import { UserProfileSkeleton } from "@/components/ui/skeletons"
import { Toaster } from "@/components/ui/toaster"

export default function UserPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {isLoading ? <UserProfileSkeleton /> : <UserProfile user={mockUser} />}
      <Toaster />
    </div>
  )
}
