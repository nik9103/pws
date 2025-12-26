"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { ApplicationProfile } from "@/components/applications/application-profile"
import { mockApplications } from "@/lib/mock-applications"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CompetitionProfileSkeleton } from "@/components/ui/skeletons"

export default function ApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const applicationId = params.id as string
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const application = mockApplications.find((app) => app.id === applicationId)

  if (!application) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <CompetitionProfileSkeleton />
          <Toaster />
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Заявка не найдена</h1>
            <p className="text-muted-foreground mb-6">Заявка с указанным ID не существует.</p>
            <button
              onClick={() => router.push("/applications")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Вернуться к заявкам
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  const handleReject = (application: any) => {
    // Обновление статуса заявки будет обработано в ApplicationProfile
    toast({
      title: "Заявка отклонена",
      variant: "success",
    })
  }

  const handleAccept = (application: any) => {
    // Обновление статуса заявки будет обработано в ApplicationProfile
    toast({
      title: "Заявка принята",
      variant: "success",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {isLoading ? (
        <CompetitionProfileSkeleton />
      ) : (
        <ApplicationProfile application={application} onReject={handleReject} onAccept={handleAccept} />
      )}
      <Toaster />
    </div>
  )
}

