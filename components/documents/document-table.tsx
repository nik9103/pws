"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Download, Trash2, ArrowUpDown, FileSignature, X, Eye, AlertCircle, RotateCcw } from "lucide-react"
import type { Document } from "@/types/document"
import { DocumentIcon } from "./document-icon"
import { StatusBadge } from "./status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface DocumentTableProps {
  documents: Document[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onDocumentClick: (document: Document) => void
  onSign: (document: Document) => void
  onDelete?: (document: Document) => void
  onResign?: (documentIds: string[]) => void
  onClearFilters?: () => void
}

type SortField = "name" | "status" | "athlete" | "competition" | "discipline"
type SortDirection = "asc" | "desc"

// Компонент для текста с автоматическим тултипом при обрезке
function TruncatedText({ text, className }: { text: string; className?: string }) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current
      if (element) {
        setIsTruncated(element.scrollWidth > element.clientWidth)
      }
    }

    checkTruncation()
    
    // Проверяем при изменении размера окна
    const resizeObserver = new ResizeObserver(checkTruncation)
    if (textRef.current) {
      resizeObserver.observe(textRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [text])

  const content = (
    <span ref={textRef} className={cn("block truncate", className)}>
      {text}
    </span>
  )

  if (isTruncated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function DocumentTable({
  documents,
  selectedIds,
  onSelectionChange,
  onDocumentClick,
  onSign,
  onDelete,
  onResign,
  onClearFilters,
}: DocumentTableProps) {
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [resignDialogOpen, setResignDialogOpen] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue: string, bValue: string
    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "athlete":
        aValue = a.athlete.fullName
        bValue = b.athlete.fullName
        break
      case "competition":
        aValue = a.competition
        bValue = b.competition
        break
      case "discipline":
        aValue = a.discipline
        bValue = b.discipline
        break
      default:
        return 0
    }
    const comparison = aValue.localeCompare(bValue, "ru")
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(documents.map((d) => d.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (documentToDelete && onDelete) {
      onDelete(documentToDelete)
    }
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  const handleResignClick = () => {
    setResignDialogOpen(true)
  }

  const handleResignConfirm = () => {
    if (onResign && selectedIds.length > 0) {
      onResign(selectedIds)
    }
    setResignDialogOpen(false)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={cn("h-3.5 w-3.5", sortField === field && "text-foreground")} />
    </button>
  )

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto" style={{ scrollbarGutter: 'stable' }}>
        <table className="w-full" style={{ minWidth: '1024px' }}>
        <thead>
          {selectedIds.length > 0 ? (
            <tr className="border-b bg-accent/50">
              <th className="w-10 px-3 h-[52px]" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <Checkbox checked={selectedIds.length === documents.length} onCheckedChange={handleSelectAll} />
                </div>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '30%', minWidth: '280px' }}>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium whitespace-nowrap">Выбрано: {selectedIds.length}</span>
                  <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap">
                    <Download className="h-4 w-4" />
                    Скачать выбранные
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 whitespace-nowrap" onClick={handleResignClick}>
                    <RotateCcw className="h-4 w-4" />
                    Переподписать
                  </Button>
                </div>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '12%', minWidth: '120px' }}></th>
              <th className="px-4 h-[52px] text-left" style={{ width: '18%', minWidth: '160px' }}></th>
              <th className="px-4 h-[52px] text-left" style={{ width: '20%', minWidth: '180px' }}></th>
              <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '140px' }}></th>
              <th className="h-[52px] px-3 sticky right-0 bg-muted z-20 rounded-tr-lg" style={{ width: '60px', backgroundColor: 'var(--muted)' }}></th>
            </tr>
          ) : (
            <tr className="border-b">
              <th className="w-10 px-3 h-[52px]" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <Checkbox
                    checked={selectedIds.length === documents.length && documents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '30%', minWidth: '280px' }}>
                <SortButton field="name">Документ</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '12%', minWidth: '120px' }}>
                <SortButton field="status">Статус</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '18%', minWidth: '160px' }}>
                <SortButton field="athlete">Спортсмен</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '20%', minWidth: '180px' }}>
                <SortButton field="competition">Соревнование</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '140px' }}>
                <SortButton field="discipline">Дисциплина</SortButton>
              </th>
              <th className="h-[52px] px-3 sticky right-0 bg-card z-20 rounded-tr-lg" style={{ width: '60px' }}></th>
            </tr>
          )}
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-16">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="text-sm">Документы не найдены</EmptyTitle>
                    <EmptyDescription className="whitespace-nowrap">
                      Попробуйте изменить параметры поиска или сбросить фильтры
                    </EmptyDescription>
                    {onClearFilters && (
                      <Button
                        onClick={onClearFilters}
                        variant="outline"
                        className="mt-4 gap-2"
                      >
                        <X className="h-4 w-4" />
                        Очистить
                      </Button>
                    )}
                  </EmptyHeader>
                </Empty>
              </td>
            </tr>
          ) : (
            sortedDocuments.map((doc, index) => (
            <tr
              key={doc.id}
              className={cn(
                "border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer group",
                selectedIds.includes(doc.id) && "bg-accent/30",
              )}
              onClick={() => onDocumentClick(doc)}
            >
              <td className="px-3 py-3" style={{ width: '40px', minWidth: '40px', maxWidth: '40px' }} onClick={(e) => e.stopPropagation()}>
                <div className="w-4 h-4 flex items-center justify-center">
                  <Checkbox checked={selectedIds.includes(doc.id)} onCheckedChange={() => handleSelectOne(doc.id)} />
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '30%', minWidth: '280px' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <DocumentIcon status={doc.status} className="flex-shrink-0" />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <TruncatedText text={doc.name} className="font-medium text-sm" />
                    <div className="text-xs text-muted-foreground truncate">
                      {doc.type} {doc.date && `• ${doc.date}`} • {doc.size}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '12%', minWidth: '120px' }}>
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '18%', minWidth: '160px' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
                    {doc.athlete.initials}
                  </span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <TruncatedText text={doc.athlete.fullName} className="text-sm" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '20%', minWidth: '180px' }}>
                <div className="min-w-0 overflow-hidden">
                  <TruncatedText text={doc.competition} className="text-sm" />
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '15%', minWidth: '140px' }}>
                <div className="min-w-0 overflow-hidden">
                  <TruncatedText text={doc.discipline} className="text-sm" />
                </div>
              </td>
              <td 
                className={cn(
                  "px-3 py-3 sticky right-0 z-20 transition-colors",
                  selectedIds.includes(doc.id) 
                    ? "bg-muted group-hover:bg-muted" 
                    : "bg-card group-hover:bg-accent/20",
                  index === sortedDocuments.length - 1 && "rounded-br-lg"
                )} 
                style={{ 
                  width: '60px'
                }} 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {doc.status === "signed" ? (
                        <>
                          <DropdownMenuItem onClick={() => onDocumentClick(doc)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Посмотреть
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Скачать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(doc)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Переподписать
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => onSign(doc)}>
                            <FileSignature className="h-4 w-4 mr-2" />
                            Подписать
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Скачать
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Переподписать документ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Текущий скан документа будет удалён, и документ вернётся в статус «Не подписан». После этого его потребуется подписать повторно. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Переподписать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resignDialogOpen} onOpenChange={setResignDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Переподписать выбранные документы?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Текущие сканы выбранных документов будут удалены, и документы вернутся в статус «Не подписан». После этого их потребуется подписать повторно. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResignConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Переподписать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
