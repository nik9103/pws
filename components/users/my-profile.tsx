"use client"

import { useState, useRef, useEffect, useCallback, forwardRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { Label } from "@/components/ui/label"
import { ProfileSidebarNav } from "./profile-sidebar-nav"
import { AvatarUploadModal } from "./avatar-upload-modal"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/documents/pagination"
import { cn } from "@/lib/utils"
import { sanitizeText } from "@/lib/text-validation"

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

interface LoginHistoryItem {
  id: string
  device: string
  deviceType: "desktop" | "mobile" | "tablet"
  browser: string
  location: string
  ip: string
  date: string
  time: string
}

const mockLoginHistory: LoginHistoryItem[] = [
  {
    id: "1",
    device: "Windows PC",
    deviceType: "desktop",
    browser: "Chrome 120.0",
    location: "Москва, Россия",
    ip: "192.168.1.1",
    date: "15 янв. 2024",
    time: "14:30",
  },
  {
    id: "2",
    device: "iPhone 13",
    deviceType: "mobile",
    browser: "Safari 17.0",
    location: "Санкт-Петербург, Россия",
    ip: "192.168.1.2",
    date: "10 янв. 2024",
    time: "09:15",
  },
  {
    id: "3",
    device: "iPad Air",
    deviceType: "tablet",
    browser: "Safari 17.0",
    location: "Москва, Россия",
    ip: "192.168.1.3",
    date: "5 янв. 2024",
    time: "16:45",
  },
  {
    id: "4",
    device: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome 121.0",
    location: "Новосибирск, Россия",
    ip: "192.168.1.4",
    date: "28 дек. 2023",
    time: "11:20",
  },
  {
    id: "5",
    device: "Android Phone",
    deviceType: "mobile",
    browser: "Chrome Mobile 119.0",
    location: "Казань, Россия",
    ip: "192.168.1.5",
    date: "22 дек. 2023",
    time: "18:00",
  },
  {
    id: "6",
    device: "Windows Laptop",
    deviceType: "desktop",
    browser: "Edge 120.0",
    location: "Екатеринбург, Россия",
    ip: "192.168.1.6",
    date: "15 дек. 2023",
    time: "10:15",
  },
  {
    id: "7",
    device: "iPhone 14",
    deviceType: "mobile",
    browser: "Safari 17.1",
    location: "Краснодар, Россия",
    ip: "192.168.1.7",
    date: "8 дек. 2023",
    time: "15:45",
  },
  {
    id: "8",
    device: "iPad Pro",
    deviceType: "tablet",
    browser: "Safari 17.0",
    location: "Москва, Россия",
    ip: "192.168.1.8",
    date: "1 дек. 2023",
    time: "12:30",
  },
]

const getDeviceIcon = (type: "desktop" | "mobile" | "tablet") => {
  switch (type) {
    case "desktop":
      return Monitor
    case "mobile":
      return Smartphone
    case "tablet":
      return Tablet
  }
}

// Функция для парсинга даты из строкового формата "15 янв. 2024"
const parseDateString = (dateString: string): Date | null => {
  const monthMap: { [key: string]: number } = {
    "янв": 0, "фев": 1, "мар": 2, "апр": 3, "мая": 4, "июн": 5,
    "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11
  }
  
  try {
    const parts = dateString.split(' ')
    const day = parseInt(parts[0])
    const monthKey = parts[1].replace('.', '')
    const year = parseInt(parts[2])
    const month = monthMap[monthKey]
    
    if (month === undefined || isNaN(day) || isNaN(year)) return null
    
    return new Date(year, month, day)
  } catch {
    return null
  }
}

export function MyProfile() {
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState("personal")
  
  // Section refs for intersection observer
  const sectionRefs = {
    personal: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    email: useRef<HTMLDivElement>(null),
    activity: useRef<HTMLDivElement>(null),
  }
  
  // Personal data - исходные данные для сравнения
  const initialPersonalData = {
    lastName: "Смирнов",
    firstName: "Андрей",
    middleName: "Иванович",
    birthDate: new Date(1990, 0, 15),
    phone: "+79991234567",
  }
  
  const [personalData, setPersonalData] = useState(initialPersonalData)
  const [personalDataErrors, setPersonalDataErrors] = useState<{
    lastName?: string
    firstName?: string
    middleName?: string
    phone?: string
    birthDate?: string
  }>({})
  
  // Password change - исходные данные для сравнения
  const initialPasswordData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  }
  
  const [passwordData, setPasswordData] = useState(initialPasswordData)
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  
  // Email change - исходные данные для сравнения
  const initialEmailData = {
    currentEmail: "andrey.smirnov@example.com",
    newEmail: "",
  }
  
  const [emailData, setEmailData] = useState(initialEmailData)
  const [emailErrors, setEmailErrors] = useState<{
    newEmail?: string
  }>({})

  // Login history filters and pagination
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Avatar - загружаем из localStorage или используем дефолт
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userAvatar") || "/stylized-user-avatar.png"
    }
    return "/stylized-user-avatar.png"
  })
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  
  // Delete account
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
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
      // Высота основного header (56px) + высота шапки профиля (90px) = 146px
      const headerHeight = 146
      const y = element.getBoundingClientRect().top + window.pageYOffset - headerHeight
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" })
      // Also set active section immediately for better UX
      setActiveSection(id)
    }
  }, [])

  // Validation functions
  const validatePersonalDataField = (field: string, value: any) => {
    setPersonalDataErrors((prev) => {
      const newErrors = { ...prev }
      let hasError = false

      switch (field) {
        case "lastName":
          if (!value || !value.trim()) {
            newErrors.lastName = "Фамилия обязательна для заполнения"
            hasError = true
          } else {
            delete newErrors.lastName
          }
          break
        case "firstName":
          if (!value || !value.trim()) {
            newErrors.firstName = "Имя обязательно для заполнения"
            hasError = true
          } else {
            delete newErrors.firstName
          }
          break
        case "middleName":
          // Отчество не обязательное поле, просто очищаем ошибку если есть
          delete newErrors.middleName
          break
        case "phone":
          if (value) {
            // Валидация формата телефона (должен быть код страны и хотя бы несколько цифр)
            const cleanedPhone = value.replace(/\D/g, "")
            // Минимум 10 цифр (код страны + номер), максимум 15 согласно E.164
            if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
              newErrors.phone = "Введите корректный номер телефона"
              hasError = true
            } else if (!value.match(/^\+/)) {
              // Должен начинаться с +
              newErrors.phone = "Номер должен начинаться с кода страны"
              hasError = true
            } else {
              delete newErrors.phone
            }
          } else {
            // Если поле пустое, очищаем ошибку (телефон не обязателен)
            delete newErrors.phone
          }
          break
        case "birthDate":
          if (value && value > new Date()) {
            newErrors.birthDate = "Дата рождения не может быть в будущем"
            hasError = true
          } else {
            delete newErrors.birthDate
          }
          break
      }
      return newErrors
    })
  }

  const validatePasswordField = (field: string, value: string, allData?: typeof passwordData) => {
    const errors: any = {}
    switch (field) {
      case "currentPassword":
        if (!value || !value.trim()) {
          errors.currentPassword = "Введите текущий пароль"
        } else {
          // Очищаем ошибку если поле валидно
          setPasswordErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.currentPassword
            return newErrors
          })
        }
        break
      case "newPassword":
        if (!value || !value.trim()) {
          errors.newPassword = "Введите новый пароль"
        } else if (value.length < 8) {
          errors.newPassword = "Пароль должен быть не менее 8 символов"
        } else {
          // Очищаем ошибку если поле валидно
          setPasswordErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.newPassword
            return newErrors
          })
        }
        // Проверка совпадения с подтверждением, если оно заполнено
        if (allData && allData.confirmPassword) {
          if (value !== allData.confirmPassword) {
            setPasswordErrors((prev) => ({ ...prev, confirmPassword: "Пароли не совпадают" }))
          } else {
            setPasswordErrors((prev) => {
              const newErrors = { ...prev }
              delete newErrors.confirmPassword
              return newErrors
            })
          }
        }
        break
      case "confirmPassword":
        if (!value || !value.trim()) {
          errors.confirmPassword = "Подтвердите пароль"
        } else if (allData && value !== allData.newPassword) {
          errors.confirmPassword = "Пароли не совпадают"
        } else {
          // Очищаем ошибку если пароли совпадают
          setPasswordErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.confirmPassword
            return newErrors
          })
        }
        break
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors((prev) => ({ ...prev, ...errors }))
    }
  }

  const validateEmailField = (value: string) => {
    const errors: any = {}
    if (!value || !value.trim()) {
      errors.newEmail = "Введите email адрес"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.newEmail = "Введите корректный email адрес"
    } else {
      // Очищаем ошибку если поле валидно
      setEmailErrors({})
      return
    }
    setEmailErrors(errors)
  }

  const validateAllPersonalData = (): boolean => {
    const errors: any = {}
    if (!personalData.lastName || !personalData.lastName.trim()) {
      errors.lastName = "Фамилия обязательна для заполнения"
    }
    if (!personalData.firstName || !personalData.firstName.trim()) {
      errors.firstName = "Имя обязательно для заполнения"
    }
    if (personalData.phone) {
      const cleanedPhone = personalData.phone.replace(/\D/g, "")
      // Минимум 10 цифр (код страны + номер), максимум 15 согласно E.164
      if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        errors.phone = "Введите корректный номер телефона"
      } else if (!personalData.phone.match(/^\+/)) {
        errors.phone = "Номер должен начинаться с кода страны"
      }
    }
    if (personalData.birthDate && personalData.birthDate > new Date()) {
      errors.birthDate = "Дата рождения не может быть в будущем"
    }
    setPersonalDataErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAllPasswords = (): boolean => {
    const errors: any = {}
    if (!passwordData.currentPassword || !passwordData.currentPassword.trim()) {
      errors.currentPassword = "Введите текущий пароль"
    }
    if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
      errors.newPassword = "Введите новый пароль"
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Пароль должен быть не менее 8 символов"
    }
    if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Подтвердите пароль"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают"
    }
    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAllEmail = (): boolean => {
    const errors: any = {}
    if (!emailData.newEmail || !emailData.newEmail.trim()) {
      errors.newEmail = "Введите email адрес"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.newEmail)) {
      errors.newEmail = "Введите корректный email адрес"
    }
    setEmailErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Проверка наличия изменений
  const hasPersonalDataChanges = () => {
    return (
      personalData.lastName !== initialPersonalData.lastName ||
      personalData.firstName !== initialPersonalData.firstName ||
      personalData.middleName !== initialPersonalData.middleName ||
      personalData.phone !== initialPersonalData.phone ||
      personalData.birthDate.getTime() !== initialPersonalData.birthDate.getTime()
    )
  }

  const hasPasswordChanges = () => {
    return (
      passwordData.currentPassword !== "" ||
      passwordData.newPassword !== "" ||
      passwordData.confirmPassword !== ""
    )
  }

  const hasEmailChanges = () => {
    return emailData.newEmail !== ""
  }

  const hasAnyChanges = () => {
    return hasPersonalDataChanges() || hasPasswordChanges() || hasEmailChanges()
  }

  // Общая функция сохранения
  const handleSave = () => {
    const changes: string[] = []
    let hasErrors = false

    // Сохранение персональных данных
    if (hasPersonalDataChanges()) {
      if (!validateAllPersonalData()) {
        hasErrors = true
      } else {
        // Здесь будет сохранение только измененных полей
        const changedFields: string[] = []
        if (personalData.lastName !== initialPersonalData.lastName) changedFields.push("lastName")
        if (personalData.firstName !== initialPersonalData.firstName) changedFields.push("firstName")
        if (personalData.middleName !== initialPersonalData.middleName) changedFields.push("middleName")
        if (personalData.phone !== initialPersonalData.phone) changedFields.push("phone")
        if (personalData.birthDate.getTime() !== initialPersonalData.birthDate.getTime()) changedFields.push("birthDate")
        
        // Обновляем исходные данные
        Object.assign(initialPersonalData, personalData)
        changes.push(`Персональные данные (${changedFields.length} полей)`)
        setPersonalDataErrors({})
      }
    }

    // Сохранение пароля
    if (hasPasswordChanges()) {
      if (!validateAllPasswords()) {
        hasErrors = true
      } else {
        setPasswordData(initialPasswordData)
        setPasswordErrors({})
        changes.push("Пароль")
      }
    }

    // Сохранение email
    if (hasEmailChanges()) {
      if (!validateAllEmail()) {
        hasErrors = true
      } else {
        setEmailData({ ...emailData, newEmail: "" })
        setEmailErrors({})
        changes.push("Email")
      }
    }

    if (hasErrors) {
      toast({
        title: "Изменения не сохранены",
        description: "Проверьте правильность заполнения полей",
        variant: "destructive",
      })
      return
    }

    if (changes.length > 0) {
      toast({
        title: "Данные сохранены",
        description: `Изменения сохранены: ${changes.join(", ")}`,
        variant: "success",
      })
    } else {
      toast({
        title: "Нет изменений",
        description: "Нечего сохранять",
        variant: "default",
      })
    }
  }

  const handleAvatarSave = (newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl)
    
    // Сохраняем в localStorage
    if (typeof window !== "undefined") {
      if (newAvatarUrl) {
        localStorage.setItem("userAvatar", newAvatarUrl)
      } else {
        localStorage.removeItem("userAvatar")
      }
      
      // Отправляем событие для обновления header
      window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: newAvatarUrl }))
    }
    
    toast({
      title: "Аватар обновлен",
      variant: "success",
    })
  }

  const handleDeleteAccount = () => {
    setDeleteAccountOpen(false)
    toast({
      title: "Аккаунт удален",
      variant: "destructive",
    })
  }

  const initials = `${personalData.lastName[0]}${personalData.firstName[0]}`

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8">
        {/* Header Section - Sticky */}
        <div className="sticky top-14 z-40 bg-white dark:bg-background" style={{ height: '90px' }}>
          <div className="flex items-center justify-between gap-4 h-full">
            <div className="flex-1">
              <div className="flex items-start justify-start gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white dark:bg-card"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-foreground">Мой профиль</h1>
                  <p className="text-sm text-muted-foreground mt-1">Управление личными данными и настройками аккаунта</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!hasAnyChanges()}
              className="h-9 gap-2"
            >
              Сохранить
            </Button>
          </div>
        </div>

        <div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-[240px_1fr] gap-8">
            {/* Sidebar Navigation */}
            <aside className="sticky top-[146px] self-start">
              <ProfileSidebarNav activeSection={activeSection} onNavigate={handleNavigate} />
            </aside>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Personal Data Section */}
              <ProfileSection
                ref={sectionRefs.personal}
                id="personal"
                icon={User}
                title="Личные данные"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => setAvatarModalOpen(true)}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-md hover:bg-accent transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {personalData.lastName} {personalData.firstName} {personalData.middleName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Администратор</p>
                  </div>
                </div>

                {/* Personal Data Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName" className="text-sm text-muted-foreground mb-1.5 block">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={personalData.lastName}
                        onChange={(e) => {
                          const cleaned = sanitizeText(e.target.value)
                          setPersonalData({ ...personalData, lastName: cleaned })
                          if (personalDataErrors.lastName) {
                            validatePersonalDataField("lastName", cleaned)
                          }
                        }}
                        onBlur={() => validatePersonalDataField("lastName", personalData.lastName)}
                        className={cn("w-full", personalDataErrors.lastName && "border-destructive")}
                        aria-invalid={!!personalDataErrors.lastName}
                      />
                      {personalDataErrors.lastName && (
                        <p className="text-xs text-destructive mt-1">{personalDataErrors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="firstName" className="text-sm text-muted-foreground mb-1.5 block">Имя</Label>
                      <Input
                        id="firstName"
                        value={personalData.firstName}
                        onChange={(e) => {
                          const cleaned = sanitizeText(e.target.value)
                          setPersonalData({ ...personalData, firstName: cleaned })
                          if (personalDataErrors.firstName) {
                            validatePersonalDataField("firstName", cleaned)
                          }
                        }}
                        onBlur={() => validatePersonalDataField("firstName", personalData.firstName)}
                        className={cn("w-full", personalDataErrors.firstName && "border-destructive")}
                        aria-invalid={!!personalDataErrors.firstName}
                      />
                      {personalDataErrors.firstName && (
                        <p className="text-xs text-destructive mt-1">{personalDataErrors.firstName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="middleName" className="text-sm text-muted-foreground mb-1.5 block">Отчество</Label>
                    <Input
                      id="middleName"
                      value={personalData.middleName}
                      onChange={(e) => {
                        const cleaned = sanitizeText(e.target.value)
                        setPersonalData({ ...personalData, middleName: cleaned })
                        if (personalDataErrors.middleName) {
                          validatePersonalDataField("middleName", cleaned)
                        }
                      }}
                      onBlur={() => validatePersonalDataField("middleName", personalData.middleName)}
                      className={cn("w-full", personalDataErrors.middleName && "border-destructive")}
                      aria-invalid={!!personalDataErrors.middleName}
                    />
                    {personalDataErrors.middleName && (
                      <p className="text-xs text-destructive mt-1">{personalDataErrors.middleName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate" className="text-sm text-muted-foreground mb-1.5 block">Дата рождения</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", personalDataErrors.birthDate && "border-destructive")}
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
                                validatePersonalDataField("birthDate", date)
                              }
                            }}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {personalDataErrors.birthDate && (
                        <p className="text-xs text-destructive mt-1">{personalDataErrors.birthDate}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm text-muted-foreground mb-1.5 block">Номер телефона</Label>
                      <PhoneInput
                        id="phone"
                        value={personalData.phone}
                        onChange={(value) => {
                          setPersonalData({ ...personalData, phone: value })
                          if (personalDataErrors.phone) {
                            validatePersonalDataField("phone", value)
                          }
                        }}
                        onBlur={() => validatePersonalDataField("phone", personalData.phone)}
                        className={cn(personalDataErrors.phone && "border-destructive")}
                        aria-invalid={!!personalDataErrors.phone}
                        defaultCountry="RU"
                      />
                      {personalDataErrors.phone && (
                        <p className="text-xs text-destructive mt-1">{personalDataErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </ProfileSection>

              {/* Security Section */}
              <ProfileSection
                ref={sectionRefs.security}
                id="security"
                icon={Lock}
                title="Безопасность"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm text-muted-foreground mb-1.5 block">Текущий пароль</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          if (passwordErrors.currentPassword) {
                            validatePasswordField("currentPassword", e.target.value)
                          }
                        }}
                        onBlur={() => validatePasswordField("currentPassword", passwordData.currentPassword)}
                        className={cn("w-full pr-10", passwordErrors.currentPassword && "border-destructive")}
                        aria-invalid={!!passwordErrors.currentPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-9"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-sm text-muted-foreground mb-1.5 block">Новый пароль</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                          if (passwordErrors.newPassword) {
                            validatePasswordField("newPassword", e.target.value, { ...passwordData, newPassword: e.target.value })
                          } else {
                            // Проверка совпадения с подтверждением при изменении нового пароля
                            if (passwordData.confirmPassword && e.target.value !== passwordData.confirmPassword) {
                              setPasswordErrors((prev) => ({ ...prev, confirmPassword: "Пароли не совпадают" }))
                            } else if (passwordData.confirmPassword && e.target.value === passwordData.confirmPassword) {
                              setPasswordErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.confirmPassword
                                return newErrors
                              })
                            }
                          }
                        }}
                        onBlur={() => validatePasswordField("newPassword", passwordData.newPassword, passwordData)}
                        className={cn("w-full pr-10", passwordErrors.newPassword && "border-destructive")}
                        aria-invalid={!!passwordErrors.newPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-9"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground mb-1.5 block">Подтвердите новый пароль</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => {
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          if (passwordErrors.confirmPassword) {
                            validatePasswordField("confirmPassword", e.target.value, { ...passwordData, confirmPassword: e.target.value })
                          }
                        }}
                        onBlur={() => validatePasswordField("confirmPassword", passwordData.confirmPassword, passwordData)}
                        className={cn("w-full pr-10", passwordErrors.confirmPassword && "border-destructive")}
                        aria-invalid={!!passwordErrors.confirmPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-9"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </ProfileSection>

              {/* Email Section */}
              <ProfileSection
                ref={sectionRefs.email}
                id="email"
                icon={Mail}
                title="Электронная почта"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentEmail" className="text-sm text-muted-foreground mb-1.5 block">Текущий email</Label>
                    <Input
                      id="currentEmail"
                      value={emailData.currentEmail}
                      disabled
                      className="w-full bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newEmail" className="text-sm text-muted-foreground mb-1.5 block">Новый email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => {
                        setEmailData({ ...emailData, newEmail: e.target.value })
                        if (emailErrors.newEmail) {
                          validateEmailField(e.target.value)
                        }
                      }}
                      onBlur={() => validateEmailField(emailData.newEmail)}
                      placeholder="example@email.com"
                      className={cn("w-full", emailErrors.newEmail && "border-destructive")}
                      aria-invalid={!!emailErrors.newEmail}
                    />
                      {emailErrors.newEmail && (
                        <p className="text-xs text-destructive mt-1">{emailErrors.newEmail}</p>
                      )}
                  </div>
                </div>
              </ProfileSection>

              {/* Activity Section */}
              <ProfileSection
                ref={sectionRefs.activity}
                id="activity"
                icon={Monitor}
                title="История входа"
                headerAction={
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 gap-2 pr-2 flex items-center justify-start"
                      >
                        <Calendar className={cn("h-4 w-4 flex-shrink-0", !dateRange.from && !dateRange.to && "text-muted-foreground")} />
                        {dateRange.from && dateRange.to ? (
                          <>
                            <span className="text-foreground truncate min-w-0 flex-1">
                              {format(dateRange.from, "d MMM", { locale: ru })} - {format(dateRange.to, "d MMM yyyy", { locale: ru })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDateRange({})
                                setCurrentPage(1)
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : dateRange.from ? (
                          <>
                            <span className="text-foreground truncate min-w-0 flex-1">
                              {format(dateRange.from, "d MMM yyyy", { locale: ru })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDateRange({})
                                setCurrentPage(1)
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Выберите период</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end" onInteractOutside={(e) => {
                      // Предотвращаем закрытие календаря при клике вне его, если выбрана только одна дата
                      if (dateRange.from && !dateRange.to) {
                        e.preventDefault()
                      }
                    }}>
                      <CalendarComponent
                        mode="range"
                        selected={
                          dateRange.from && dateRange.to
                            ? { from: dateRange.from, to: dateRange.to }
                            : dateRange.from
                            ? { from: dateRange.from, to: undefined }
                            : undefined
                        }
                        onSelect={(range) => {
                          const newRange = { from: range?.from, to: range?.to }
                          setDateRange(newRange)
                          // Закрываем календарь только когда обе даты выбраны
                          if (newRange.from && newRange.to) {
                            // Небольшая задержка чтобы пользователь увидел выбранный диапазон
                            setTimeout(() => {
                              setIsCalendarOpen(false)
                            }, 100)
                          }
                          setCurrentPage(1) // Сбрасываем на первую страницу при изменении фильтра
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                }
              >
                <div className="space-y-4">

                  {/* Filtered and Paginated History */}
                  {(() => {
                    // Фильтрация по датам
                    const filteredHistory = mockLoginHistory.filter((item) => {
                      if (!dateRange.from && !dateRange.to) return true
                      
                      const itemDate = parseDateString(item.date)
                      if (!itemDate) return false
                      
                      if (dateRange.from) {
                        const fromDate = new Date(dateRange.from)
                        fromDate.setHours(0, 0, 0, 0)
                        if (itemDate < fromDate) return false
                      }
                      
                      if (dateRange.to) {
                        const toDate = new Date(dateRange.to)
                        toDate.setHours(23, 59, 59, 999)
                        if (itemDate > toDate) return false
                      }
                      
                      return true
                    })

                    // Пагинация
                    const totalPages = Math.ceil(filteredHistory.length / pageSize)
                    const startIndex = (currentPage - 1) * pageSize
                    const endIndex = startIndex + pageSize
                    const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

                    return (
                      <>
                        <div className="space-y-3">
                          {paginatedHistory.length > 0 ? (
                            paginatedHistory.map((item) => {
                              const DeviceIcon = getDeviceIcon(item.deviceType)
                              return (
                                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-border last:border-0">
                                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg flex-shrink-0">
                                    <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{item.device}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.browser} • {item.location}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.date} в {item.time} • IP: {item.ip}
                                    </p>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                              История входов не найдена за выбранный период
                            </div>
                          )}
                        </div>

                        {/* Pagination */}
                        {filteredHistory.length > 0 && totalPages > 1 && (
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                              setPageSize(size)
                              setCurrentPage(1)
                            }}
                          />
                        )}
                      </>
                    )
                  })()}
                </div>
              </ProfileSection>

            </div>
          </div>

          {/* Delete Account Link */}
          <div className="flex justify-end">
            <button
              onClick={() => setDeleteAccountOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-4 pb-8"
            >
              <Trash2 className="h-4 w-4" />
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={avatarUrl}
        initials={initials}
        onSave={handleAvatarSave}
      />

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent className="sm:max-w-[512px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <AlertDialogTitle className="text-left">Удалить аккаунт?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left mt-2">
              Это действие является необратимым. Все ваши данные, включая персональную информацию, документы и историю активности, будут удалены навсегда. Пожалуйста, убедитесь, что вы хотите продолжить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Удалить аккаунт
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
