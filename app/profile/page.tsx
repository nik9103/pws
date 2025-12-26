"use client"

import { Header } from "@/components/layout/header"
import { MyProfile } from "@/components/users/my-profile"
import { Toaster } from "@/components/ui/toaster"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MyProfile />
      <Toaster />
    </div>
  )
}


