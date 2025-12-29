"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Trophy,
  Calendar,
  ClipboardCheck,
  ClipboardX,
  Users,
  Contact,
  MoreVertical,
  Trash2,
  UserRoundPlus,
  ArrowUpDown,
  FileText,
  Download,
  EllipsisVertical,
  AlertCircle,
  CornerDownRight,
  Pencil,
  Clock,
  Archive,
  Tag,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { InfoCard } from "@/components/users/info-card"
import { StatusBadge } from "@/components/documents/status-badge"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/competitions/pagination"
import type { Competition, CompetitionParticipant, CompetitionJudge } from "@/types/competition"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AssignJudgesModal } from "./assign-judges-modal"
import { mockAllJudges } from "@/lib/mock-judges"

interface CompetitionProfileProps {
  competition: Competition
  onDelete?: (competition: Competition) => void
  onEdit?: (competition: Competition) => void
}

// Компонент для текста с обрезкой и тултипом
function TruncatedTextWithTooltip({ text, className }: { text: string; className?: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth)
      }
    }
    checkTruncation()
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [text])

  const textElement = (
    <p
      ref={textRef}
      className={`truncate ${className || ''}`}
    >
      {text}
    </p>
  )

  if (isTruncated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {textElement}
        </TooltipTrigger>
        <TooltipContent>
          {text}
        </TooltipContent>
      </Tooltip>
    )
  }

  return textElement
}

export function CompetitionProfile({ competition, onDelete, onEdit }: CompetitionProfileProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [participantsPage, setParticipantsPage] = useState(1)
  const [judgesPage, setJudgesPage] = useState(1)
  const [participantsPageSize, setParticipantsPageSize] = useState(10)
  const [judgesPageSize, setJudgesPageSize] = useState(10)
  const [participantsSortField, setParticipantsSortField] = useState<"name" | "status" | null>(null)
  const [participantsSortDirection, setParticipantsSortDirection] = useState<"asc" | "desc">("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteJudgeDialogOpen, setDeleteJudgeDialogOpen] = useState(false)
  const [judgeToDelete, setJudgeToDelete] = useState<CompetitionJudge | null>(null)
  const [judges, setJudges] = useState<CompetitionJudge[]>(competition.judges || [])
  const [currentStatus, setCurrentStatus] = useState<"ongoing" | "completed" | "planned">(competition.status)
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<"ongoing" | "completed" | "planned">(competition.status)
  const [assignJudgesModalOpen, setAssignJudgesModalOpen] = useState(false)

  const participants = competition.participants || []

  // Форматирование даты
  const formatDateRange = (startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.')
      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек']
      return `${day} ${months[parseInt(month) - 1]}. ${year}`
    }
    
    const start = formatDate(startDate)
    const end = formatDate(endDate)
    
    if (startDate === endDate) {
      return start
    }
    return `${start} - ${end}`
  }

  // Сортировка участников
  const sortedParticipants = useMemo(() => {
    if (!participantsSortField) return participants
    
    return [...participants].sort((a, b) => {
      let aValue: string, bValue: string
      
      if (participantsSortField === "name") {
        aValue = a.fullName
        bValue = b.fullName
      } else {
        aValue = a.status
        bValue = b.status
      }
      
      const comparison = aValue.localeCompare(bValue, "ru")
      return participantsSortDirection === "asc" ? comparison : -comparison
    })
  }, [participants, participantsSortField, participantsSortDirection])

  const participantsTotalPages = Math.ceil(sortedParticipants.length / participantsPageSize)
  const paginatedParticipants = sortedParticipants.slice(
    (participantsPage - 1) * participantsPageSize,
    participantsPage * participantsPageSize
  )

  const judgesTotalPages = Math.ceil(judges.length / judgesPageSize)
  const paginatedJudges = judges.slice(
    (judgesPage - 1) * judgesPageSize,
    judgesPage * judgesPageSize
  )

  const handleParticipantsSort = (field: "name" | "status") => {
    if (participantsSortField === field) {
      setParticipantsSortDirection(participantsSortDirection === "asc" ? "desc" : "asc")
    } else {
      setParticipantsSortField(field)
      setParticipantsSortDirection("asc")
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(competition)
    }
    setDeleteDialogOpen(false)
    router.push("/competitions")
    toast({
      title: "Соревнование удалено",
      variant: "success",
    })
  }

  const handleDeleteJudgeClick = (judge: CompetitionJudge) => {
    setJudgeToDelete(judge)
    setDeleteJudgeDialogOpen(true)
  }

  const handleDeleteJudgeConfirm = () => {
    if (judgeToDelete) {
      setJudges((prevJudges) => prevJudges.filter((judge) => judge.id !== judgeToDelete.id))
      toast({
        title: "Судья удален",
        variant: "success",
      })
    }
    setDeleteJudgeDialogOpen(false)
    setJudgeToDelete(null)
  }

  const handleOpenStatusDialog = () => {
    setSelectedStatus(currentStatus)
    setStatusChangeDialogOpen(true)
  }

  const handleStatusChangeConfirm = () => {
    if (selectedStatus !== currentStatus) {
      setCurrentStatus(selectedStatus)
      toast({
        title: "Статус изменен",
        description: `Статус соревнования изменен на "${getStatusLabel(selectedStatus)}"`,
        variant: "success",
      })
    }
    setStatusChangeDialogOpen(false)
  }

  const handleStatusDialogClose = () => {
    setStatusChangeDialogOpen(false)
    setSelectedStatus(currentStatus)
  }

  const handleAssignJudges = (newJudges: CompetitionJudge[]) => {
    const previousCount = judges.length
    const newCount = newJudges.length
    const addedCount = newCount - previousCount
    
    setJudges(newJudges)
    
    // Показываем toast уведомление
    toast({
      title: "Судьи назначены",
      description: `Назначено судей: ${newCount}${addedCount > 0 ? ` (+${addedCount} новых)` : ''}`,
      variant: "success",
    })

    // Отправляем уведомление в систему уведомлений
    if (addedCount > 0 && typeof window !== "undefined") {
      const notificationEvent = new CustomEvent("notification", {
        detail: {
          id: `judge-assigned-${Date.now()}`,
          title: "Судьи назначены",
          message: `На соревнование "${competition.name}" назначено ${addedCount} ${addedCount === 1 ? 'судья' : addedCount < 5 ? 'судьи' : 'судей'}`,
          type: "success",
          read: false,
          createdAt: "только что",
          href: `/competitions/${competition.id}`,
        },
      })
      window.dispatchEvent(notificationEvent)
    }
  }

  const getStatusLabel = (status: "ongoing" | "completed" | "planned"): string => {
    const labels = {
      planned: "Запланировано",
      ongoing: "Уже идет",
      completed: "Завершено",
    }
    return labels[status]
  }



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8 py-6">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4" style={{ height: '56px' }}>
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-base font-semibold text-foreground">{competition.name}</h1>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex items-center gap-1">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{competition.discipline}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Change Status Button */}
              <Button
                variant="outline"
                className="h-9 bg-card"
                onClick={handleOpenStatusDialog}
              >
                <Tag className="h-4 w-4" />
                Изменить статус
              </Button>
              {(onDelete || onEdit) && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-card"
                      onClick={() => onEdit(competition)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-card"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Competition Info Card */}
          <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm -mt-3">
            <div className="flex items-center gap-3 mb-4 w-full">
              <div className="flex items-center justify-center w-11 h-11 bg-muted rounded-lg flex-shrink-0">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{competition.organizer || "Организатор не указан"}</p>
                <p className="text-sm text-muted-foreground">Организатор</p>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-border mb-4" />

            {/* Info Rows */}
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg flex-shrink-0">
                  {competition.inMinistryList ? (
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ClipboardX className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Включено в перечень Минспорта</p>
                  <p className="text-sm font-medium text-foreground">{competition.inMinistryList ? "Да" : "Нет"}</p>
                </div>
              </div>

              <div className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Период проведения</p>
                  <p className="text-sm font-medium text-foreground">{formatDateRange(competition.startDate, competition.endDate)}</p>
                </div>
              </div>

              <div className="w-px h-6 bg-border" />

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Участников</p>
                  <p className="text-sm font-medium text-foreground">{participants.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-card border border-border rounded-[10px] shadow-sm">
            <div className="px-6 pt-6 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                    <Contact className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Участники</h3>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {participants.length}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Сформировать документ
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Скачать пакет документов
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-0">
              {participants.length > 0 ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="px-6">
                          <button
                            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => handleParticipantsSort("name")}
                          >
                            ФИО
                            <ArrowUpDown className={cn("h-3.5 w-3.5", participantsSortField === "name" && "text-foreground")} />
                          </button>
                        </TableHead>
                        <TableHead className="px-6">
                          <button
                            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => handleParticipantsSort("status")}
                          >
                            Статус
                            <ArrowUpDown className={cn("h-3.5 w-3.5", participantsSortField === "status" && "text-foreground")} />
                          </button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedParticipants.map((participant) => (
                        <TableRow 
                          key={participant.id} 
                          className="border-b last:border-b-0 hover:bg-accent/20 transition-colors"
                        >
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {participant.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <TruncatedTextWithTooltip
                                  text={participant.fullName}
                                  className="text-sm font-medium text-foreground"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <StatusBadge status={participant.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {participantsTotalPages > 1 && (
                    <div className="px-6 border-t border-border mb-6">
                      <Pagination
                        currentPage={participantsPage}
                        totalPages={participantsTotalPages}
                        pageSize={participantsPageSize}
                        totalItems={sortedParticipants.length}
                        onPageChange={setParticipantsPage}
                        onPageSizeChange={(size) => {
                          setParticipantsPageSize(size)
                          setParticipantsPage(1)
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Участники не найдены
                </div>
              )}
            </div>
          </div>

          {/* Judges Card */}
          <div className="bg-card border border-border rounded-[10px] shadow-sm">
            <div className="px-6 pt-6 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
                    <Contact className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Судейский состав</h3>
                </div>
                <Button 
                  variant="outline" 
                  className="h-9 gap-2"
                  onClick={() => setAssignJudgesModalOpen(true)}
                >
                  <UserRoundPlus className="h-4 w-4" />
                  Назначить судью
                </Button>
              </div>
            </div>
            <div className="p-0">
              {judges.length > 0 ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="px-6">ФИО</TableHead>
                        <TableHead className="px-6 w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedJudges.map((judge) => (
                        <TableRow 
                          key={judge.id} 
                          className="border-b last:border-b-0 hover:bg-accent/20 transition-colors"
                        >
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {judge.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <TruncatedTextWithTooltip
                                  text={judge.fullName}
                                  className="text-sm font-medium text-foreground"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteJudgeClick(judge)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {judgesTotalPages > 1 && (
                    <div className="px-6 border-t border-border">
                      <Pagination
                        currentPage={judgesPage}
                        totalPages={judgesTotalPages}
                        pageSize={judgesPageSize}
                        totalItems={judges.length}
                        onPageChange={setJudgesPage}
                        onPageSizeChange={(size) => {
                          setJudgesPageSize(size)
                          setJudgesPage(1)
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Судейский состав не назначен
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Competition Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Удалить соревнование?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Вы уверены, что хотите удалить это соревнование? Это действие нельзя отменить.
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

      {/* Delete Judge Dialog */}
      <AlertDialog open={deleteJudgeDialogOpen} onOpenChange={setDeleteJudgeDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Удалить судью?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Вы уверены, что хотите удалить этого судью из состава?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJudgeConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <Dialog open={statusChangeDialogOpen} onOpenChange={handleStatusDialogClose}>
        <DialogContent className="sm:max-w-[512px]">
          <DialogHeader>
            <DialogTitle>Изменить статус соревнования</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {/* Status Options */}
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
              disabled={selectedStatus === currentStatus}
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2",
                selectedStatus === currentStatus
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Изменить статус
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Judges Modal */}
      <AssignJudgesModal
        open={assignJudgesModalOpen}
        onOpenChange={setAssignJudgesModalOpen}
        currentJudges={judges}
        allJudges={mockAllJudges}
        onAssign={handleAssignJudges}
      />
    </div>
  )
}

