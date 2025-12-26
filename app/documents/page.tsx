"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { DocumentFilters } from "@/components/documents/document-filters"
import { DocumentTable } from "@/components/documents/document-table"
import { Pagination } from "@/components/documents/pagination"
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal"
import { mockDocuments } from "@/lib/mock-documents"
import type { Document, FilterState } from "@/types/document"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { TableSkeleton, FiltersSkeleton, PageHeaderSkeleton, PaginationSkeleton } from "@/components/ui/skeletons"

export default function DocumentsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    period: {},
    athletes: [],
    competitions: [],
    disciplines: [],
    statuses: [],
    documentTypes: [],
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSigningPanel, setShowSigningPanel] = useState(false)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search filter - поиск по названию, типу, фамилии спортсмена и соревнованию
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesName = doc.name.toLowerCase().includes(searchLower)
        const matchesType = doc.type.toLowerCase().includes(searchLower)
        const matchesAthlete = doc.athlete.fullName.toLowerCase().includes(searchLower)
        const matchesCompetition = doc.competition.toLowerCase().includes(searchLower)
        
        if (!matchesName && !matchesType && !matchesAthlete && !matchesCompetition) {
          return false
        }
      }
      // Period filter
      if (filters.period.from || filters.period.to) {
        if (!doc.date) return false
        
        // Parse date string like "15 янв. 2025" to Date
        const monthMap: { [key: string]: number } = {
          "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
          "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11
        }
        
        const parts = doc.date.split(' ')
        const day = parseInt(parts[0])
        const monthKey = parts[1].replace('.', '')
        const year = parseInt(parts[2])
        const month = monthMap[monthKey]
        
        if (month === undefined) return false
        
        const docDate = new Date(year, month, day)
        
        if (filters.period.from) {
          const fromDate = new Date(filters.period.from)
          fromDate.setHours(0, 0, 0, 0)
          if (docDate < fromDate) return false
        }
        
        if (filters.period.to) {
          const toDate = new Date(filters.period.to)
          toDate.setHours(23, 59, 59, 999)
          if (docDate > toDate) return false
        }
      }
      // Athletes filter
      if (filters.athletes.length > 0 && !filters.athletes.includes(doc.athlete.fullName)) {
        return false
      }
      // Competitions filter
      if (filters.competitions.length > 0 && !filters.competitions.includes(doc.competition)) {
        return false
      }
      // Disciplines filter
      if (filters.disciplines.length > 0 && !filters.disciplines.includes(doc.discipline)) {
        return false
      }
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(doc.status)) {
        return false
      }
      // Document type filter
      if (filters.documentTypes.length > 0 && !filters.documentTypes.includes(doc.type)) {
        return false
      }
      return true
    })
  }, [documents, filters])

  const totalPages = Math.ceil(filteredDocuments.length / pageSize)
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
    setShowSigningPanel(document.status === "unsigned")
    setIsModalOpen(true)
  }

  const handleSign = (document: Document) => {
    setSelectedDocument(document)
    setShowSigningPanel(true)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDocument(null)
    setShowSigningPanel(false)
  }

  const handleDocumentSigned = (documentId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === documentId
          ? { ...doc, status: "signed" as const }
          : doc
      )
    )
    
    toast({
      title: "Документ подписан",
      variant: "success",
    })
    
    handleCloseModal()
  }

  const handleDelete = (document: Document) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.id === document.id
          ? { ...doc, status: "unsigned" as const }
          : doc
      )
    )
    
    toast({
      title: "Подпись документа сброшена",
      variant: "success",
    })
  }

  const handleResign = (documentIds: string[]) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        documentIds.includes(doc.id)
          ? { ...doc, status: "unsigned" as const }
          : doc
      )
    )
    
    setSelectedIds([])
    
    toast({
      title: "Документы переподписаны",
      variant: "success",
    })
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      period: {},
      athletes: [],
      competitions: [],
      disciplines: [],
      statuses: [],
      documentTypes: [],
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
              Документы
              <span className="text-sm font-normal px-2.5 py-1 bg-muted rounded-md text-muted-foreground">
                {filteredDocuments.length}
              </span>
            </h1>
          </div>
        )}

        <div className="mb-6">
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
            <DocumentFilters filters={filters} onFiltersChange={setFilters} totalDocuments={filteredDocuments.length} />
          )}
        </div>

        {isLoading ? (
          <TableSkeleton rows={pageSize} cols={8} />
        ) : (
        <DocumentTable
          documents={paginatedDocuments}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDocumentClick={handleDocumentClick}
          onSign={handleSign}
          onDelete={handleDelete}
          onResign={handleResign}
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
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        )}
      </main>

      <DocumentPreviewModal
        document={selectedDocument}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        showSigningPanel={showSigningPanel}
        onDocumentSigned={selectedDocument ? () => handleDocumentSigned(selectedDocument.id) : undefined}
      />
      <Toaster />
    </div>
  )
}
