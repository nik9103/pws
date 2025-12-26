"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  X,
  Mail,
  Phone,
  Contact,
  Trophy,
  FileText,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Eye,
  Download,
  Check,
  CheckCircle2,
  Trash2,
  FileSignature,
  AlertCircle,
  ArrowRight,
  CornerDownRight,
  Dumbbell,
  RotateCcw,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { InfoCard } from "@/components/users/info-card"
import { CopyButton } from "@/components/users/copy-button"
import { ApplicationStatusBadge } from "./application-status-badge"
import { StatusBadge } from "@/components/documents/status-badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { Application, ApplicationDocument } from "@/types/application"
import { useToast } from "@/hooks/use-toast"
import { DocumentPreviewModal } from "@/components/documents/document-preview-modal"
import type { Document } from "@/types/document"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface ApplicationProfileProps {
  application: Application
  onReject?: (application: Application) => void
  onAccept?: (application: Application) => void
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

export function ApplicationProfile({ application: initialApplication, onReject, onAccept }: ApplicationProfileProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<Application>(initialApplication)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState<ApplicationDocument | null>(null)
  const [docFilter, setDocFilter] = useState<"all" | "signed" | "unsigned">("all")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSigningPanel, setShowSigningPanel] = useState(false)

  const documents = application.documents || []
  
  const filteredDocuments = useMemo(() => {
    if (docFilter === "all") return documents
    return documents.filter((doc) => doc.status === docFilter)
  }, [documents, docFilter])

  const handleRejectClick = () => {
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (onReject) {
      onReject(application)
    }
    setRejectDialogOpen(false)
    router.push("/applications")
    toast({
      title: "Заявка отклонена",
      variant: "success",
    })
  }

  const handleAcceptClick = () => {
    setAcceptDialogOpen(true)
  }

  const handleAcceptConfirm = () => {
    if (onAccept) {
      onAccept(application)
    }
    setAcceptDialogOpen(false)
    router.push("/applications")
    toast({
      title: "Заявка принята",
      variant: "success",
    })
  }

  const handleSelectAllDocs = () => {
    const currentFiltered = filteredDocuments
    const allSelected = currentFiltered.every(doc => selectedDocIds.includes(doc.id))
    if (allSelected) {
      // Убрать все выбранные документы из текущего фильтра
      setSelectedDocIds(selectedDocIds.filter(id => !currentFiltered.some(doc => doc.id === id)))
    } else {
      // Добавить все документы из текущего фильтра
      const newIds = currentFiltered.filter(doc => !selectedDocIds.includes(doc.id)).map(doc => doc.id)
      setSelectedDocIds([...selectedDocIds, ...newIds])
    }
  }

  const handleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter((docId) => docId !== id))
    } else {
      setSelectedDocIds([...selectedDocIds, id])
    }
  }

  // Преобразование ApplicationDocument в Document для модального окна
  const convertToDocument = (doc: ApplicationDocument): Document => {
    return {
      id: doc.id,
      name: doc.name,
      type: doc.type,
      status: doc.status,
      date: doc.date,
      size: doc.size,
      athlete: {
        initials: application.athlete.initials,
        fullName: application.athlete.fullName,
      },
      competition: application.competition.name,
      discipline: application.competition.discipline || "",
    }
  }

  const handleDocumentClick = (doc: ApplicationDocument) => {
    const document = convertToDocument(doc)
    setSelectedDocument(document)
    setShowSigningPanel(doc.status === "unsigned")
    setIsModalOpen(true)
  }

  const handleSign = (doc: ApplicationDocument) => {
    const document = convertToDocument(doc)
    setSelectedDocument(document)
    setShowSigningPanel(true)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDocument(null)
    setShowSigningPanel(false)
  }

  const handleDocumentSigned = () => {
    if (selectedDocument) {
      // Обновить статус документа на "signed" и добавить дату
      const now = new Date()
      const day = now.getDate()
      const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек']
      const month = months[now.getMonth()]
      const year = now.getFullYear()
      const currentDate = `${day} ${month}. ${year}`
      
      setApplication((prevApp) => ({
        ...prevApp,
        documents: prevApp.documents?.map((doc) =>
          doc.id === selectedDocument.id
            ? { ...doc, status: "signed" as const, date: currentDate }
            : doc
        ) || [],
      }))
      
      toast({
        title: "Документ подписан",
        variant: "success",
      })
      handleCloseModal()
    }
  }

  const handleDeleteClick = (doc: ApplicationDocument) => {
    setDocToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (docToDelete) {
      // Переподписать документ (удалить скан и вернуть в статус "Не подписан")
      setApplication((prevApp) => ({
        ...prevApp,
        documents: prevApp.documents?.map((doc) =>
          doc.id === docToDelete.id
            ? { ...doc, status: "unsigned" as const, date: undefined }
            : doc
        ) || [],
      }))
      
      toast({
        title: "Подпись документа сброшена",
        variant: "success",
      })
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docToDelete.id))
    }
    setDeleteDialogOpen(false)
    setDocToDelete(null)
  }

  const handleBulkDownload = () => {
    // Скачать выбранные документы
    toast({
      title: `Скачивание ${selectedDocIds.length} документов`,
      variant: "success",
    })
  }

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true)
  }

  const handleBulkDeleteConfirm = () => {
    // Переподписать выбранные документы (удалить сканы и вернуть в статус "Не подписан")
    setApplication((prevApp) => ({
      ...prevApp,
      documents: prevApp.documents?.map((doc) =>
        selectedDocIds.includes(doc.id)
          ? { ...doc, status: "unsigned" as const, date: undefined }
          : doc
      ) || [],
    }))
    
    toast({
      title: `Подпись ${selectedDocIds.length} документов сброшена`,
      variant: "success",
    })
    setSelectedDocIds([])
    setBulkDeleteDialogOpen(false)
  }

  const formatSubmissionDate = (date: string) => {
    return `От ${date}`
  }

  const handleGoToProfile = () => {
    // Переход на профиль первого пользователя из примера (ID: "1")
    router.push("/users/1")
  }

  const athleteAge = application.athlete.age || null
  const athleteBirthDate = application.athlete.birthDate || null
  const athleteInfo = athleteAge && athleteBirthDate ? `${athleteAge} года • ${athleteBirthDate}` : null

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
                  className="h-8 w-8 bg-white dark:bg-card"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-base font-semibold text-foreground">Заявка #{application.applicationId}</h1>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                  <div className="flex items-center gap-1">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{formatSubmissionDate(application.submissionDate)}</p>
                  </div>
                </div>
              </div>
            </div>
            {application.status === "pending" && (
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAcceptClick}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-4 w-4" />
                  Принять заявку
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectClick}
                  className="gap-2 bg-white dark:bg-card"
                >
                  <X className="h-4 w-4" />
                  Отклонить заявку
                </Button>
              </div>
            )}
            {application.status === "rejected" && (
              <Button
                onClick={handleAcceptClick}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <Check className="h-4 w-4" />
                Принять заявку
              </Button>
            )}
            {application.status === "accepted" && (
              <Button
                variant="outline"
                onClick={handleRejectClick}
                className="gap-2 bg-white dark:bg-card"
              >
                <X className="h-4 w-4" />
                Отклонить заявку
              </Button>
            )}
          </div>

          {/* Athlete Card */}
          <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[10px] p-6 shadow-sm -mt-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 flex-shrink-0">
                  <AvatarFallback className="bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground text-sm">
                    {application.athlete.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{application.athlete.fullName}</p>
                  {athleteInfo && (
                    <p className="text-sm text-muted-foreground">{athleteInfo}</p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleGoToProfile}>
                Перейти в профиль
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 dark:bg-border mb-4" />

            {/* Competition Info */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Соревнование</p>
                  <p className="text-sm font-medium text-foreground">{application.competition.name}</p>
                </div>
              </div>

              {application.competition.discipline && (
                <>
                  <div className="w-px h-6 bg-gray-200 dark:bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Дисциплина</p>
                      <p className="text-sm font-medium text-foreground">{application.competition.discipline}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="w-px h-6 bg-gray-200 dark:bg-border" />
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Даты проведения</p>
                  <p className="text-sm font-medium text-foreground">{application.competition.dateRange}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
          {/* Contact Information */}
          <InfoCard icon={Contact} title="Контактная информация">
            {application.athlete.email && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <TruncatedTextWithTooltip
                      text={application.athlete.email}
                      className="text-sm font-medium text-foreground"
                    />
                    <CopyButton value={application.athlete.email} />
                  </div>
                </div>
              </div>
            )}
            {application.athlete.phone && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <div className="flex items-center gap-2">
                    <TruncatedTextWithTooltip
                      text={application.athlete.phone}
                      className="text-sm font-medium text-foreground"
                    />
                    <CopyButton value={application.athlete.phone} />
                  </div>
                </div>
              </div>
            )}
          </InfoCard>

          {/* Competition Details */}
          <InfoCard icon={Trophy} title="О соревновании">
            {application.competition.participants !== undefined && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Участников</p>
                  <p className="text-sm font-medium text-foreground">{application.competition.participants}</p>
                </div>
              </div>
            )}
            {application.competition.location && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Место проведения</p>
                  <p className="text-sm font-medium text-foreground">{application.competition.location}</p>
                </div>
              </div>
            )}
          </InfoCard>
        </div>

          {/* Documents Card */}
          <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-[10px] shadow-sm">
            {/* Documents Header */}
            <div className="px-6 pt-6 pb-3 border-b border-gray-200 dark:border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Документы</h3>
                </div>
                <Tabs value={docFilter} onValueChange={(v) => setDocFilter(v as "all" | "signed" | "unsigned")}>
                  <TabsList>
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="signed">Подписанные</TabsTrigger>
                    <TabsTrigger value="unsigned">Не подписанные</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <div className="p-0">
              {/* Tabs Content */}
          <Tabs value={docFilter} onValueChange={(v) => setDocFilter(v as "all" | "signed" | "unsigned")} className="w-full">

            <TabsContent value="all" className="mt-0">
              {filteredDocuments.length > 0 ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className={selectedDocIds.length > 0 ? "border-b bg-accent/50" : "border-b"}>
                        <TableHead className="w-[44px] px-4">
                          <Checkbox
                            checked={filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocIds.includes(doc.id))}
                            onCheckedChange={handleSelectAllDocs}
                          />
                        </TableHead>
                        <TableHead className="px-4">
                          {selectedDocIds.length > 0 ? (
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">Выбрано: {selectedDocIds.length}</span>
                              <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDownload}>
                                <Download className="h-4 w-4" />
                                Скачать выбранные
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDelete}>
                                <RotateCcw className="h-4 w-4" />
                                Переподписать
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm font-medium">Выбрано {selectedDocIds.length}</span>
                          )}
                        </TableHead>
                        <TableHead className="px-4"></TableHead>
                        <TableHead className="w-[60px] px-4"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow 
                          key={doc.id} 
                          className="border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedDocIds.includes(doc.id)}
                              onCheckedChange={() => handleSelectDoc(doc.id)}
                            />
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                doc.status === "signed" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-orange-50 dark:bg-orange-950/30"
                              }`}>
                                <FileText className={`h-4 w-4 ${
                                  doc.status === "signed" ? "text-emerald-600" : "text-orange-600"
                                }`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.type}{doc.status === "signed" && doc.date ? ` • ${doc.date}` : ""} • {doc.size}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <StatusBadge status={doc.status} />
                          </TableCell>
                          <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {doc.status === "signed" ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleDocumentClick(doc)}>
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
                                    <DropdownMenuItem onClick={() => handleSign(doc)}>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  Документы не найдены
                </div>
              )}
            </TabsContent>
            <TabsContent value="signed" className="mt-0">
              {filteredDocuments.length > 0 ? (
                <div className="w-full">
                  <Table>
                      <TableHeader>
                        <TableRow className={selectedDocIds.length > 0 ? "border-b bg-accent/50" : "border-b"}>
                          <TableHead className="w-[44px] px-4">
                            <Checkbox
                              checked={filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocIds.includes(doc.id))}
                              onCheckedChange={handleSelectAllDocs}
                            />
                          </TableHead>
                          <TableHead className="px-4">
                            {selectedDocIds.length > 0 ? (
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Выбрано: {selectedDocIds.length}</span>
                                <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDownload}>
                                  <Download className="h-4 w-4" />
                                  Скачать выбранные
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDelete}>
                                  <Trash2 className="h-4 w-4" />
                                  Переподписать
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm font-medium">Выбрано {selectedDocIds.length}</span>
                            )}
                          </TableHead>
                          <TableHead className="px-4"></TableHead>
                        <TableHead className="w-[60px] px-4"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((doc) => (
                          <TableRow 
                            key={doc.id} 
                            className="border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer"
                            onClick={() => handleDocumentClick(doc)}
                          >
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedDocIds.includes(doc.id)}
                                onCheckedChange={() => handleSelectDoc(doc.id)}
                              />
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                                  <FileText className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.type}{doc.status === "signed" && doc.date ? ` • ${doc.date}` : ""} • {doc.size}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <StatusBadge status={doc.status} />
                            </TableCell>
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDocumentClick(doc)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Посмотреть
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Скачать
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(doc)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Переподписать
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Документы не найдены
                  </div>
                )}
            </TabsContent>
            <TabsContent value="unsigned" className="mt-0">
              {filteredDocuments.length > 0 ? (
                <div className="w-full">
                  <Table>
                      <TableHeader>
                        <TableRow className={selectedDocIds.length > 0 ? "border-b bg-accent/50" : "border-b"}>
                          <TableHead className="w-[44px] px-4">
                            <Checkbox
                              checked={filteredDocuments.length > 0 && filteredDocuments.every(doc => selectedDocIds.includes(doc.id))}
                              onCheckedChange={handleSelectAllDocs}
                            />
                          </TableHead>
                          <TableHead className="px-4">
                            {selectedDocIds.length > 0 ? (
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Выбрано: {selectedDocIds.length}</span>
                                <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDownload}>
                                  <Download className="h-4 w-4" />
                                  Скачать выбранные
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2 h-8" onClick={handleBulkDelete}>
                                  <Trash2 className="h-4 w-4" />
                                  Переподписать
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm font-medium">Выбрано {selectedDocIds.length}</span>
                            )}
                          </TableHead>
                          <TableHead className="px-4"></TableHead>
                        <TableHead className="w-[60px] px-4"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((doc) => (
                          <TableRow 
                            key={doc.id} 
                            className="border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer"
                            onClick={() => handleSign(doc)}
                          >
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedDocIds.includes(doc.id)}
                                onCheckedChange={() => handleSelectDoc(doc.id)}
                              />
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                                  <FileText className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.type}{doc.status === "signed" && doc.date ? ` • ${doc.date}` : ""} • {doc.size}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <StatusBadge status={doc.status} />
                            </TableCell>
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleSign(doc)}>
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    Подписать
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Скачать
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Документы не найдены
                  </div>
                )}
            </TabsContent>
          </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          showSigningPanel={showSigningPanel}
          onDocumentSigned={handleDocumentSigned}
        />
      )}

      {/* Delete Document Dialog */}
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Переподписать выбранные документы?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Текущие сканы документов будут удалены, и документы вернутся в статус «Не подписан». После этого их потребуется подписать повторно. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Переподписать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Accept Dialog */}
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

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-500 flex-shrink-0" />
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
