"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { CompetitionProfile } from "@/components/competitions/competition-profile"
import { mockCompetitions } from "@/lib/mock-competitions"
import { useParams, useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import type { Competition } from "@/types/competition"
import { CompetitionProfileSkeleton } from "@/components/ui/skeletons"

export default function CompetitionPage() {
  const params = useParams()
  const router = useRouter()
  const competitionId = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const competition = competitions.find((comp) => comp.id === competitionId)

  if (!competition) {
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
            <h1 className="text-2xl font-semibold mb-2">Соревнование не найдено</h1>
            <p className="text-muted-foreground mb-6">Соревнование с указанным ID не существует.</p>
            <button
              onClick={() => router.push("/competitions")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Вернуться к соревнованиям
            </button>
          </div>
        </div>
        <Toaster />
      </div>
    )
  }

  const handleDelete = (competitionToDelete: Competition) => {
    setCompetitions((prevComps) => prevComps.filter((c) => c.id !== competitionToDelete.id))
  }

  const handleEdit = (competitionToEdit: Competition) => {
    router.push(`/competitions/${competitionToEdit.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {isLoading ? (
        <CompetitionProfileSkeleton />
      ) : (
        <CompetitionProfile competition={competition} onDelete={handleDelete} onEdit={handleEdit} />
      )}
      <Toaster />
    </div>
  )
}

