"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { CompetitionFilters } from "@/components/competitions/competition-filters"
import { CompetitionTable } from "@/components/competitions/competition-table"
import { Pagination } from "@/components/competitions/pagination"
import { mockCompetitions } from "@/lib/mock-competitions"
import type { Competition, CompetitionFilterState } from "@/types/competition"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompetitionTableRowSkeleton, FiltersSkeleton, PageHeaderSkeleton, PaginationSkeleton } from "@/components/ui/skeletons"

export default function CompetitionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions)
  const [filters, setFilters] = useState<CompetitionFilterState>({
    search: "",
    period: {},
    disciplines: [],
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

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      // Search filter - поиск по названию
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = comp.name.toLowerCase().includes(searchLower)
        
        if (!matchesName) {
          return false
        }
      }

      // Period filter
      if (filters.period.from || filters.period.to) {
        const compStartDate = parseDate(comp.startDate)
        const compEndDate = parseDate(comp.endDate)
        
        if (filters.period.from) {
          const fromDate = new Date(filters.period.from)
          fromDate.setHours(0, 0, 0, 0)
          // Проверяем, пересекается ли период соревнования с фильтром
          if (compEndDate < fromDate.getTime()) return false
        }
        
        if (filters.period.to) {
          const toDate = new Date(filters.period.to)
          toDate.setHours(23, 59, 59, 999)
          // Проверяем, пересекается ли период соревнования с фильтром
          if (compStartDate > toDate.getTime()) return false
        }
      }

      // Disciplines filter
      if (filters.disciplines.length > 0 && !filters.disciplines.includes(comp.discipline)) {
        return false
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(comp.status)) {
        return false
      }

      return true
    })
  }, [competitions, filters])

  const totalPages = Math.ceil(filteredCompetitions.length / pageSize)
  const paginatedCompetitions = filteredCompetitions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleCompetitionClick = (competition: Competition) => {
    router.push(`/competitions/${competition.id}`)
  }

  const handleEdit = (competition: Competition) => {
    toast({
      title: "Редактирование соревнования",
      description: `Редактирование соревнования: ${competition.name}`,
    })
  }

  const handleDelete = (competition: Competition) => {
    setCompetitions((prevComps) => prevComps.filter((c) => c.id !== competition.id))
    
    toast({
      title: "Соревнование удалено",
      variant: "success",
    })
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      period: {},
      disciplines: [],
      statuses: [],
    })
  }

  const handleAddCompetition = () => {
    router.push("/competitions/new")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-6 py-6">
        {isLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              Соревнования
              <span className="text-sm font-normal px-2.5 py-1 bg-muted rounded-md text-muted-foreground">
                {filteredCompetitions.length}
              </span>
            </h1>
            <Button onClick={handleAddCompetition} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Добавить соревнование
            </Button>
          </div>
        )}

        <div className="mb-6">
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
            <CompetitionFilters filters={filters} onFiltersChange={setFilters} totalCompetitions={filteredCompetitions.length} />
          )}
        </div>

        {isLoading ? (
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto" style={{ scrollbarGutter: 'stable' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <th key={i} className="px-4 h-[52px] text-left">
                        <div className="h-4 w-20 bg-accent animate-pulse rounded-md" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <CompetitionTableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <CompetitionTable
            competitions={paginatedCompetitions}
            onCompetitionClick={handleCompetitionClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
            totalItems={filteredCompetitions.length}
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

// Функция для парсинга даты формата "15.01.2024"
function parseDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('.').map(Number)
  return new Date(year, month - 1, day).getTime()
}

