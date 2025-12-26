"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
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
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { ArrowLeft, Calendar as CalendarIcon, X, Trash2, Search, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Парсинг даты из формата "DD.MM.YYYY"
const parseDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined
  const parts = dateStr.split('.')
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  return undefined
}

// Форматирование даты в формат "DD.MM.YYYY"
const formatDate = (date: Date | undefined): string => {
  if (!date) return ""
  return format(date, "dd.MM.yyyy", { locale: ru })
}

// Маппинг латинских символов на кириллицу (визуально похожие)
const latinToCyrillicMap: Record<string, string> = {
  'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'x': 'х', 'y': 'у',
  'A': 'а', 'E': 'е', 'O': 'о', 'P': 'р', 'C': 'с', 'X': 'х', 'Y': 'у',
  'B': 'в', 'H': 'н', 'K': 'к', 'M': 'м', 'T': 'т', 'I': 'и', 'N': 'н',
  'b': 'в', 'h': 'н', 'k': 'к', 'm': 'м', 't': 'т', 'i': 'и', 'n': 'н',
  'u': 'у', 'U': 'у', 's': 'с', 'S': 'с', 'd': 'д', 'D': 'д',
  'f': 'ф', 'F': 'ф', 'g': 'г', 'G': 'г', 'l': 'л', 'L': 'л',
}

// Корни запрещенных слов для проверки через регулярные выражения
const forbiddenRoots = [
  // Основные корни (русские)
  { root: 'ху[йя]', variants: ['хуй', 'хуя', 'хуе', 'хуё'] },
  { root: 'п[иы]зд', variants: ['пизд', 'пызд'] },
  { root: 'еб', variants: ['еб'] },
  { root: 'ёб', variants: ['ёб'] },
  { root: 'ебан', variants: ['ебан'] },
  { root: 'ебнут', variants: ['ебнут'] },
  { root: 'бл[яь]', variants: ['бля', 'бль'] },
  { root: 'бляд', variants: ['бляд'] },
  { root: 'с[уы]к[а]?', variants: ['сук', 'сык', 'сука', 'сыка'] },
  { root: 'муд[аяк]?', variants: ['муд', 'муда', 'мудя', 'мудак'] },
  { root: 'долбо', variants: ['долбо'] },
  { root: 'г[ао]нд[оа]н', variants: ['гандон', 'гондон'] },
  { root: 'мраз', variants: ['мраз'] },
  { root: 'урод', variants: ['урод'] },
  { root: 'п[иы]д[оа]р?', variants: ['пид', 'пыд', 'пидор', 'пыдор', 'пида', 'пыда'] },
  { root: 'педр', variants: ['педр'] },
  { root: 'шлю[хш]', variants: ['шлюх', 'шлюш'] },
  { root: 'простит', variants: ['простит'] },
  { root: 'сос[иал]?', variants: ['соси', 'сосал'] },
  { root: 'дроч', variants: ['дроч'] },
  { root: 'залуп', variants: ['залуп'] },
  { root: 'манда', variants: ['манда'] },
  { root: 'сран', variants: ['сран'] },
  { root: 'говн', variants: ['говн'] },
  { root: 'дерьм', variants: ['дерьм'] },
  { root: 'твар', variants: ['твар'] },
  { root: 'ублюд', variants: ['ублюд'] },
  { root: 'жоп', variants: ['жоп'] },
  { root: 'очк', variants: ['очк'] },
  { root: 'анус', variants: ['анус'] },
  { root: 'секс', variants: ['секс'] },
  { root: 'порн', variants: ['порн'] },
  { root: 'минет', variants: ['минет'] },
  // Английские корни (будут нормализованы через latinToCyrillicMap)
  { root: 'ф[ау]к', variants: ['фак', 'фук'] }, // fuck
  { root: 'ш[иы]т', variants: ['шит', 'шыт'] }, // shit
  { root: 'б[иы]тч', variants: ['битч', 'бытч'] }, // bitch
  { root: 'а[сз][сз]', variants: ['асс', 'азз'] }, // ass
  { root: 'к[оа]к', variants: ['кок', 'как'] }, // cock
  { root: 'д[иы]к', variants: ['дик', 'дык'] }, // dick
]

// Функция нормализации текста для проверки (без пробелов для поиска запрещенных слов)
const normalizeText = (text: string): string => {
  if (!text) return ''
  
  // 1. Приводим к нижнему регистру
  let normalized = text.toLowerCase()
  
  // 2. Заменяем латинские символы на кириллицу
  normalized = normalized.replace(/[a-z]/g, (char) => latinToCyrillicMap[char] || char)
  
  // 3. Схлопываем повторения букв (3+ повторения до 2)
  normalized = normalized.replace(/([а-яё])\1{2,}/gi, '$1$1')
  
  // 4. Удаляем все неалфавитные символы (включая пробелы для поиска)
  normalized = normalized.replace(/[^а-яё]/gi, '')
  
  // 5. Схлопываем оставшиеся повторения букв (2+ одинаковых буквы подряд)
  normalized = normalized.replace(/([а-яё])\1+/gi, '$1')
  
  return normalized
}

// Функция для создания карты позиций: нормализованный индекс -> исходный индекс
const createPositionMap = (text: string): Array<number> => {
  const map: Array<number> = []
  let normalizedPos = 0
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const normalizedChar = normalizeText(char)
    
    if (normalizedChar) {
      map[normalizedPos] = i
      normalizedPos++
    }
  }
  
  return map
}

// Функция создания регулярного выражения для корня слова
const createRootRegex = (root: string): RegExp => {
  // Заменяем символы в квадратных скобках на группу альтернатив
  // Например: 'ху[йя]' -> 'ху(й|я)'
  const pattern = root
    .replace(/\[([^\]]+)\]/g, (_, chars) => {
      // Создаем группу альтернатив для символов в скобках
      return `(${chars.split('').join('|')})`
    })
    // Добавляем возможность разделителей между буквами (0 или более неалфавитных символов)
    .split('')
    .map((char, index, arr) => {
      if (index === 0 || index === arr.length - 1) return char
      // Между буквами могут быть разделители
      if (/[а-яё()|]/.test(char)) {
        return char
      }
      return char
    })
    .join('')
  
  // Создаем паттерн, который допускает разделители между буквами
  const finalPattern = pattern
    .split('')
    .filter(char => /[а-яё()|]/.test(char))
    .join('')
    .replace(/([а-яё])/g, '$1[^а-яё]*')
    .replace(/\(/g, '(?:')
    .replace(/\|/g, '|')
  
  return new RegExp(finalPattern, 'gi')
}

// Функция очистки текста от запрещенных слов (улучшенная версия с корнями)
// Сохраняет пробелы в тексте, но удаляет запрещенные слова
const sanitizeText = (text: string): string => {
  if (!text) return text
  
  // Пробелы должны сохраняться - они нужны для написания наименований
  // Функция удаляет только запрещенные слова, но НЕ пробелы
  
  let result = text
  let changed = true
  let iterations = 0
  const maxIterations = 10 // Защита от бесконечного цикла
  
  // Повторяем проверку, пока находим запрещенные слова
  while (changed && iterations < maxIterations) {
    iterations++
    changed = false
    const normalized = normalizeText(result)
    
    // Проверяем каждый корень
    for (const { root } of forbiddenRoots) {
      // Создаем паттерн для поиска корня с учетом разделителей (но не пробелов)
      let pattern = root
        // Обрабатываем группы альтернатив [йя] -> (й|я)
        .replace(/\[([^\]]+)\]/g, (_, chars) => {
          return `(${chars.split('').join('|')})`
        })
        // Разбиваем на символы и добавляем разделители между буквами
        .split('')
        .filter(char => /[а-яё()|]/.test(char))
        .map((char) => {
          if (char === '(' || char === '|' || char === ')') return char
          // Экранируем специальные символы и добавляем разделители (но не пробелы)
          return `${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^а-яё\\s]*`
        })
        .join('')
      
      const regex = new RegExp(pattern, 'gi')
      
      // Находим все вхождения в нормализованном тексте
      const matches: Array<{ start: number; end: number }> = []
      let match
      const testNormalized = normalized
      
      // Сбрасываем lastIndex для глобального regex
      regex.lastIndex = 0
      while ((match = regex.exec(testNormalized)) !== null) {
        matches.push({ 
          start: match.index, 
          end: match.index + match[0].length
        })
      }
      
      if (matches.length === 0) continue
      
      // Создаем карту позиций для сопоставления нормализованного и исходного текста
      const positionMap = createPositionMap(result)
      
      // Удаляем найденные слова из исходного текста (с конца к началу)
      for (let i = matches.length - 1; i >= 0; i--) {
        const { start, end } = matches[i]
        
        // Находим соответствующие позиции в исходном тексте через карту позиций
        if (positionMap[start] === undefined || positionMap[end - 1] === undefined) continue
        
        const origStart = positionMap[start]
        const origEnd = positionMap[end - 1] + 1
        
        // Расширяем границы, чтобы включить разделители (но НЕ пробелы)
        let actualStart = origStart
        let actualEnd = origEnd
        
        // Ищем начало слова (может быть разделитель перед ним, но НЕ пробел)
        while (actualStart > 0) {
          const char = result[actualStart - 1]
          if (char === ' ') {
            // Останавливаемся на пробеле - пробелы НЕ удаляем
            break
          }
          if (!/[а-яёa-z]/i.test(char)) {
            actualStart--
          } else {
            break
          }
        }
        
        // Ищем конец слова (может быть разделитель после него, но НЕ пробел)
        while (actualEnd < result.length) {
          const char = result[actualEnd]
          if (char === ' ') {
            // Останавливаемся на пробеле - пробелы НЕ удаляем
            break
          }
          if (!/[а-яёa-z]/i.test(char)) {
            actualEnd++
          } else {
            break
          }
        }
        
        // Удаляем найденный фрагмент, НЕ трогая пробелы вокруг
        if (actualEnd > actualStart) {
          // Проверяем символы вокруг удаляемого фрагмента
          const beforeChar = actualStart > 0 ? result[actualStart - 1] : ''
          const afterChar = actualEnd < result.length ? result[actualEnd] : ''
          
          // Удаляем только сам фрагмент, пробелы оставляем
          let newStart = actualStart
          let newEnd = actualEnd
          
          // Если перед и после удаляемого фрагмента пробелы, удаляем один из них
          // чтобы не было двойного пробела после удаления
          if (beforeChar === ' ' && afterChar === ' ') {
            // Удаляем один пробел (перед фрагментом), чтобы не было двойного пробела
            newStart = actualStart - 1
          }
          // Если только перед пробел, НЕ удаляем его - он нужен для разделения слов
          // Если только после пробел, НЕ удаляем его - он нужен для разделения слов
          
          result = result.substring(0, newStart) + result.substring(newEnd)
          changed = true
          break // Прерываем цикл, чтобы пересчитать normalized и positionMap
        }
      }
      
      if (changed) break // Прерываем проверку корней, чтобы пересчитать normalized
    }
  }
  
  // Очищаем множественные пробелы (но оставляем одиночные)
  // НЕ используем trim(), чтобы не удалять пробелы в начале и конце
  result = result.replace(/\s{2,}/g, ' ')
  
  return result
}

// Валидация ОГРН (13 цифр)
const validateOGRN = (ogrn: string): string | null => {
  if (!ogrn) return null
  const cleaned = ogrn.replace(/\s/g, '')
  if (!/^\d+$/.test(cleaned)) {
    return 'ОГРН должен состоять только из цифр'
  }
  if (cleaned.length !== 13) {
    return 'ОГРН должен содержать 13 цифр'
  }
  return null
}

// Валидация ИНН (10 или 12 цифр)
const validateINN = (inn: string): string | null => {
  if (!inn) return null
  const cleaned = inn.replace(/\s/g, '')
  if (!/^\d+$/.test(cleaned)) {
    return 'ИНН должен состоять только из цифр'
  }
  if (cleaned.length !== 10 && cleaned.length !== 12) {
    return 'ИНН должен содержать 10 или 12 цифр'
  }
  return null
}

export default function CompetitionNewPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [coOrganizer, setCoOrganizer] = useState<{ name: string; ogrn: string; inn: string } | null>(null)
  
  // Состояния для поиска в выпадающих списках
  const [sportTypeOpen, setSportTypeOpen] = useState(false)
  const [sportTypeSearch, setSportTypeSearch] = useState("")
  const [disciplineOpen, setDisciplineOpen] = useState(false)
  const [disciplineSearch, setDisciplineSearch] = useState("")
  const sportTypeSearchInputRef = useRef<HTMLInputElement>(null)
  const disciplineSearchInputRef = useRef<HTMLInputElement>(null)

  // Список видов спорта
  const sportTypes = [
    { value: "athletics", label: "Легкая атлетика" },
    { value: "football", label: "Футбол" },
    { value: "basketball", label: "Баскетбол" },
    { value: "swimming", label: "Плавание" },
    { value: "tennis", label: "Теннис" },
    { value: "volleyball", label: "Волейбол" },
    { value: "hockey", label: "Хоккей" },
    { value: "boxing", label: "Бокс" },
    { value: "wrestling", label: "Борьба" },
    { value: "gymnastics", label: "Гимнастика" },
    { value: "cycling", label: "Велоспорт" },
    { value: "skiing", label: "Лыжный спорт" },
    { value: "figure-skating", label: "Фигурное катание" },
    { value: "water-polo", label: "Водное поло" },
    { value: "handball", label: "Гандбол" },
  ]

  // Виды спорта и их дисциплины
  const sportDisciplines: Record<string, { value: string; label: string }[]> = {
    athletics: [
      { value: "100m", label: "Бег на 100 метров" },
      { value: "200m", label: "Бег на 200 метров" },
      { value: "400m", label: "Бег на 400 метров" },
      { value: "marathon", label: "Марафон" },
    ],
    football: [
      { value: "football", label: "Футбол" },
    ],
    basketball: [
      { value: "basketball", label: "Баскетбол" },
    ],
    swimming: [
      { value: "swimming-100m", label: "Плавание 100м" },
      { value: "swimming-200m", label: "Плавание 200м" },
    ],
  }

  // Автофокус на поле поиска при открытии
  useEffect(() => {
    if (sportTypeOpen && sportTypeSearchInputRef.current) {
      setTimeout(() => sportTypeSearchInputRef.current?.focus(), 100)
    }
  }, [sportTypeOpen])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Исходное состояние для отслеживания изменений
  const initialDateRange = { from: undefined, to: undefined }
  const initialFormData = {
    fullName: "",
    shortName: "",
    organizerName: "",
    ogrn: "",
    inn: "",
    sportType: "",
    discipline: "",
    participantsCount: "",
    inMinistryList: "no",
    participantGender: "both",
  }
  const initialCoOrganizer = null

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(initialDateRange)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)

  // Form state
  const [formData, setFormData] = useState(initialFormData)
  
  // Состояние для ошибок валидации
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})

  // Функция проверки наличия изменений (используется в разных местах)
  const checkUnsavedChanges = () => {
    // Проверка formData
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    
    // Проверка dateRange
    const dateChanged = 
      (dateRange.from?.getTime() !== initialDateRange.from?.getTime()) ||
      (dateRange.to?.getTime() !== initialDateRange.to?.getTime())
    
    // Проверка coOrganizer
    const coOrganizerChanged = coOrganizer !== initialCoOrganizer
    
    return formChanged || dateChanged || coOrganizerChanged
  }

  const handleSportTypeChange = (value: string) => {
    setFormData((prev) => {
      const disciplines = sportDisciplines[value] || []
      // Если только одна дисциплина, подставляем её автоматически
      const newDiscipline = disciplines.length === 1 ? disciplines[0].value : ""
      return { ...prev, sportType: value, discipline: newDiscipline }
    })
    
    // Очищаем ошибки валидации для вида спорта и дисциплины
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.sportType
      if (sportDisciplines[value]?.length === 1) {
        delete newErrors.discipline
      }
      return newErrors
    })
    
    // Очищаем ошибки с бэкенда
    setBackendErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors.sportType
      if (sportDisciplines[value]?.length === 1) {
        delete newErrors.discipline
      }
      return newErrors
    })
  }

  // Автофокус на поле поиска дисциплин при открытии (только если >= 6 дисциплин)
  useEffect(() => {
    if (disciplineOpen && disciplineSearchInputRef.current && formData.sportType) {
      const disciplines = sportDisciplines[formData.sportType] || []
      const shouldShowSearch = disciplines.length >= 6
      if (shouldShowSearch) {
        setTimeout(() => disciplineSearchInputRef.current?.focus(), 100)
      }
    }
  }, [disciplineOpen, formData.sportType])

  const handleAddCoOrganizer = () => {
    setCoOrganizer({ name: "", ogrn: "", inn: "" })
  }

  const handleRemoveCoOrganizer = () => {
    setCoOrganizer(null)
  }

  const updateCoOrganizer = (field: string, value: string) => {
    if (coOrganizer) {
      setCoOrganizer({ ...coOrganizer, [field]: value })
    }
  }

  const handleCancel = () => {
    if (checkUnsavedChanges()) {
      setPendingNavigation(() => () => router.push("/competitions"))
      setShowUnsavedDialog(true)
    } else {
      router.push("/competitions")
    }
  }

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  // Валидация всех полей перед сохранением
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Проверка обязательных полей
    if (!formData.fullName || formData.fullName.trim() === '') {
      errors.fullName = 'Поле обязательно для заполнения'
    }
    
    if (!formData.shortName || formData.shortName.trim() === '') {
      errors.shortName = 'Поле обязательно для заполнения'
    }
    
    if (!formData.organizerName || formData.organizerName.trim() === '') {
      errors.organizerName = 'Поле обязательно для заполнения'
    }
    
    if (!formData.ogrn || formData.ogrn.trim() === '') {
      errors.ogrn = 'Поле обязательно для заполнения'
    }
    
    if (!formData.inn || formData.inn.trim() === '') {
      errors.inn = 'Поле обязательно для заполнения'
    }
    
    if (!dateRange.from) {
      errors.dateRange = 'Необходимо выбрать дату начала'
    }
    
    if (!dateRange.to) {
      errors.dateRange = 'Необходимо выбрать дату завершения'
    }
    
    if (!formData.sportType || formData.sportType === '') {
      errors.sportType = 'Поле обязательно для заполнения'
    }
    
    if (!formData.discipline || formData.discipline === '') {
      errors.discipline = 'Поле обязательно для заполнения'
    }
    
    // Валидация ОГРН (если поле заполнено)
    if (formData.ogrn && formData.ogrn.trim() !== '') {
      const ogrnError = validateOGRN(formData.ogrn)
      if (ogrnError) errors.ogrn = ogrnError
    }
    
    // Валидация ИНН (если поле заполнено)
    if (formData.inn && formData.inn.trim() !== '') {
      const innError = validateINN(formData.inn)
      if (innError) errors.inn = innError
    }
    
    // Валидация ОГРН соорганизатора (если соорганизатор добавлен)
    if (coOrganizer) {
      if (coOrganizer.name && coOrganizer.name.trim() !== '') {
        if (!coOrganizer.ogrn || coOrganizer.ogrn.trim() === '') {
          errors.coOrganizerOgrn = 'Поле обязательно для заполнения'
        } else {
          const coOgrnError = validateOGRN(coOrganizer.ogrn)
          if (coOgrnError) errors.coOrganizerOgrn = coOgrnError
        }
        
        if (!coOrganizer.inn || coOrganizer.inn.trim() === '') {
          errors.coOrganizerInn = 'Поле обязательно для заполнения'
        } else {
          const coInnError = validateINN(coOrganizer.inn)
          if (coInnError) errors.coOrganizerInn = coInnError
        }
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    // Валидация перед сохранением
    if (!validateAllFields()) {
      toast({
        variant: "destructive",
        title: "Изменения не сохранены",
        description: "Проверьте правильность заполнения полей",
      })
      return
    }
    
    setIsSaving(true)
    setBackendErrors({}) // Очищаем предыдущие ошибки с бэкенда
    
    try {
    // TODO: Save competition data
      // Имитация запроса к API - в реальности здесь будет реальный запрос
    await new Promise((resolve) => setTimeout(resolve, 500))
      
      // Имитация успешного ответа (в реальности будет реальный ответ от API)
      // Если есть ошибки с бэкенда, они будут в формате:
      // { errors: { fieldName: "сообщение об ошибке" } }
      
      toast({
        variant: "success",
        title: "Успешно создано",
        description: "Соревнование успешно создано",
      })
      
      // Небольшая задержка перед переходом, чтобы пользователь увидел уведомление
      setTimeout(() => {
        router.push("/competitions")
      }, 500)
    } catch (error: any) {
    setIsSaving(false)
      
      // Обработка ошибок с бэкенда
      if (error?.errors && typeof error.errors === 'object') {
        setBackendErrors(error.errors)
        toast({
          variant: "destructive",
          title: "Изменения не сохранены",
          description: "Исправьте ошибки в форме",
        })
        return
      }
      
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Что-то пошло не так. Попробуйте сохранить еще раз.",
      })
    }
  }

  // Валидация одного поля
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'ogrn':
        return validateOGRN(value)
      case 'inn':
        return validateINN(value)
      case 'fullName':
      case 'shortName':
      case 'organizerName':
        // Для наименований только очищаем, валидация не требуется
        return null
      default:
        return null
    }
  }

  const updateField = (field: string, value: string) => {
    let cleanedValue = value
    
    // Для ОГРН и ИНН - только цифры
    if (field === 'ogrn' || field === 'inn') {
      // Удаляем все символы, кроме цифр
      cleanedValue = value.replace(/\D/g, '')
    }
    
    // Очищаем от запрещенных слов для полей наименований
    // Важно: пробелы должны сохраняться!
    if (field === 'fullName' || field === 'shortName' || field === 'organizerName') {
      // Сохраняем пробелы - они нужны для написания наименований
      cleanedValue = sanitizeText(value)
      // Убеждаемся, что пробелы не были удалены
      // Если в исходном значении были пробелы, они должны остаться
    }
    
    // Валидация при вводе
    const error = validateField(field, cleanedValue)
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[field] = error
      } else {
        delete newErrors[field]
      }
      return newErrors
    })
    
    // Очищаем ошибку с бэкенда при изменении поля
    setBackendErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    
    setFormData((prev) => ({ ...prev, [field]: cleanedValue }))
  }
  
  const updateCoOrganizerField = (field: string, value: string) => {
    if (!coOrganizer) return
    
    let cleanedValue = value
    
    // Очищаем от запрещенных слов для поля наименования
    if (field === 'name') {
      cleanedValue = sanitizeText(value)
    }
    
    // Валидация при вводе
    let error: string | null = null
    if (field === 'ogrn') {
      error = validateOGRN(cleanedValue)
    } else if (field === 'inn') {
      error = validateINN(cleanedValue)
    }
    
    const errorKey = `coOrganizer${field.charAt(0).toUpperCase() + field.slice(1)}`
    setValidationErrors((prev) => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[errorKey] = error
      } else {
        delete newErrors[errorKey]
      }
      return newErrors
    })
    
    // Очищаем ошибку с бэкенда при изменении поля
    setBackendErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[errorKey]
      return newErrors
    })
    
    updateCoOrganizer(field, cleanedValue)
  }

  // Обработка закрытия страницы/вкладки
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Создаем снимок текущего состояния
      const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData)
      const dateChanged = 
        (dateRange.from?.getTime() !== initialDateRange.from?.getTime()) ||
        (dateRange.to?.getTime() !== initialDateRange.to?.getTime())
      const coOrganizerChanged = coOrganizer !== initialCoOrganizer
      
      if (formChanged || dateChanged || coOrganizerChanged) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formData, dateRange, coOrganizer])

  // Перехват кликов на всех ссылках для проверки несохраненных изменений
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement | null
      
      if (!link || !link.href) return
      
      // Проверяем изменения
      const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData)
      const dateChanged = 
        (dateRange.from?.getTime() !== initialDateRange.from?.getTime()) ||
        (dateRange.to?.getTime() !== initialDateRange.to?.getTime())
      const coOrganizerChanged = coOrganizer !== initialCoOrganizer
      const hasChanges = formChanged || dateChanged || coOrganizerChanged
      
      if (!hasChanges) return
      
      // Игнорируем ссылки внутри AlertDialog
      if (link.closest('[data-slot="alert-dialog"]')) {
        return
      }
      
      // Игнорируем ссылки, которые уже имеют onClick обработчик (обработанные вручную)
      if ((link as any).__hasCustomClickHandler) {
        return
      }
      
      // Игнорируем внешние ссылки
      try {
        const linkUrl = new URL(link.href)
        const currentUrl = window.location
        if (linkUrl.origin !== currentUrl.origin) {
          return
        }
        
        // Игнорируем текущую страницу
        if (linkUrl.pathname === currentUrl.pathname) {
          return
        }
        
        e.preventDefault()
        e.stopPropagation()
        
        setPendingNavigation(() => () => router.push(linkUrl.pathname))
        setShowUnsavedDialog(true)
      } catch (err) {
        // Если не удалось распарсить URL, пропускаем
        return
      }
    }

    document.addEventListener('click', handleDocumentClick, true)
    return () => document.removeEventListener('click', handleDocumentClick, true)
  }, [formData, dateRange, coOrganizer, router])

  // Функция для обработки навигации через Link
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData)
    const dateChanged = 
      (dateRange.from?.getTime() !== initialDateRange.from?.getTime()) ||
      (dateRange.to?.getTime() !== initialDateRange.to?.getTime())
    const coOrganizerChanged = coOrganizer !== initialCoOrganizer
    const hasChanges = formChanged || dateChanged || coOrganizerChanged
    
    if (hasChanges) {
      e.preventDefault()
      e.stopPropagation()
      // Помечаем ссылку как обработанную
      if (e.currentTarget) {
        (e.currentTarget as any).__hasCustomClickHandler = true
      }
      setPendingNavigation(() => () => router.push(href))
      setShowUnsavedDialog(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster />
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите уйти?</AlertDialogTitle>
            <AlertDialogDescription>
              Изменения не были сохранены. При выходе они будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNavigation}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>Да</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="max-w-[896px] mx-auto px-8">
        {/* Header - Fixed */}
        <div className={cn("sticky top-14 z-20 bg-background transition-shadow", isScrolled && "shadow-sm")} style={{ height: '72px' }}>
          <div className="flex items-center justify-between gap-4 h-full">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white dark:bg-card"
                  onClick={() => {
                    if (checkUnsavedChanges()) {
                      setPendingNavigation(() => () => router.back())
                      setShowUnsavedDialog(true)
                    } else {
                      router.back()
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-foreground">Добавление соревнования</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              variant="default"
            >
              {isSaving ? "Добавление..." : "Добавить"}
            </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-8 pb-6">
          {/* Основная информация */}
          <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-5">Основная информация</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Официальное полное наименование
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Полное наименование"
                  className={cn("text-sm", (validationErrors.fullName || backendErrors.fullName) && "border-red-500")}
                />
                {(validationErrors.fullName || backendErrors.fullName) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.fullName || backendErrors.fullName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName" className="text-sm font-medium text-foreground">
                  Официальное краткое наименование
                </Label>
                <Input
                  id="shortName"
                  value={formData.shortName}
                  onChange={(e) => updateField("shortName", e.target.value)}
                  placeholder="Краткое наименование"
                  className={cn("text-sm", (validationErrors.shortName || backendErrors.shortName) && "border-red-500")}
                />
                {(validationErrors.shortName || backendErrors.shortName) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.shortName || backendErrors.shortName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Организатор */}
          <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-5">Организатор</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizerName" className="text-sm font-medium text-foreground">
                  Полное наименование
                </Label>
                <Input
                  id="organizerName"
                  value={formData.organizerName}
                  onChange={(e) => updateField("organizerName", e.target.value)}
                  placeholder="Наименование организации"
                  className={cn("text-sm", (validationErrors.organizerName || backendErrors.organizerName) && "border-red-500")}
                />
                {(validationErrors.organizerName || backendErrors.organizerName) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.organizerName || backendErrors.organizerName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogrn" className="text-sm font-medium text-foreground">
                    ОГРН
                  </Label>
                  <Input
                    id="ogrn"
                    value={formData.ogrn}
                    onChange={(e) => updateField("ogrn", e.target.value)}
                    placeholder="1027739620754"
                    className={cn("text-sm", (validationErrors.ogrn || backendErrors.ogrn) && "border-red-500")}
                  />
                {(validationErrors.ogrn || backendErrors.ogrn) && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.ogrn || backendErrors.ogrn}
                  </p>
                )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inn" className="text-sm font-medium text-foreground">
                    ИНН
                  </Label>
                  <Input
                    id="inn"
                    value={formData.inn}
                    onChange={(e) => updateField("inn", e.target.value)}
                    placeholder="7701123456"
                    className={cn("text-sm", (validationErrors.inn || backendErrors.inn) && "border-red-500")}
                  />
                  {(validationErrors.inn || backendErrors.inn) && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.inn || backendErrors.inn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка добавления соорганизатора */}
          {!coOrganizer && (
            <Button 
              variant="outline" 
              className="w-full border-dashed h-16"
              onClick={handleAddCoOrganizer}
            >
              Добавить соорганизатора
            </Button>
          )}

          {/* Соорганизатор */}
          {coOrganizer && (
            <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">Соорганизатор</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCoOrganizer}
                  className="h-9 w-9 text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coOrganizerName" className="text-sm font-medium text-foreground">
                    Полное наименование
                  </Label>
                  <Input
                    id="coOrganizerName"
                    value={coOrganizer.name}
                    onChange={(e) => updateCoOrganizerField("name", e.target.value)}
                    placeholder="Наименование организации"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coOrganizerOgrn" className="text-sm font-medium text-foreground">
                      ОГРН
                    </Label>
                    <Input
                      id="coOrganizerOgrn"
                      value={coOrganizer.ogrn}
                      onChange={(e) => updateCoOrganizerField("ogrn", e.target.value)}
                      placeholder="1027700232558"
                      className={cn("text-sm", (validationErrors.coOrganizerOgrn || backendErrors.coOrganizerOgrn) && "border-red-500")}
                    />
                    {(validationErrors.coOrganizerOgrn || backendErrors.coOrganizerOgrn) && (
                      <p className="text-xs text-red-500 mt-1">
                        {validationErrors.coOrganizerOgrn || backendErrors.coOrganizerOgrn}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coOrganizerInn" className="text-sm font-medium text-foreground">
                      ИНН
                    </Label>
                    <Input
                      id="coOrganizerInn"
                      value={coOrganizer.inn}
                      onChange={(e) => updateCoOrganizerField("inn", e.target.value)}
                      placeholder="7702070139"
                      className={cn("text-sm", (validationErrors.coOrganizerInn || backendErrors.coOrganizerInn) && "border-red-500")}
                    />
                    {(validationErrors.coOrganizerInn || backendErrors.coOrganizerInn) && (
                      <p className="text-xs text-red-500 mt-1">
                        {validationErrors.coOrganizerInn || backendErrors.coOrganizerInn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Спортивная информация */}
          <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-5">Спортивная информация</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sportType" className="text-sm font-medium text-foreground">
                  Вид спорта
                </Label>
                <Popover open={sportTypeOpen} onOpenChange={(open) => {
                  setSportTypeOpen(open)
                  if (!open) setSportTypeSearch("")
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sportTypeOpen}
                      className={cn("w-full justify-between text-sm font-normal", validationErrors.sportType && "border-red-500")}
                      id="sportType"
                    >
                      {formData.sportType
                        ? sportTypes.find((sport) => sport.value === formData.sportType)?.label
                        : "Выберите вид спорта"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-0 rounded-lg shadow-lg" align="start">
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                      {/* Поиск сверху */}
                      <div className="flex items-center gap-2 px-4 border-b border-gray-100 h-12">
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <input
                          ref={sportTypeSearchInputRef}
                          type="text"
                          placeholder="Поиск вида спорта..."
                          value={sportTypeSearch}
                          onChange={(e) => setSportTypeSearch(e.target.value)}
                          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                        />
                        {sportTypeSearch && (
                          <button
                            onClick={() => setSportTypeSearch("")}
                            className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {/* Список видов спорта */}
                      <div className="max-h-72 overflow-y-auto py-1">
                        {(() => {
                          const filteredSports = sportTypeSearch
                            ? sportTypes.filter((sport) =>
                                sport.label.toLowerCase().includes(sportTypeSearch.toLowerCase())
                              )
                            : sportTypes

                          if (filteredSports.length === 0) {
                            return (
                              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Ничего не найдено
                              </div>
                            )
                          }

                          return filteredSports.map((sport) => (
                            <button
                              key={sport.value}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-background transition-colors text-left"
                              onClick={() => {
                                handleSportTypeChange(sport.value)
                                setSportTypeOpen(false)
                                setSportTypeSearch("")
                              }}
                            >
                              <span className="flex-1 text-foreground">{sport.label}</span>
                              {formData.sportType === sport.value && (
                                <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {validationErrors.sportType && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.sportType}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discipline" className="text-sm font-medium text-foreground">
                  Спортивная дисциплина
                </Label>
                <Popover open={disciplineOpen} onOpenChange={(open) => {
                  setDisciplineOpen(open)
                  if (!open) setDisciplineSearch("")
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={disciplineOpen}
                      className={cn("w-full justify-between text-sm font-normal", validationErrors.discipline && "border-red-500")}
                      id="discipline"
                  disabled={!formData.sportType}
                >
                      {formData.discipline
                        ? sportDisciplines[formData.sportType]?.find(
                            (disc) => disc.value === formData.discipline
                          )?.label
                        : formData.sportType
                        ? "Выберите дисциплину"
                        : "Сначала выберите вид спорта"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-0 rounded-lg shadow-lg" align="start">
                    {formData.sportType && (() => {
                      const disciplines = sportDisciplines[formData.sportType] || []
                      const shouldShowSearch = disciplines.length >= 6
                      
                      return (
                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                          {/* Поиск сверху - только если дисциплин >= 6 */}
                          {shouldShowSearch && (
                            <div className="flex items-center gap-2 px-4 border-b border-gray-100 h-12">
                              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <input
                                ref={disciplineSearchInputRef}
                                type="text"
                                placeholder="Поиск дисциплины..."
                                value={disciplineSearch}
                                onChange={(e) => setDisciplineSearch(e.target.value)}
                                className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                              />
                              {disciplineSearch && (
                                <button
                                  onClick={() => setDisciplineSearch("")}
                                  className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-muted-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
              </div>
                          )}
                          {/* Список дисциплин */}
                          <div className="max-h-72 overflow-y-auto py-1">
                            {(() => {
                              const filteredDisciplines = shouldShowSearch && disciplineSearch
                                ? disciplines.filter((disc) =>
                                    disc.label.toLowerCase().includes(disciplineSearch.toLowerCase())
                                  )
                                : disciplines

                              if (filteredDisciplines.length === 0) {
                                return (
                                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    Ничего не найдено
                                  </div>
                                )
                              }

                              return filteredDisciplines.map((disc) => (
                                <button
                                  key={disc.value}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-background transition-colors text-left"
                                  onClick={() => {
                                    updateField("discipline", disc.value)
                                    setDisciplineOpen(false)
                                    setDisciplineSearch("")
                                  }}
                                >
                                  <span className="flex-1 text-foreground">{disc.label}</span>
                                  {formData.discipline === disc.value && (
                                    <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                  )}
                                </button>
                              ))
                            })()}
                          </div>
                        </div>
                      )
                    })()}
                  </PopoverContent>
                </Popover>
                {validationErrors.discipline && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors.discipline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Параметры проведения */}
          <div className="bg-card border border-border rounded-[10px] p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-5">Параметры проведения</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Дата начала и завершения
                  </Label>
                  <Popover open={dateRangeOpen} onOpenChange={(open) => {
                    // Разрешаем закрытие только если выбран полный диапазон или пользователь явно закрывает
                    if (!open && dateRange.from && !dateRange.to) {
                      // Если пытаются закрыть без второй даты, предотвращаем закрытие
                      return
                    }
                    setDateRangeOpen(open)
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal text-sm",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                            </>
                          ) : (
                            formatDate(dateRange.from)
                          )
                        ) : (
                          <span>Выберите даты</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" onInteractOutside={(e) => {
                      // Предотвращаем закрытие при клике вне календаря, пока не выбран полный диапазон
                      if (!dateRange.from || !dateRange.to) {
                        e.preventDefault()
                      }
                    }}>
                      <Calendar
                        mode="range"
                        selected={
                          dateRange.from && dateRange.to
                            ? { from: dateRange.from, to: dateRange.to }
                              : undefined
                        }
                        onSelect={(range) => {
                          setDateRange({ from: range?.from, to: range?.to })
                          // Закрываем календарь только когда выбраны обе даты
                          if (range?.from && range?.to) {
                            setDateRangeOpen(false)
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.dateRange && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationErrors.dateRange}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantsCount" className="text-sm font-medium text-foreground">
                    Количество участников
                  </Label>
                  <Input
                    id="participantsCount"
                    type="number"
                    value={formData.participantsCount}
                    onChange={(e) => updateField("participantsCount", e.target.value)}
                    placeholder="150"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <Label className="text-sm font-medium text-foreground">
                  Включено в Перечень Минспорта России
                </Label>
                <RadioGroup
                  value={formData.inMinistryList}
                  onValueChange={(value) => updateField("inMinistryList", value)}
                  className="flex gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="ministry-yes" />
                    <Label htmlFor="ministry-yes" className="text-sm font-medium text-foreground cursor-pointer">
                      Да
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="ministry-no" />
                    <Label htmlFor="ministry-no" className="text-sm font-medium text-foreground cursor-pointer">
                      Нет
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-3">
                <Label className="text-sm font-medium text-foreground">Пол участников</Label>
                <RadioGroup
                  value={formData.participantGender}
                  onValueChange={(value) => updateField("participantGender", value)}
                  className="flex gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male" className="text-sm font-medium text-foreground cursor-pointer">
                      Только мужчины
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female" className="text-sm font-medium text-foreground cursor-pointer">
                      Только женщины
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="gender-both" />
                    <Label htmlFor="gender-both" className="text-sm font-medium text-foreground cursor-pointer">
                      Мужчины и женщины
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
