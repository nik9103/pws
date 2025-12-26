"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, ArrowUpDown, X, AlertCircle, Pen, Trash2, Calendar, Clock, Archive, Tag } from "lucide-react"
import type { Competition } from "@/types/competition"
import { StatusBadge } from "@/components/documents/status-badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CompetitionTableProps {
  competitions: Competition[]
  onCompetitionClick?: (competition: Competition) => void
  onEdit?: (competition: Competition) => void
  onDelete?: (competition: Competition) => void
  onClearFilters?: () => void
}

type SortField = "name" | "discipline" | "participants" | "judges" | "status" | "startDate" | "endDate"
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

export function CompetitionTable({
  competitions,
  onCompetitionClick,
  onEdit,
  onDelete,
  onClearFilters,
}: CompetitionTableProps) {
  const { toast } = useToast()
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [competitionForStatusChange, setCompetitionForStatusChange] = useState<Competition | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<"ongoing" | "completed" | "planned" | null>(null)
  const [competitionsState, setCompetitionsState] = useState<Competition[]>(competitions)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedCompetitions = [...competitionsState].sort((a, b) => {
    if (!sortField) return 0

    let aValue: string | number, bValue: string | number
    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "discipline":
        aValue = a.discipline
        bValue = b.discipline
        break
      case "participants":
        aValue = a.participants?.length || 0
        bValue = b.participants?.length || 0
        break
      case "judges":
        aValue = a.judges?.length || 0
        bValue = b.judges?.length || 0
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "startDate":
        // Парсим дату формата "15.01.2024"
        aValue = parseDate(a.startDate)
        bValue = parseDate(b.startDate)
        break
      case "endDate":
        aValue = parseDate(a.endDate)
        bValue = parseDate(b.endDate)
        break
      default:
        return 0
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, "ru")
      return sortDirection === "asc" ? comparison : -comparison
    } else {
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      return sortDirection === "asc" ? comparison : -comparison
    }
  })

  const handleDeleteClick = (comp: Competition) => {
    setCompetitionToDelete(comp)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (competitionToDelete && onDelete) {
      onDelete(competitionToDelete)
    }
    setDeleteDialogOpen(false)
    setCompetitionToDelete(null)
  }

  const handleOpenStatusDialog = (comp: Competition) => {
    setCompetitionForStatusChange(comp)
    setSelectedStatus(comp.status)
    setStatusChangeDialogOpen(true)
  }

  const handleStatusChangeConfirm = () => {
    if (competitionForStatusChange && selectedStatus && selectedStatus !== competitionForStatusChange.status) {
      setCompetitionsState((prev) =>
        prev.map((comp) =>
          comp.id === competitionForStatusChange.id ? { ...comp, status: selectedStatus } : comp
        )
      )
      toast({
        title: "Статус изменен",
        description: `Статус соревнования изменен на "${getStatusLabel(selectedStatus)}"`,
        variant: "success",
      })
    }
    setStatusChangeDialogOpen(false)
    setCompetitionForStatusChange(null)
    setSelectedStatus(null)
  }

  const handleStatusDialogClose = () => {
    setStatusChangeDialogOpen(false)
    setCompetitionForStatusChange(null)
    setSelectedStatus(null)
  }

  const getStatusLabel = (status: "ongoing" | "completed" | "planned"): string => {
    const labels = {
      planned: "Запланировано",
      ongoing: "Уже идет",
      completed: "Завершено",
    }
    return labels[status]
  }

  // Обновляем состояние при изменении competitions из props
  useEffect(() => {
    setCompetitionsState(competitions)
  }, [competitions])

  const formatDate = (dateString: string): string => {
    // Если дата уже в формате "DD MMM. YYYY", возвращаем как есть
    if (dateString.includes(' ') && dateString.includes('.')) {
      return dateString
    }
    
    // Парсим формат "DD.MM.YYYY"
    const parts = dateString.split('.')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)
      const year = parts[2]
      
      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек']
      const monthName = months[month - 1]
      
      return `${day} ${monthName}. ${year}`
    }
    
    return dateString
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
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 h-[52px] text-left" style={{ width: '64px' }}>
                <span className="text-sm font-medium text-muted-foreground">ID</span>
              </th>
              <th className="px-4 h-[52px] text-left table-col-fill">
                <SortButton field="name">Название</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left table-col-fill">
                <SortButton field="discipline">Дисциплина</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                <SortButton field="participants">Участников</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>
                <SortButton field="judges">Судий</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '164px', minWidth: '164px', maxWidth: '164px' }}>
                <SortButton field="startDate">Дата начала</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: '164px', minWidth: '164px', maxWidth: '164px' }}>
                <SortButton field="endDate">Дата окончания</SortButton>
              </th>
              <th className="px-4 h-[52px] text-left" style={{ width: 'auto' }}>
                <SortButton field="status">Статус</SortButton>
              </th>
              <th className="h-[52px] px-3 sticky right-0 bg-card z-20 rounded-tr-lg" style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {competitions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle className="text-sm">Соревнования не найдены</EmptyTitle>
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
              sortedCompetitions.map((comp, index) => {
                const currentComp = competitionsState.find(c => c.id === comp.id) || comp
                return (
                  <tr
                    key={comp.id}
                    className={cn(
                      "border-b last:border-b-0 hover:bg-accent/20 transition-colors group",
                      onCompetitionClick && "cursor-pointer",
                    )}
                    onClick={() => onCompetitionClick?.(comp)}
                  >
                    <td className="px-4 py-3" style={{ width: '64px' }}>
                      <span className="text-sm text-muted-foreground">{comp.id}</span>
                    </td>
                    <td className="px-4 py-3 overflow-hidden table-col-fill">
                      <div className="min-w-0">
                        <TruncatedText text={comp.name} className="font-medium text-sm text-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3 overflow-hidden table-col-fill">
                      <div className="min-w-0">
                        <TruncatedText text={comp.discipline} className="text-sm text-muted-foreground" />
                      </div>
                    </td>
                    <td className="px-4 py-3 overflow-hidden" style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }}>
                      <TruncatedText text={(comp.participants?.length || 0).toString()} className="text-sm text-muted-foreground" />
                    </td>
                    <td className="px-4 py-3 overflow-hidden" style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>
                      <TruncatedText text={(comp.judges?.length || 0).toString()} className="text-sm text-muted-foreground" />
                    </td>
                    <td className="px-4 py-3 overflow-hidden" style={{ width: '164px', minWidth: '164px', maxWidth: '164px' }}>
                      <TruncatedText text={formatDate(comp.startDate)} className="text-sm text-muted-foreground" />
                    </td>
                    <td className="px-4 py-3 overflow-hidden" style={{ width: '164px', minWidth: '164px', maxWidth: '164px' }}>
                      <TruncatedText text={formatDate(comp.endDate)} className="text-sm text-muted-foreground" />
                    </td>
                    <td className="px-4 py-3 overflow-hidden" style={{ width: 'auto' }}>
                      <StatusBadge status={currentComp.status} />
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3 sticky right-0 z-20 transition-colors",
                        "bg-card group-hover:bg-accent/20",
                        index === sortedCompetitions.length - 1 && "rounded-br-lg"
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
                            <DropdownMenuItem onClick={() => onEdit?.(comp)}>
                              <Pen className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenStatusDialog(comp)}>
                              <Tag className="h-4 w-4 mr-2" />
                              Изменить статус
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              className="data-[variant=destructive]:focus:bg-destructive/10"
                              onClick={() => handleDeleteClick(comp)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Status Change Dialog */}
      {competitionForStatusChange && (
        <Dialog open={statusChangeDialogOpen} onOpenChange={handleStatusDialogClose}>
          <DialogContent className="sm:max-w-[512px]">
            <DialogHeader>
              <DialogTitle>Изменить статус соревнования</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {(["planned", "ongoing", "completed"] as const).map((status) => {
                    const isSelected = selectedStatus === status
                    const statusConfig = {
                      planned: { 
                        label: "Запланировано", 
                        color: "text-blue-500",
                        icon: Calendar,
                      },
                      ongoing: { 
                        label: "Уже идет", 
                        color: "text-emerald-500",
                        icon: Clock,
                      },
                      completed: { 
                        label: "Завершено", 
                        color: "text-gray-500",
                        icon: Archive,
                      },
                    }
                    const config = statusConfig[status]
                    const Icon = config.icon
                    
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all aspect-square",
                          isSelected
                            ? "border-primary border-2 bg-card shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 flex-shrink-0", config.color)} />
                        <span className={cn(
                          "text-xs font-medium text-center",
                          isSelected ? config.color : "text-muted-foreground"
                        )}>
                          {config.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleStatusDialogClose}
              >
                Отмена
              </Button>
              <button
                type="button"
                onClick={handleStatusChangeConfirm}
                disabled={selectedStatus === competitionForStatusChange.status || !selectedStatus}
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
                  selectedStatus === competitionForStatusChange.status || !selectedStatus
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Изменить статус
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Удалить соревнование?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Это действие нельзя отменить. Соревнование будет удалено навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Функция для парсинга даты формата "15.01.2024"
function parseDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('.').map(Number)
  return new Date(year, month - 1, day).getTime()
}

