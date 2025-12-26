"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Phone,
  Landmark,
  FileText,
  Download,
  Dock,
  NotepadText,
  Pencil,
  Trash2,
  Contact,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User, UserDocument } from "@/types/user"
import { InfoCard } from "./info-card"
import { InfoRow } from "./info-row"
import { DocumentItem } from "./document-item"
import { ScanPreviewModal } from "./scan-preview-modal"
import { CopyButton } from "./copy-button"
import { useToast } from "@/hooks/use-toast"

interface UserProfileProps {
  user: User
}

const statusLabels = {
  active: "Активный",
  inactive: "Заблокирован",
  blocked: "Заблокирован",
}

const formatDate = (dateString: string): string => {
  const monthMap: { [key: string]: string } = {
    "января": "янв.",
    "февраля": "фев.",
    "марта": "мар.",
    "апреля": "апр.",
    "мая": "май",
    "июня": "июн.",
    "июля": "июл.",
    "августа": "авг.",
    "сентября": "сен.",
    "октября": "окт.",
    "ноября": "ноя.",
    "декабря": "дек.",
    "февр": "фев.",
    "сент": "сен.",
  }

  let formatted = dateString
  for (const [full, short] of Object.entries(monthMap)) {
    const regex = new RegExp(full, "gi")
    formatted = formatted.replace(regex, short)
  }

  return formatted
}

export function UserProfile({ user }: UserProfileProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState(user.status)
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive" | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`
  const initials = `${user.lastName[0]}${user.firstName[0]}`

  const passportDocuments = user.documents.filter((d) => d.category === "passport")
  const otherDocuments = user.documents.filter((d) => d.category === "other")

  const handlePreview = (doc: UserDocument) => {
    setPreviewDocument(doc)
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewDocument(null)
  }

  const handleDownload = (doc: UserDocument) => {
    console.log("Downloading:", doc.name)
  }

  const handleEdit = () => {
    router.push(`/users/${user.id}/edit`)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log("Delete user:", user.id)
    setIsDeleteDialogOpen(false)
    
    // Показываем уведомление об успешном удалении
    toast({
      title: "Пользователь удален",
      description: "Пользователь успешно удален из системы",
      variant: "success",
    })
    
    // Переход на страницу со списком пользователей
    router.push("/users")
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
  }

  const handleStatusChange = (checked: boolean) => {
    const newStatus = checked ? "active" : "inactive"
    setPendingStatus(newStatus)
    setIsStatusDialogOpen(true)
  }

  const handleStatusConfirm = () => {
    if (pendingStatus) {
      const fullName = `${user.lastName} ${user.firstName} ${user.middleName || ""}`.trim()
      const statusText = pendingStatus === "active" ? "разблокирован" : "заблокирован"
      
      setStatus(pendingStatus)
      setIsStatusDialogOpen(false)
      setPendingStatus(null)
      
      toast({
        title: "Статус изменен",
        description: `Пользователь ${fullName} ${statusText}`,
        variant: "success",
      })
    }
  }

  const handleStatusCancel = () => {
    setIsStatusDialogOpen(false)
    setPendingStatus(null)
  }

  const handleStatusDialogOpenChange = (open: boolean) => {
    setIsStatusDialogOpen(open)
    if (!open) {
      setPendingStatus(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ScanPreviewModal document={previewDocument} isOpen={isPreviewOpen} onClose={handleClosePreview} />
      
      <AlertDialog open={isStatusDialogOpen} onOpenChange={handleStatusDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingStatus === "inactive" ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              )}
              {pendingStatus === "inactive" ? "Заблокировать пользователя?" : "Разблокировать пользователя?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "inactive" ? (
                "После блокировки доступ к системе будет закрыт."
              ) : (
                "Доступ к системе будет восстановлен."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStatusCancel}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={
                pendingStatus === "inactive"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              }
            >
              {pendingStatus === "inactive" ? "Заблокировать" : "Разблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              Подтверждение удаления пользователя
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя? Это действие нельзя отменить. Все данные пользователя будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-[896px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Профиль пользователя</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-card border border-border rounded-[10px] p-6 mb-8 shadow-xs">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 pr-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
                {initials}
              </span>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h2 className="text-sm font-semibold text-foreground">{fullName}</h2>
                  <Badge 
                    variant="outline" 
                    className={
                      status === "active"
                        ? "text-xs font-semibold bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-transparent hover:bg-green-100 dark:hover:bg-green-950/40"
                        : "text-xs font-semibold bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-transparent hover:bg-red-100 dark:hover:bg-red-950/40"
                    }
                  >
                    {status === "active" ? "Активный" : "Заблокирован"}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-semibold bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-muted/80">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.age} года • {user.birthDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleStatusChange(!(status === "active"))}
                className="gap-2 text-sm font-medium"
              >
                {status === "active" ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Заблокировать
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Разблокировать
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator className="mb-3" />

          <div className="flex items-center gap-6">
            {/* Системная информация */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-[10px] flex-shrink-0">
                <Calendar className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="text-sm font-medium text-foreground">{formatDate(user.registrationDate)}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-[10px] flex-shrink-0">
                <Clock className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Последний вход</p>
                <p className="text-sm font-normal text-foreground">{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Левая колонка - Контактная информация и Паспортные данные */}
          <div className="flex-1 flex flex-col gap-8">
            <InfoCard icon={Contact} title="Контактная информация">
              {user.email && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{user.email}</span>
                      <CopyButton value={user.email} />
                    </div>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-50 dark:bg-muted rounded-lg flex-shrink-0">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Телефон</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{user.phone}</span>
                      <CopyButton value={user.phone} />
                    </div>
                  </div>
                </div>
              )}
            </InfoCard>

            {/* Паспортные данные */}
            <InfoCard icon={Dock} title="Паспортные данные">
              <div className="space-y-4 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Серия и номер</p>
                    <p className="text-sm font-normal text-foreground">
                      {user.passport.series} {user.passport.number}
                    </p>
                  </div>
                  <CopyButton value={`${user.passport.series} ${user.passport.number}`} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Кем выдан</p>
                    <p className="text-sm font-normal text-foreground">{user.passport.issuedBy}</p>
                  </div>
                  <CopyButton value={user.passport.issuedBy} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Дата выдачи</p>
                    <p className="text-sm font-normal text-foreground">{user.passport.issueDate}</p>
                  </div>
                  <CopyButton value={user.passport.issueDate} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Место регистрации</p>
                    <p className="text-sm font-normal text-foreground">{user.passport.registrationAddress}</p>
                  </div>
                  <CopyButton value={user.passport.registrationAddress} />
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Документы ({passportDocuments.length})
                </p>
                <div className="space-y-3">
                  {passportDocuments.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      name={doc.name}
                      size={doc.size}
                      type={doc.type}
                      onPreview={() => handlePreview(doc)}
                      onDownload={() => handleDownload(doc)}
                    />
                  ))}
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Правая колонка */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Банковские реквизиты */}
            <InfoCard
              icon={Landmark}
              title="Банковские реквизиты"
              headerAction={
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Download className="h-4 w-4" />
                </Button>
              }
            >
              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Номер карты</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.bankDetails.cardNumber}</span>
                    <CopyButton value={user.bankDetails.cardNumber} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">БИК банка</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.bankDetails.bik}</span>
                    <CopyButton value={user.bankDetails.bik} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Расчетный счет</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.bankDetails.accountNumber}</span>
                    <CopyButton value={user.bankDetails.accountNumber} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Получатель</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.bankDetails.recipient}</span>
                    <CopyButton value={user.bankDetails.recipient} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Корр. счет</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.bankDetails.corrAccount}</span>
                    <CopyButton value={user.bankDetails.corrAccount} />
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Прочие данные */}
            <InfoCard icon={NotepadText} title="Прочие данные">
              <div className="space-y-4 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ИНН</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.otherData.inn}</span>
                    <CopyButton value={user.otherData.inn} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">СНИЛС</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-foreground">{user.otherData.snils}</span>
                    <CopyButton value={user.otherData.snils} />
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3">Документы ({otherDocuments.length})</p>
                <div className="space-y-3">
                  {otherDocuments.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      name={doc.name}
                      size={doc.size}
                      type={doc.type}
                      onPreview={() => handlePreview(doc)}
                      onDownload={() => handleDownload(doc)}
                    />
                  ))}
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
