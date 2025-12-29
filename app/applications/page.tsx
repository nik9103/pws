"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { ApplicationFilters } from "@/components/applications/application-filters"
import { ApplicationTable } from "@/components/applications/application-table"
import { Pagination } from "@/components/documents/pagination"
import { mockApplications } from "@/lib/mock-applications"
import type { Application, ApplicationFilterState } from "@/types/application"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { TableSkeleton, FiltersSkeleton, PageHeaderSkeleton, PaginationSkeleton } from "@/components/ui/skeletons"

export default function ApplicationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>(mockApplications)
  const [filters, setFilters] = useState<ApplicationFilterState>({
    search: "",
    period: {},
    athletes: [],
    competitions: [],
    statuses: [],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Search filter - поиск по ID заявки, имени спортсмена и названию соревнования
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesId = app.applicationId.toLowerCase().includes(searchLower)
        const matchesAthlete = app.athlete.fullName.toLowerCase().includes(searchLower)
        const matchesCompetition = app.competition.name.toLowerCase().includes(searchLower)
        
        if (!matchesId && !matchesAthlete && !matchesCompetition) {
          return false
        }
      }
      
      // Period filter
      if (filters.period.from || filters.period.to) {
        if (!app.submissionDate) return false
        
        // Parse date string like "12 янв. 2025" to Date
        const monthMap: { [key: string]: number } = {
          "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
          "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11
        }
        
        const parts = app.submissionDate.split(' ')
        const day = parseInt(parts[0])
        const monthKey = parts[1].replace('.', '')
        const year = parseInt(parts[2])
        const month = monthMap[monthKey]
        
        if (month === undefined) return false
        
        const appDate = new Date(year, month, day)
        
        if (filters.period.from) {
          const fromDate = new Date(filters.period.from)
          fromDate.setHours(0, 0, 0, 0)
          if (appDate < fromDate) return false
        }
        
        if (filters.period.to) {
          const toDate = new Date(filters.period.to)
          toDate.setHours(23, 59, 59, 999)
          if (appDate > toDate) return false
        }
      }
      
      // Athletes filter
      if (filters.athletes.length > 0 && !filters.athletes.includes(app.athlete.fullName)) {
        return false
      }
      
      // Competitions filter
      if (filters.competitions.length > 0 && !filters.competitions.includes(app.competition.name)) {
        return false
      }
      
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) {
        return false
      }
      
      return true
    })
  }, [applications, filters])

  const totalPages = Math.ceil(filteredApplications.length / pageSize)
  const paginatedApplications = filteredApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleApplicationClick = (application: Application) => {
    window.location.href = `/applications/${application.id}`
  }

  const handleAccept = (application: Application) => {
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === application.id ? { ...app, status: "accepted" as const } : app
      )
    )
    
    toast({
      title: "Заявка принята",
      variant: "success",
    })
  }

  const handleReject = (application: Application) => {
    setApplications((prevApps) =>
      prevApps.map((app) =>
        app.id === application.id ? { ...app, status: "rejected" as const } : app
      )
    )
    
    toast({
      title: "Заявка отклонена",
      variant: "success",
    })
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      period: {},
      athletes: [],
      competitions: [],
      statuses: [],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-6 py-6">
        {isLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              Заявки на участие
              <span className="text-sm font-normal px-2.5 py-1 bg-muted rounded-md text-muted-foreground">
                {filteredApplications.length}
              </span>
            </h1>
          </div>
        )}

        <div className="mb-6">
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
            <ApplicationFilters filters={filters} onFiltersChange={setFilters} totalApplications={filteredApplications.length} />
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={pageSize} cols={7} />
        ) : (
          <ApplicationTable
            applications={paginatedApplications}
            onApplicationClick={handleApplicationClick}
            onAccept={handleAccept}
            onReject={handleReject}
            onClearFilters={handleClearFilters}
          />
        )}

        {isLoading ? (
          <PaginationSkeleton />
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            pageSize={pageSize}
            totalItems={filteredApplications.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        )}
      </main>

      <Toaster />
    </div>
  )
}

