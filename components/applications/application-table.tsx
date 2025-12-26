"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MoreVertical, ArrowUpDown, X, Eye, Download, CheckCircle2, XCircle } from "lucide-react"
import type { Application } from "@/types/application"
import { ApplicationStatusBadge } from "./application-status-badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ApplicationTableProps {
  applications: Application[]
  onApplicationClick?: (application: Application) => void
  onAccept?: (application: Application) => void
  onReject?: (application: Application) => void
  onClearFilters?: () => void
}

type SortField = "applicationId" | "athlete" | "competition" | "submissionDate" | "status"
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

export function ApplicationTable({
  applications,
  onApplicationClick,
  onAccept,
  onReject,
  onClearFilters,
}: ApplicationTableProps) {
  const [sortField, setSortField] = useState<SortField>("applicationId")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [applicationToAction, setApplicationToAction] = useState<Application | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedApplications = [...applications].sort((a, b) => {
    let aValue: string | number, bValue: string | number
    switch (sortField) {
      case "applicationId":
        aValue = parseInt(a.applicationId)
        bValue = parseInt(b.applicationId)
        break
      case "athlete":
        aValue = a.athlete.fullName
        bValue = b.athlete.fullName
        break
      case "competition":
        aValue = a.competition.name
        bValue = b.competition.name
        break
      case "submissionDate":
        aValue = a.submissionDate
        bValue = b.submissionDate
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      default:
        return 0
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
    
    const comparison = String(aValue).localeCompare(String(bValue), "ru")
    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleAcceptClick = (app: Application) => {
    setApplicationToAction(app)
    setAcceptDialogOpen(true)
  }

  const handleRejectClick = (app: Application) => {
    setApplicationToAction(app)
    setRejectDialogOpen(true)
  }

  const handleAcceptConfirm = () => {
    if (applicationToAction && onAccept) {
      onAccept(applicationToAction)
    }
    setAcceptDialogOpen(false)
    setApplicationToAction(null)
  }

  const handleRejectConfirm = () => {
    if (applicationToAction && onReject) {
      onReject(applicationToAction)
    }
    setRejectDialogOpen(false)
    setApplicationToAction(null)
  }

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
      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
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
          <tr className="border-b">
            <th className="px-4 h-[52px] text-left" style={{ width: '10%', minWidth: '100px' }}>
              <SortButton field="applicationId">ID Заявки</SortButton>
            </th>
            <th className="px-4 h-[52px] text-left" style={{ width: '25%', minWidth: '200px' }}>
              <SortButton field="athlete">Спортсмен</SortButton>
            </th>
            <th className="px-4 h-[52px] text-left" style={{ width: '30%', minWidth: '250px' }}>
              <SortButton field="competition">Соревнование</SortButton>
            </th>
            <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '140px' }}>
              <SortButton field="submissionDate">Дата подачи</SortButton>
            </th>
            <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '140px' }}>
              <SortButton field="status">Статус</SortButton>
            </th>
            <th className="h-[52px] px-3 sticky right-0 bg-card z-20 rounded-tr-lg" style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-16">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle className="text-sm">Заявки не найдены</EmptyTitle>
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
            sortedApplications.map((app, index) => (
            <tr
              key={app.id}
              className="border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer group"
              onClick={() => onApplicationClick?.(app)}
            >
              <td className="px-4 py-3 overflow-hidden" style={{ width: '10%', minWidth: '100px' }}>
                <div className="min-w-0 overflow-hidden">
                  <TruncatedText text={`#${app.applicationId}`} className="text-sm text-muted-foreground font-medium" />
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '25%', minWidth: '200px' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
                    {app.athlete.initials}
                  </span>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <TruncatedText text={app.athlete.fullName} className="text-sm" />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '30%', minWidth: '250px' }}>
                <div className="min-w-0 overflow-hidden">
                  <TruncatedText text={app.competition.name} className="text-sm font-medium" />
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {app.competition.dateRange}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '15%', minWidth: '140px' }}>
                <div className="min-w-0 overflow-hidden">
                  <TruncatedText text={formatDate(app.submissionDate)} className="text-sm text-muted-foreground" />
                </div>
              </td>
              <td className="px-4 py-3 overflow-hidden" style={{ width: '15%', minWidth: '140px' }}>
                <ApplicationStatusBadge status={app.status} />
              </td>
              <td 
                className={cn(
                  "px-3 py-3 sticky right-0 z-20 transition-colors bg-card group-hover:bg-accent/20",
                  index === sortedApplications.length - 1 && "rounded-br-lg"
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
                      {app.status === "accepted" ? (
                        <>
                          <DropdownMenuItem onClick={() => onApplicationClick?.(app)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Скачать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            variant="destructive" 
                            className="data-[variant=destructive]:focus:bg-destructive/10"
                            onClick={() => handleRejectClick(app)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Отклонить
                          </DropdownMenuItem>
                        </>
                      ) : app.status === "pending" ? (
                        <>
                          <DropdownMenuItem onClick={() => onApplicationClick?.(app)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAcceptClick(app)}
                            className="text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-950/30"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Принять заявку
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            variant="destructive" 
                            className="data-[variant=destructive]:focus:bg-destructive/10"
                            onClick={() => handleRejectClick(app)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Отклонить заявку
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem onClick={() => onApplicationClick?.(app)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Скачать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAcceptClick(app)}
                            className="text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-950/30"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Принять заявку
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

      {/* Модальное окно подтверждения принятия заявки */}
      <AlertDialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Принять заявку?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Система автоматически сгенерирует пакет документов для подписания. 
              Спортсмен будет включен в список участников соревнования.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptConfirm}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Принять
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Модальное окно подтверждения отклонения заявки */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Отклонить заявку?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Спортсмен получит уведомление об отклонении заявки. 
              Это действие можно будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Отклонить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

