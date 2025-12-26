"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string
  onChange?: (value: string) => void
  defaultCountry?: string
}

// Список популярных стран с кодами и флагами
const COUNTRIES = [
  { code: "RU", dialCode: "+7", name: "Россия", flag: "🇷🇺", mask: "+7 (999) 999-99-99" },
  { code: "BY", dialCode: "+375", name: "Беларусь", flag: "🇧🇾", mask: "+375 (99) 999-99-99" },
  { code: "KZ", dialCode: "+7", name: "Казахстан", flag: "🇰🇿", mask: "+7 (999) 999-99-99" },
  { code: "UA", dialCode: "+380", name: "Украина", flag: "🇺🇦", mask: "+380 (99) 999-99-99" },
  { code: "US", dialCode: "+1", name: "США", flag: "🇺🇸", mask: "+1 (999) 999-99-99" },
  { code: "GB", dialCode: "+44", name: "Великобритания", flag: "🇬🇧", mask: "+44 9999 999999" },
  { code: "DE", dialCode: "+49", name: "Германия", flag: "🇩🇪", mask: "+49 999 99999999" },
  { code: "FR", dialCode: "+33", name: "Франция", flag: "🇫🇷", mask: "+33 9 99 99 99 99" },
  { code: "CN", dialCode: "+86", name: "Китай", flag: "🇨🇳", mask: "+86 999 9999 9999" },
  { code: "JP", dialCode: "+81", name: "Япония", flag: "🇯🇵", mask: "+81 99 9999 9999" },
  { code: "IN", dialCode: "+91", name: "Индия", flag: "🇮🇳", mask: "+91 99999 99999" },
  { code: "IT", dialCode: "+39", name: "Италия", flag: "🇮🇹", mask: "+39 999 999 9999" },
  { code: "ES", dialCode: "+34", name: "Испания", flag: "🇪🇸", mask: "+34 999 99 99 99" },
  { code: "TR", dialCode: "+90", name: "Турция", flag: "🇹🇷", mask: "+90 999 999 99 99" },
  { code: "KR", dialCode: "+82", name: "Южная Корея", flag: "🇰🇷", mask: "+82 99 9999 9999" },
]

export function PhoneInput({ value = "", onChange, defaultCountry = "RU", className, ...props }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState(
    COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  )

  // Определяем код страны из значения при загрузке
  React.useEffect(() => {
    if (value) {
      const digits = value.replace(/\D/g, "")
      if (digits.length > 0) {
        // Сортируем страны по длине кода (от большего к меньшему) для правильного определения
        const sortedCountries = [...COUNTRIES].sort((a, b) => {
          return b.dialCode.replace(/\D/g, "").length - a.dialCode.replace(/\D/g, "").length
        })
        
        const detectedCountry = sortedCountries.find((country) => {
          const countryDigits = country.dialCode.replace(/\D/g, "")
          return digits.startsWith(countryDigits)
        })
        
        if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
          setSelectedCountry(detectedCountry)
        }
      }
    }
  }, []) // Только при монтировании

  // Извлекаем номер без кода страны из полного значения
  const getNumberWithoutCode = (fullValue: string, country = selectedCountry): string => {
    if (!fullValue) return ""
    
    const digits = fullValue.replace(/\D/g, "")
    const countryDigits = country.dialCode.replace(/\D/g, "")
    
    // Если номер начинается с кода страны, убираем его
    if (digits.startsWith(countryDigits)) {
      return digits.slice(countryDigits.length)
    }
    
    // Если номер не начинается с кода, проверяем другие страны
    const sortedCountries = [...COUNTRIES].sort((a, b) => {
      return b.dialCode.replace(/\D/g, "").length - a.dialCode.replace(/\D/g, "").length
    })
    
    for (const country of sortedCountries) {
      const codeDigits = country.dialCode.replace(/\D/g, "")
      if (digits.startsWith(codeDigits)) {
        return digits.slice(codeDigits.length)
      }
    }
    
    // Если код не найден, возвращаем все цифры
    return digits
  }

  // Определяем страну из введенного кода
  const detectCountryFromCode = (digits: string) => {
    if (digits.length === 0) return selectedCountry
    
    // Сортируем страны по длине кода (от большего к меньшему)
    const sortedCountries = [...COUNTRIES].sort((a, b) => {
      return b.dialCode.replace(/\D/g, "").length - a.dialCode.replace(/\D/g, "").length
    })
    
    const detectedCountry = sortedCountries.find((country) => {
      const countryDigits = country.dialCode.replace(/\D/g, "")
      return digits.startsWith(countryDigits)
    })
    
    return detectedCountry || selectedCountry
  }

  // Форматирование только номера (без кода страны) для отображения в Input
  const formatNumberOnly = (numberDigits: string, country = selectedCountry): string => {
    if (!numberDigits) return ""

    // Форматируем в зависимости от страны
    if (country.code === "RU" || country.code === "KZ") {
      // (999) 999-99-99
      if (numberDigits.length <= 3) {
        return `(${numberDigits}`
      }
      if (numberDigits.length <= 6) {
        return `(${numberDigits.slice(0, 3)}) ${numberDigits.slice(3)}`
      }
      if (numberDigits.length <= 8) {
        return `(${numberDigits.slice(0, 3)}) ${numberDigits.slice(3, 6)}-${numberDigits.slice(6)}`
      }
      return `(${numberDigits.slice(0, 3)}) ${numberDigits.slice(3, 6)}-${numberDigits.slice(6, 8)}-${numberDigits.slice(8, 10)}`
    } else if (country.code === "BY") {
      // (99) 999-99-99
      if (numberDigits.length <= 2) {
        return `(${numberDigits}`
      }
      if (numberDigits.length <= 5) {
        return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2)}`
      }
      if (numberDigits.length <= 7) {
        return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2, 5)}-${numberDigits.slice(5)}`
      }
      return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2, 5)}-${numberDigits.slice(5, 7)}-${numberDigits.slice(7, 9)}`
    } else if (country.code === "UA") {
      // (99) 999-99-99
      if (numberDigits.length <= 2) {
        return `(${numberDigits}`
      }
      if (numberDigits.length <= 5) {
        return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2)}`
      }
      if (numberDigits.length <= 7) {
        return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2, 5)}-${numberDigits.slice(5)}`
      }
      return `(${numberDigits.slice(0, 2)}) ${numberDigits.slice(2, 5)}-${numberDigits.slice(5, 7)}-${numberDigits.slice(7, 9)}`
    } else if (country.code === "US") {
      // (999) 999-9999
      if (numberDigits.length <= 3) {
        return `(${numberDigits}`
      }
      if (numberDigits.length <= 6) {
        return `(${numberDigits.slice(0, 3)}) ${numberDigits.slice(3)}`
      }
      return `(${numberDigits.slice(0, 3)}) ${numberDigits.slice(3, 6)}-${numberDigits.slice(6, 10)}`
    } else if (country.code === "GB") {
      // 9999 999999
      if (numberDigits.length <= 4) {
        return numberDigits
      }
      return `${numberDigits.slice(0, 4)} ${numberDigits.slice(4, 10)}`
    }

    // По умолчанию для других стран - просто номер
    return numberDigits
  }

  // Форматирование полного номера (с кодом страны) для сохранения в value
  const formatPhoneNumber = (allDigits: string, country = selectedCountry): string => {
    const countryDigits = country.dialCode.replace(/\D/g, "")
    
    // Если введено меньше или равно цифр коду страны, возвращаем код страны
    if (allDigits.length <= countryDigits.length) {
      return country.dialCode
    }
    
    // Если номер начинается с кода страны, убираем его для форматирования
    let numberPart = allDigits
    if (allDigits.startsWith(countryDigits)) {
      numberPart = allDigits.slice(countryDigits.length)
    } else {
      // Если не начинается с кода страны, возвращаем код страны
      return country.dialCode
    }

    // Форматируем в зависимости от страны
    if (country.code === "RU" || country.code === "KZ") {
      // +7 (999) 999-99-99
      if (numberPart.length <= 3) {
        return `${country.dialCode} (${numberPart}`
      }
      if (numberPart.length <= 6) {
        return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3)}`
      }
      if (numberPart.length <= 8) {
        return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3, 6)}-${numberPart.slice(6)}`
      }
      return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3, 6)}-${numberPart.slice(6, 8)}-${numberPart.slice(8, 10)}`
    } else if (country.code === "BY") {
      // +375 (99) 999-99-99
      if (numberPart.length <= 2) {
        return `${country.dialCode} (${numberPart}`
      }
      if (numberPart.length <= 5) {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2)}`
      }
      if (numberPart.length <= 7) {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 5)}-${numberPart.slice(5)}`
      }
      return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 5)}-${numberPart.slice(5, 7)}-${numberPart.slice(7, 9)}`
    } else if (country.code === "UA") {
      // +380 (99) 999-99-99
      if (numberPart.length <= 2) {
        return `${country.dialCode} (${numberPart}`
      }
      if (numberPart.length <= 5) {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2)}`
      }
      if (numberPart.length <= 7) {
        return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 5)}-${numberPart.slice(5)}`
      }
      return `${country.dialCode} (${numberPart.slice(0, 2)}) ${numberPart.slice(2, 5)}-${numberPart.slice(5, 7)}-${numberPart.slice(7, 9)}`
    } else if (country.code === "US") {
      // +1 (999) 999-9999
      if (numberPart.length <= 3) {
        return `${country.dialCode} (${numberPart}`
      }
      if (numberPart.length <= 6) {
        return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3)}`
      }
      return `${country.dialCode} (${numberPart.slice(0, 3)}) ${numberPart.slice(3, 6)}-${numberPart.slice(6, 10)}`
    } else if (country.code === "GB") {
      // +44 9999 999999
      if (numberPart.length <= 4) {
        return `${country.dialCode} ${numberPart}`
      }
      return `${country.dialCode} ${numberPart.slice(0, 4)} ${numberPart.slice(4, 10)}`
    }

    // По умолчанию для других стран - просто добавляем код и номер
    return numberPart ? `${country.dialCode} ${numberPart}` : country.dialCode
  }

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]
    setSelectedCountry(country)
    
    // Если есть введенный номер, переформатируем его с новым кодом страны
    if (value) {
      const numberDigits = getNumberWithoutCode(value, selectedCountry)
      if (numberDigits.length > 0) {
        // Форматируем номер с новым кодом страны
        const newFormatted = formatPhoneNumber(country.dialCode.replace(/\D/g, "") + numberDigits, country)
        if (onChange) {
          onChange(newFormatted)
        }
      } else {
        // Если номера нет, просто устанавливаем код страны
        if (onChange) {
          onChange(country.dialCode)
        }
      }
    } else {
      // Если значения нет, устанавливаем код страны
      if (onChange) {
        onChange(country.dialCode)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = input.replace(/\D/g, "")

    // Ограничиваем длину номера (максимум 15 цифр согласно E.164, но учитываем код страны)
    const maxDigits = 15
    const countryDigits = selectedCountry.dialCode.replace(/\D/g, "")
    const maxNumberDigits = maxDigits - countryDigits.length
    const limitedNumberDigits = digits.slice(0, Math.max(0, maxNumberDigits))

    // Форматируем полный номер с кодом страны для сохранения
    const fullDigits = countryDigits + limitedNumberDigits
    const formatted = formatPhoneNumber(fullDigits, selectedCountry)

    if (onChange) {
      onChange(formatted)
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const digits = pastedText.replace(/\D/g, "")

    if (digits.length === 0) return

    // Определяем страну по вставленному номеру
    const detectedCountry = detectCountryFromCode(digits)
    setSelectedCountry(detectedCountry)

    // Убираем код страны из вставленного номера
    const countryDigits = detectedCountry.dialCode.replace(/\D/g, "")
    let numberDigits = digits
    if (digits.startsWith(countryDigits)) {
      numberDigits = digits.slice(countryDigits.length)
    }

    // Ограничиваем длину
    const maxDigits = 15
    const maxNumberDigits = maxDigits - countryDigits.length
    const limitedNumberDigits = numberDigits.slice(0, Math.max(0, maxNumberDigits))

    // Форматируем
    const fullDigits = countryDigits + limitedNumberDigits
    const formatted = formatPhoneNumber(fullDigits, detectedCountry)

    if (onChange) {
      onChange(formatted)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем навигационные клавиши
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Tab" ||
      e.key === "Home" ||
      e.key === "End" ||
      (e.key === "a" && (e.metaKey || e.ctrlKey)) || // Select all
      (e.key === "c" && (e.metaKey || e.ctrlKey)) || // Copy
      (e.key === "v" && (e.metaKey || e.ctrlKey)) || // Paste
      (e.key === "x" && (e.metaKey || e.ctrlKey))    // Cut
    ) {
      return
    }

    // Разрешаем только цифры
    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  // Показываем в Input только номер без кода страны, отформатированный
  const numberDigits = value ? getNumberWithoutCode(value, selectedCountry) : ""
  const displayValue = numberDigits ? formatNumberOnly(numberDigits, selectedCountry) : ""

  // Получаем placeholder без кода страны
  const getPlaceholder = (country = selectedCountry): string => {
    const mask = country.mask
    const dialCode = country.dialCode
    // Убираем код страны из маски
    return mask.replace(dialCode, "").trim()
  }

  // Вычисляем ширину Select на основе длины кода страны
  const getSelectWidth = (dialCode: string): string => {
    // Базовая ширина для флага, отступов и иконки chevron
    const baseWidth = 60 // флаг (24px) + отступы (24px) + chevron (16px) + gap (16px)
    // Ширина символов кода (примерно 9px на символ для text-sm)
    const codeWidth = dialCode.length * 9
    // Минимальная ширина 110px, максимальная 160px
    const totalWidth = Math.max(110, Math.min(160, baseWidth + codeWidth))
    return `${totalWidth}px`
  }

  return (
    <div className="flex items-center w-full border border-input rounded-md shadow-xs overflow-hidden focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[color,box-shadow]">
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger 
          className="h-9 flex-shrink-0 border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
          style={{ width: getSelectWidth(selectedCountry.dialCode), minWidth: getSelectWidth(selectedCountry.dialCode) }}
        >
          <SelectValue>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">{selectedCountry.flag}</span>
              <span className="text-sm whitespace-nowrap">{selectedCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground ml-auto">{country.dialCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="h-6 w-px bg-border flex-shrink-0" />
      <Input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className={cn("flex-1 border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0", className)}
        {...props}
      />
    </div>
  )
}
