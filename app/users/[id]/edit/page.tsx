"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { UserEditProfile } from "@/components/users/user-edit-profile"
import { mockUser } from "@/lib/mock-users"
import { EditPageSkeleton } from "@/components/ui/skeletons"
import { Toaster } from "@/components/ui/toaster"

export default function UserEditPage() {
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
      {isLoading ? <EditPageSkeleton /> : <UserEditProfile user={mockUser} />}
      <Toaster />
    </div>
  )
}
