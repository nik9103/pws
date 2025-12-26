"use client"

import { useState, useRef, useEffect, useCallback, forwardRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  FileText,
  Building2,
  Calendar,
  Dock,
  NotepadText,
  Landmark,
  BadgeInfo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarNav } from "./edit/sidebar-nav"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { ru } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { User as UserType, UserDocument } from "@/types/user"
import { cn } from "@/lib/utils"
import { sanitizeText } from "@/lib/text-validation"
import { DocumentUploadSlots } from "./edit/document-upload-slots"
import { ScanPreviewModal } from "./scan-preview-modal"
import { Trash2 } from "lucide-react"

// Helper function to sanitize text-only input (no spaces, bad words filtered)
const sanitizeTextOnly = (text: string): string => {
  if (!text) return ''
  // Remove spaces
  let cleaned = text.replace(/\s/g, '')
  // Remove bad words
  cleaned = sanitizeText(cleaned)
  // Only allow letters (Cyrillic and Latin)
  cleaned = cleaned.replace(/[^а-яёА-ЯЁa-zA-Z]/g, '')
  return cleaned
}

// Helper function to sanitize numbers-only input
const sanitizeNumbersOnly = (text: string): string => {
  if (!text) return ''
  // Only allow digits
  return text.replace(/\D/g, '')
}

// Helper function to format passport series/number (only digits, allow space for formatting)
const sanitizePassportNumber = (text: string): string => {
  if (!text) return ''
  // Remove all non-digit characters except spaces
  let cleaned = text.replace(/[^\d\s]/g, '')
  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

// Helper function to format bank card number (only digits, allow spaces for formatting)
const sanitizeCardNumber = (text: string): string => {
  if (!text) return ''
  // Remove all non-digit characters except spaces
  let cleaned = text.replace(/[^\d\s]/g, '')
  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

interface ProfileSectionProps {
  id: string
  icon: React.ElementType
  title: string
  children: React.ReactNode
  headerAction?: React.ReactNode
}

const ProfileSection = forwardRef<HTMLDivElement, ProfileSectionProps>(({ id, icon: Icon, title, children, headerAction }, ref) => {
  return (
    <div ref={ref} id={id} className="bg-white dark:bg-card border border-border rounded-[10px] p-6 shadow-sm scroll-mt-[146px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      {children}
    </div>
  )
})

ProfileSection.displayName = "ProfileSection"

interface UserEditProfileProps {
  user: UserType
}

// Функция для парсинга даты из строкового формата "11 мая 1967"
const parseDateString = (dateString: string): Date | null => {
  const monthMap: { [key: string]: number } = {
    "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4, "июня": 5,
    "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11,
    "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
    "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11
  }
  
  try {
    const parts = dateString.split(' ')
    const day = parseInt(parts[0])
    const monthKey = parts[1].replace('.', '').replace(',', '')
    const year = parseInt(parts[2])
    const month = monthMap[monthKey]
    
    if (month === undefined || isNaN(day) || isNaN(year)) return null
    
    return new Date(year, month, day)
  } catch {
    return null
  }
}

// Функция для парсинга даты выдачи паспорта
const parsePassportDate = (dateString: string): Date | null => {
  return parseDateString(dateString)
}

export function UserEditProfile({ user }: UserEditProfileProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("personal")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  
  // Section refs for intersection observer
  const sectionRefs = {
    personal: useRef<HTMLDivElement>(null),
    passport: useRef<HTMLDivElement>(null),
    other: useRef<HTMLDivElement>(null),
    bank: useRef<HTMLDivElement>(null),
    system: useRef<HTMLDivElement>(null),
  }
  
  // Parse birth date
  const parsedBirthDate = parseDateString(user.birthDate) || new Date(1990, 0, 15)
  const parsedPassportDate = parsePassportDate(user.passport.issueDate) || new Date(2015, 3, 20)
  
  // Form state - Personal data
  const [personalData, setPersonalData] = useState({
    lastName: user.lastName,
    firstName: user.firstName,
    middleName: user.middleName,
    birthDate: parsedBirthDate,
    gender: user.gender || "male",
  })
  
  // Form state - Passport data
  const [passportData, setPassportData] = useState({
    seriesNumber: `${user.passport.series} ${user.passport.number}`,
    issueDate: parsedPassportDate,
    issuedBy: user.passport.issuedBy,
    registrationAddress: user.passport.registrationAddress,
  })
  
  // Form state - Other data
  const [otherData, setOtherData] = useState({
    snils: user.otherData.snils,
    inn: user.otherData.inn,
  })
  
  // Form state - Bank data
  const [bankData, setBankData] = useState({
    cardNumber: user.bankDetails.cardNumber,
    recipient: user.bankDetails.recipient,
    bik: user.bankDetails.bik,
    corrAccount: user.bankDetails.corrAccount,
    accountNumber: user.bankDetails.accountNumber,
  })
  
  // Form state - System data
  const [systemData, setSystemData] = useState({
    email: user.email,
    status: user.status === "blocked" ? "inactive" : user.status,
  })
  
  // Documents state
  const [documents, setDocuments] = useState<UserDocument[]>(user.documents)
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Validation errors
  const [errors, setErrors] = useState<{
    [key: string]: string | undefined
  }>({})
  
  // Initial data for comparison
  const initialPersonalData = {
    lastName: user.lastName,
    firstName: user.firstName,
    middleName: user.middleName,
    birthDate: parsedBirthDate,
    gender: user.gender || "male",
  }
  
  const initialPassportData = {
    seriesNumber: `${user.passport.series} ${user.passport.number}`,
    issueDate: parsedPassportDate,
    issuedBy: user.passport.issuedBy,
    registrationAddress: user.passport.registrationAddress,
  }
  
  const initialOtherData = {
    snils: user.otherData.snils,
    inn: user.otherData.inn,
  }
  
  const initialBankData = {
    cardNumber: user.bankDetails.cardNumber,
    recipient: user.bankDetails.recipient,
    bik: user.bankDetails.bik,
    corrAccount: user.bankDetails.corrAccount,
    accountNumber: user.bankDetails.accountNumber,
  }
  
  const initialSystemData = {
    email: user.email,
    status: user.status === "blocked" ? "inactive" : user.status,
  }
  
  const initialDocuments = user.documents
  
  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0
        let activeId: string | null = null

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            activeId = entry.target.id
          }
        })

        if (activeId) {
          setActiveSection(activeId)
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: [0, 0.1, 0.5, 1] },
    )

    const refs = Object.values(sectionRefs)
    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => observer.disconnect()
  }, [])

  const handleNavigate = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 146
      const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" })
      setActiveSection(id)
    }
  }, [])

  // Check for changes
  const hasPersonalDataChanges = () => {
    return (
      personalData.lastName !== initialPersonalData.lastName ||
      personalData.firstName !== initialPersonalData.firstName ||
      personalData.middleName !== initialPersonalData.middleName ||
      personalData.birthDate.getTime() !== initialPersonalData.birthDate.getTime() ||
      personalData.gender !== initialPersonalData.gender
    )
  }
  
  const hasPassportDataChanges = () => {
    return (
      passportData.seriesNumber !== initialPassportData.seriesNumber ||
      passportData.issueDate.getTime() !== initialPassportData.issueDate.getTime() ||
      passportData.issuedBy !== initialPassportData.issuedBy ||
      passportData.registrationAddress !== initialPassportData.registrationAddress
    )
  }
  
  const hasOtherDataChanges = () => {
    return (
      otherData.snils !== initialOtherData.snils ||
      otherData.inn !== initialOtherData.inn
    )
  }
  
  const hasBankDataChanges = () => {
    return (
      bankData.cardNumber !== initialBankData.cardNumber ||
      bankData.recipient !== initialBankData.recipient ||
      bankData.bik !== initialBankData.bik ||
      bankData.corrAccount !== initialBankData.corrAccount ||
      bankData.accountNumber !== initialBankData.accountNumber
    )
  }
  
  const hasSystemDataChanges = () => {
    return (
      systemData.email !== initialSystemData.email ||
      systemData.status !== initialSystemData.status
    )
  }
  
  const hasDocumentsChanges = () => {
    return JSON.stringify(documents) !== JSON.stringify(initialDocuments)
  }
  
  const hasAnyChanges = () => {
    return (
      hasPersonalDataChanges() ||
      hasPassportDataChanges() ||
      hasOtherDataChanges() ||
      hasBankDataChanges() ||
      hasSystemDataChanges() ||
      hasDocumentsChanges()
    )
  }
  
  // Validation functions
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case "lastName":
        if (!value || !value.trim()) {
          newErrors.lastName = "Фамилия обязательна для заполнения"
        } else if (/\s/.test(value)) {
          newErrors.lastName = "Фамилия не должна содержать пробелы"
        } else {
          delete newErrors.lastName
        }
        break
      case "firstName":
        if (!value || !value.trim()) {
          newErrors.firstName = "Имя обязательно для заполнения"
        } else if (/\s/.test(value)) {
          newErrors.firstName = "Имя не должно содержать пробелы"
        } else {
          delete newErrors.firstName
        }
        break
      case "middleName":
        if (value && /\s/.test(value)) {
          newErrors.middleName = "Отчество не должно содержать пробелы"
        } else {
          delete newErrors.middleName
        }
        break
      case "passportSeriesNumber":
        const passportDigits = value.replace(/\D/g, '')
        if (!value || !value.trim()) {
          newErrors.passportSeriesNumber = "Серия и номер паспорта обязательны"
        } else if (passportDigits.length !== 10) {
          newErrors.passportSeriesNumber = "Серия и номер паспорта должны содержать 10 цифр"
        } else {
          delete newErrors.passportSeriesNumber
        }
        break
      case "snils":
        const snilsDigits = value.replace(/\D/g, '')
        if (!value || !value.trim()) {
          newErrors.snils = "СНИЛС обязателен для заполнения"
        } else if (snilsDigits.length !== 11) {
          newErrors.snils = "СНИЛС должен содержать 11 цифр"
        } else {
          delete newErrors.snils
        }
        break
      case "inn":
        const innDigits = value.replace(/\D/g, '')
        if (!value || !value.trim()) {
          newErrors.inn = "ИНН обязателен для заполнения"
        } else if (innDigits.length !== 10 && innDigits.length !== 12) {
          newErrors.inn = "ИНН должен содержать 10 или 12 цифр"
        } else {
          delete newErrors.inn
        }
        break
      case "cardNumber":
        const cardDigits = value.replace(/\D/g, '')
        if (value && cardDigits.length !== 16) {
          newErrors.cardNumber = "Номер карты должен содержать 16 цифр"
        } else {
          delete newErrors.cardNumber
        }
        break
      case "bik":
        const bikDigits = value.replace(/\D/g, '')
        if (value && bikDigits.length !== 9) {
          newErrors.bik = "БИК должен содержать 9 цифр"
        } else {
          delete newErrors.bik
        }
        break
      case "corrAccount":
        const corrDigits = value.replace(/\D/g, '')
        if (value && corrDigits.length !== 20) {
          newErrors.corrAccount = "Корреспондентский счет должен содержать 20 цифр"
        } else {
          delete newErrors.corrAccount
        }
        break
      case "accountNumber":
        const accountDigits = value.replace(/\D/g, '')
        if (value && accountDigits.length !== 20) {
          newErrors.accountNumber = "Расчетный счет должен содержать 20 цифр"
        } else {
          delete newErrors.accountNumber
        }
        break
      case "email":
        if (!value || !value.trim()) {
          newErrors.email = "Email обязателен для заполнения"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Введите корректный email адрес"
        } else {
          delete newErrors.email
        }
        break
    }
    
    setErrors(newErrors)
  }
  
  const validateAll = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    // Personal data validation
    if (!personalData.lastName || !personalData.lastName.trim()) {
      newErrors.lastName = "Фамилия обязательна для заполнения"
    } else if (/\s/.test(personalData.lastName)) {
      newErrors.lastName = "Фамилия не должна содержать пробелы"
    }
    
    if (!personalData.firstName || !personalData.firstName.trim()) {
      newErrors.firstName = "Имя обязательно для заполнения"
    } else if (/\s/.test(personalData.firstName)) {
      newErrors.firstName = "Имя не должно содержать пробелы"
    }
    
    if (personalData.middleName && /\s/.test(personalData.middleName)) {
      newErrors.middleName = "Отчество не должно содержать пробелы"
    }
    
    // Passport validation
    const passportDigits = passportData.seriesNumber.replace(/\D/g, '')
    if (!passportData.seriesNumber || !passportData.seriesNumber.trim()) {
      newErrors.passportSeriesNumber = "Серия и номер паспорта обязательны"
    } else if (passportDigits.length !== 10) {
      newErrors.passportSeriesNumber = "Серия и номер паспорта должны содержать 10 цифр"
    }
    
    // Other data validation
    const snilsDigits = otherData.snils.replace(/\D/g, '')
    if (!otherData.snils || !otherData.snils.trim()) {
      newErrors.snils = "СНИЛС обязателен для заполнения"
    } else if (snilsDigits.length !== 11) {
      newErrors.snils = "СНИЛС должен содержать 11 цифр"
    }
    
    const innDigits = otherData.inn.replace(/\D/g, '')
    if (!otherData.inn || !otherData.inn.trim()) {
      newErrors.inn = "ИНН обязателен для заполнения"
    } else if (innDigits.length !== 10 && innDigits.length !== 12) {
      newErrors.inn = "ИНН должен содержать 10 или 12 цифр"
    }
    
    // Bank data validation
    if (bankData.cardNumber) {
      const cardDigits = bankData.cardNumber.replace(/\D/g, '')
      if (cardDigits.length !== 16) {
        newErrors.cardNumber = "Номер карты должен содержать 16 цифр"
      }
    }
    
    if (bankData.bik) {
      const bikDigits = bankData.bik.replace(/\D/g, '')
      if (bikDigits.length !== 9) {
        newErrors.bik = "БИК должен содержать 9 цифр"
      }
    }
    
    if (bankData.corrAccount) {
      const corrDigits = bankData.corrAccount.replace(/\D/g, '')
      if (corrDigits.length !== 20) {
        newErrors.corrAccount = "Корреспондентский счет должен содержать 20 цифр"
      }
    }
    
    if (bankData.accountNumber) {
      const accountDigits = bankData.accountNumber.replace(/\D/g, '')
      if (accountDigits.length !== 20) {
        newErrors.accountNumber = "Расчетный счет должен содержать 20 цифр"
      }
    }
    
    // System data validation
    if (!systemData.email || !systemData.email.trim()) {
      newErrors.email = "Email обязателен для заполнения"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(systemData.email)) {
      newErrors.email = "Введите корректный email адрес"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handlePreview = (doc: UserDocument) => {
    setPreviewDocument(doc)
    setIsPreviewOpen(true)
  }
  
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setPreviewDocument(null)
  }

  const handleSave = () => {
    if (!hasAnyChanges()) {
      toast({
        title: "Нет изменений",
        description: "Нечего сохранять",
        variant: "default",
      })
      return
    }

    if (!validateAll()) {
      toast({
        title: "Изменения не сохранены",
        description: "Проверьте правильность заполнения полей",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Данные сохранены",
      description: "Изменения успешно сохранены",
      variant: "success",
    })
  }

  const handleCancel = () => {
    if (hasAnyChanges()) {
      setShowCancelDialog(true)
    } else {
      router.push(`/users/${user.id}`)
    }
  }

  const handleConfirmCancel = () => {
    setShowCancelDialog(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
      setPendingNavigation(null)
    } else {
      router.push(`/users/${user.id}`)
    }
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (hasAnyChanges()) {
      e.preventDefault()
      setPendingNavigation(href)
      setShowCancelDialog(true)
    }
  }

  // Перехват навигации при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasChanges = hasAnyChanges()
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalData, passportData, otherData, bankData, systemData, documents])

  const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8 pb-8">
        {/* Header Section - Sticky */}
        <div className="sticky top-14 z-40 bg-background" style={{ height: '90px' }}>
          <div className="flex items-center justify-between gap-4 h-full">
            <div className="flex-1">
              <div className="flex items-start justify-start gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-background dark:bg-card"
                  onClick={() => {
                    if (hasAnyChanges()) {
                      setPendingNavigation(null)
                      setShowCancelDialog(true)
                    } else {
                      router.back()
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-foreground">Редактирование профиля</h1>
                  <p className="text-sm text-muted-foreground mt-1">{fullName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="h-9"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasAnyChanges()}
                className="h-9 gap-2"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        <div>
          {/* Two Column Layout */}
          <div className="grid grid-cols-[240px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <aside className="sticky top-[146px] self-start">
              <SidebarNav activeSection={activeSection} onNavigate={handleNavigate} />
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Personal Data Section */}
              <ProfileSection
                ref={sectionRefs.personal}
                id="personal"
                icon={User}
                title="Персональные данные"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName" className="text-sm text-foreground mb-1.5 block">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={personalData.lastName}
                        onChange={(e) => {
                          const cleaned = sanitizeTextOnly(e.target.value)
                          setPersonalData({ ...personalData, lastName: cleaned })
                          if (errors.lastName) {
                            validateField("lastName", cleaned)
                          }
                        }}
                        onBlur={() => validateField("lastName", personalData.lastName)}
                        className={cn("w-full", errors.lastName && "border-destructive")}
                        aria-invalid={!!errors.lastName}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="firstName" className="text-sm text-foreground mb-1.5 block">Имя</Label>
                      <Input
                        id="firstName"
                        value={personalData.firstName}
                        onChange={(e) => {
                          const cleaned = sanitizeTextOnly(e.target.value)
                          setPersonalData({ ...personalData, firstName: cleaned })
                          if (errors.firstName) {
                            validateField("firstName", cleaned)
                          }
                        }}
                        onBlur={() => validateField("firstName", personalData.firstName)}
                        className={cn("w-full", errors.firstName && "border-destructive")}
                        aria-invalid={!!errors.firstName}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="middleName" className="text-sm text-foreground mb-1.5 block">Отчество</Label>
                      <Input
                        id="middleName"
                        value={personalData.middleName}
                        onChange={(e) => {
                          const cleaned = sanitizeTextOnly(e.target.value)
                          setPersonalData({ ...personalData, middleName: cleaned })
                          if (errors.middleName) {
                            validateField("middleName", cleaned)
                          }
                        }}
                        onBlur={() => validateField("middleName", personalData.middleName)}
                        className={cn("w-full", errors.middleName && "border-destructive")}
                        aria-invalid={!!errors.middleName}
                      />
                      {errors.middleName && (
                        <p className="text-xs text-destructive mt-1">{errors.middleName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="birthDate" className="text-sm text-foreground mb-1.5 block">Дата рождения</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {personalData.birthDate ? (
                              format(personalData.birthDate, "PPP", { locale: ru })
                            ) : (
                              <span>Выберите дату</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={personalData.birthDate}
                            onSelect={(date) => {
                              if (date) {
                                setPersonalData({ ...personalData, birthDate: date })
                              }
                            }}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground mb-1.5 block">Пол</Label>
                    <RadioGroup
                      value={personalData.gender}
                      onValueChange={(value) => setPersonalData({ ...personalData, gender: value as "male" | "female" })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">Мужской</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">Женский</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </ProfileSection>

              {/* Passport Data Section */}
              <ProfileSection
                ref={sectionRefs.passport}
                id="passport"
                icon={Dock}
                title="Паспортные данные"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passportSeriesNumber" className="text-sm text-foreground mb-1.5 block">Серия и номер</Label>
                      <Input
                        id="passportSeriesNumber"
                        value={passportData.seriesNumber}
                        onChange={(e) => {
                          const cleaned = sanitizePassportNumber(e.target.value)
                          setPassportData({ ...passportData, seriesNumber: cleaned })
                          if (errors.passportSeriesNumber) {
                            validateField("passportSeriesNumber", cleaned)
                          }
                        }}
                        onBlur={() => validateField("passportSeriesNumber", passportData.seriesNumber)}
                        className={cn("w-full", errors.passportSeriesNumber && "border-destructive")}
                        aria-invalid={!!errors.passportSeriesNumber}
                        placeholder="1234 123456"
                      />
                      {errors.passportSeriesNumber && (
                        <p className="text-xs text-destructive mt-1">{errors.passportSeriesNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="passportIssueDate" className="text-sm text-foreground mb-1.5 block">Дата выдачи</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {passportData.issueDate ? (
                              format(passportData.issueDate, "PPP", { locale: ru })
                            ) : (
                              <span>Выберите дату</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={passportData.issueDate}
                            onSelect={(date) => {
                              if (date) {
                                setPassportData({ ...passportData, issueDate: date })
                              }
                            }}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issuedBy" className="text-sm text-foreground mb-1.5 block">Кем выдан</Label>
                      <Textarea
                        id="issuedBy"
                        value={passportData.issuedBy}
                        onChange={(e) => setPassportData({ ...passportData, issuedBy: e.target.value })}
                        className="w-full"
                        placeholder="УФМС России по Калининградской области"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationAddress" className="text-sm text-foreground mb-1.5 block">Место регистрации</Label>
                      <Textarea
                        id="registrationAddress"
                        value={passportData.registrationAddress}
                        onChange={(e) => setPassportData({ ...passportData, registrationAddress: e.target.value })}
                        className="w-full"
                        placeholder="ул. Лейтенанта Яналова, д. 42, кв. 18, г. Калининград"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-foreground">Загруженные документы</Label>
                    <DocumentUploadSlots
                      documents={documents}
                      onDocumentsChange={setDocuments}
                      onPreview={handlePreview}
                      category="passport"
                      slotTitles={["Скан паспорта с фото", "Скан паспорта с пропиской"]}
                    />
                  </div>
                </div>
              </ProfileSection>

              {/* Other Data Section */}
              <ProfileSection
                ref={sectionRefs.other}
                id="other"
                icon={NotepadText}
                title="Прочие данные"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="snils" className="text-sm text-foreground mb-1.5 block">СНИЛС</Label>
                      <Input
                        id="snils"
                        value={otherData.snils}
                        onChange={(e) => {
                          const cleaned = sanitizeNumbersOnly(e.target.value)
                          setOtherData({ ...otherData, snils: cleaned })
                          if (errors.snils) {
                            validateField("snils", cleaned)
                          }
                        }}
                        onBlur={() => validateField("snils", otherData.snils)}
                        className={cn("w-full", errors.snils && "border-destructive")}
                        aria-invalid={!!errors.snils}
                        placeholder="12345678901"
                      />
                      {errors.snils && (
                        <p className="text-xs text-destructive mt-1">{errors.snils}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="inn" className="text-sm text-foreground mb-1.5 block">ИНН</Label>
                      <Input
                        id="inn"
                        value={otherData.inn}
                        onChange={(e) => {
                          const cleaned = sanitizeNumbersOnly(e.target.value)
                          setOtherData({ ...otherData, inn: cleaned })
                          if (errors.inn) {
                            validateField("inn", cleaned)
                          }
                        }}
                        onBlur={() => validateField("inn", otherData.inn)}
                        className={cn("w-full", errors.inn && "border-destructive")}
                        aria-invalid={!!errors.inn}
                        placeholder="1234567890"
                      />
                      {errors.inn && (
                        <p className="text-xs text-destructive mt-1">{errors.inn}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm text-foreground">Загруженные документы</Label>
                    <DocumentUploadSlots
                      documents={documents}
                      onDocumentsChange={setDocuments}
                      onPreview={handlePreview}
                      category="other"
                      slotTitles={["Снилс", "ИНН"]}
                    />
                  </div>
                </div>
              </ProfileSection>

              {/* Bank Data Section */}
              <ProfileSection
                ref={sectionRefs.bank}
                id="bank"
                icon={Landmark}
                title="Банковские реквизиты"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm text-foreground mb-1.5 block">Номер карты</Label>
                      <Input
                        id="cardNumber"
                        value={bankData.cardNumber}
                        onChange={(e) => {
                          const cleaned = sanitizeCardNumber(e.target.value)
                          setBankData({ ...bankData, cardNumber: cleaned })
                          if (errors.cardNumber) {
                            validateField("cardNumber", cleaned)
                          }
                        }}
                        onBlur={() => validateField("cardNumber", bankData.cardNumber)}
                        className={cn("w-full", errors.cardNumber && "border-destructive")}
                        aria-invalid={!!errors.cardNumber}
                        placeholder="1234 1111 1111 1111"
                      />
                      {errors.cardNumber && (
                        <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="recipient" className="text-sm text-foreground mb-1.5 block">Получатель</Label>
                      <Input
                        id="recipient"
                        value={bankData.recipient}
                        onChange={(e) => setBankData({ ...bankData, recipient: e.target.value })}
                        className="w-full"
                        placeholder="Иванов Иван Иванович"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bik" className="text-sm text-foreground mb-1.5 block">БИК</Label>
                      <Input
                        id="bik"
                        value={bankData.bik}
                        onChange={(e) => {
                          const cleaned = sanitizeNumbersOnly(e.target.value)
                          setBankData({ ...bankData, bik: cleaned })
                          if (errors.bik) {
                            validateField("bik", cleaned)
                          }
                        }}
                        onBlur={() => validateField("bik", bankData.bik)}
                        className={cn("w-full", errors.bik && "border-destructive")}
                        aria-invalid={!!errors.bik}
                        placeholder="044525225"
                      />
                      {errors.bik && (
                        <p className="text-xs text-destructive mt-1">{errors.bik}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="corrAccount" className="text-sm text-foreground mb-1.5 block">Корр. счет</Label>
                      <Input
                        id="corrAccount"
                        value={bankData.corrAccount}
                        onChange={(e) => {
                          const cleaned = sanitizeNumbersOnly(e.target.value)
                          setBankData({ ...bankData, corrAccount: cleaned })
                          if (errors.corrAccount) {
                            validateField("corrAccount", cleaned)
                          }
                        }}
                        onBlur={() => validateField("corrAccount", bankData.corrAccount)}
                        className={cn("w-full", errors.corrAccount && "border-destructive")}
                        aria-invalid={!!errors.corrAccount}
                        placeholder="30101810400000000225"
                      />
                      {errors.corrAccount && (
                        <p className="text-xs text-destructive mt-1">{errors.corrAccount}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-sm text-foreground mb-1.5 block">Расчетный счет</Label>
                    <Input
                      id="accountNumber"
                      value={bankData.accountNumber}
                      onChange={(e) => {
                        const cleaned = sanitizeNumbersOnly(e.target.value)
                        setBankData({ ...bankData, accountNumber: cleaned })
                        if (errors.accountNumber) {
                          validateField("accountNumber", cleaned)
                        }
                      }}
                      onBlur={() => validateField("accountNumber", bankData.accountNumber)}
                      className={cn("w-full", errors.accountNumber && "border-destructive")}
                      aria-invalid={!!errors.accountNumber}
                      placeholder="40702810800000000001"
                    />
                    {errors.accountNumber && (
                      <p className="text-xs text-destructive mt-1">{errors.accountNumber}</p>
                    )}
                  </div>
                </div>
              </ProfileSection>

              {/* System Data Section */}
              <ProfileSection
                ref={sectionRefs.system}
                id="system"
                icon={BadgeInfo}
                title="Системная информация"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm text-foreground mb-1.5 block">Email</Label>
                    <Input
                      id="email"
                      value={systemData.email}
                      onChange={(e) => {
                        setSystemData({ ...systemData, email: e.target.value })
                        if (errors.email) {
                          validateField("email", e.target.value)
                        }
                      }}
                      onBlur={() => validateField("email", systemData.email)}
                      className={cn("w-full", errors.email && "border-destructive")}
                      type="email"
                      placeholder="ivanov@example.com"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm text-foreground mb-1.5 block">Статус</Label>
                    <Select
                      value={systemData.status}
                      onValueChange={(value) => setSystemData({ ...systemData, status: value as "active" | "inactive" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Активный</SelectItem>
                        <SelectItem value="inactive">Заблокирован</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </ProfileSection>
            </div>
          </div>
        </div>
      </div>
      
      <ScanPreviewModal
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />

      <AlertDialog 
        open={showCancelDialog} 
        onOpenChange={(open) => {
          setShowCancelDialog(open)
          if (!open) {
            setPendingNavigation(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите уйти?</AlertDialogTitle>
            <AlertDialogDescription>
              Изменения не были сохранены. При выходе они будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowCancelDialog(false)
              setPendingNavigation(null)
            }}>
              Остаться
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Да, уйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

