"use client"

import { useState, useEffect, useRef } from "react"
import {
  Search,
  Calendar,
  SlidersHorizontal,
  X,
  User,
  Trophy,
  CheckCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  Check,
  Dumbbell,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { FilterState } from "@/types/document"
import { filterOptions, getDocumentCounts } from "@/lib/mock-documents"


interface DocumentFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  totalDocuments: number
}

type FilterCategory = "athletes" | "competitions" | "disciplines" | "statuses" | "documentTypes"

export function DocumentFilters({ filters, onFiltersChange, totalDocuments }: DocumentFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<FilterCategory | null>(null)
  const [submenuSearch, setSubmenuSearch] = useState("")
  const [mainSearch, setMainSearch] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)
  const submenuInputRef = useRef<HTMLInputElement>(null)
  const mainSearchInputRef = useRef<HTMLInputElement>(null)

  const documentCounts = getDocumentCounts()

  // Считаем только категорийные фильтры (без периода)
  const activeFiltersCount =
    filters.athletes.length +
    filters.competitions.length +
    filters.disciplines.length +
    filters.statuses.length +
    filters.documentTypes.length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
        setActiveSubmenu(null)
        setSubmenuSearch("")
        setMainSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (activeSubmenu) {
          setActiveSubmenu(null)
          setSubmenuSearch("")
        } else if (isFilterOpen) {
          setIsFilterOpen(false)
          setMainSearch("")
        } else {
          onFiltersChange({
            search: "",
            period: {},
            athletes: [],
            competitions: [],
            disciplines: [],
            statuses: [],
            documentTypes: [],
          })
        }
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onFiltersChange, activeSubmenu, isFilterOpen])

  // Автофокус на главное поле поиска при открытии фильтра
  useEffect(() => {
    if (isFilterOpen && !activeSubmenu && mainSearchInputRef.current) {
      mainSearchInputRef.current.focus()
    }
  }, [isFilterOpen, activeSubmenu])

  // Автофокус на поле поиска в подменю при переходе в него
  useEffect(() => {
    if (activeSubmenu && submenuInputRef.current) {
      submenuInputRef.current.focus()
    }
  }, [activeSubmenu])

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleFilterToggle = (category: FilterCategory, value: string) => {
    const currentValues = filters[category] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    onFiltersChange({ ...filters, [category]: newValues })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      period: {},
      athletes: [],
      competitions: [],
      disciplines: [],
      statuses: [],
      documentTypes: [],
    })
  }

  const removeFilter = (category: FilterCategory, value: string) => {
    const currentValues = filters[category] as string[]
    onFiltersChange({
      ...filters,
      [category]: currentValues.filter((v) => v !== value),
    })
  }

  const filterCategories = [
    { key: "athletes" as FilterCategory, label: "Спортсмен", icon: User, options: filterOptions.athletes },
    { key: "competitions" as FilterCategory, label: "Соревнование", icon: Trophy, options: filterOptions.competitions },
    {
      key: "disciplines" as FilterCategory,
      label: "Дисциплина",
      icon: Dumbbell,
      options: filterOptions.disciplines,
    },
    {
      key: "statuses" as FilterCategory,
      label: "Статус",
      icon: CheckCircle,
      options: filterOptions.statuses.map((s) => s.value),
    },
    {
      key: "documentTypes" as FilterCategory,
      label: "Тип документа",
      icon: FileText,
      options: filterOptions.documentTypes,
    },
  ]

  const filteredCategories = mainSearch
    ? filterCategories.filter((c) => c.label.toLowerCase().includes(mainSearch.toLowerCase()))
    : filterCategories

  const getFilteredOptions = (category: (typeof filterCategories)[0]) => {
    if (!submenuSearch) return category.options
    return category.options.filter((option) => {
      const displayValue =
        category.key === "statuses" ? filterOptions.statuses.find((s) => s.value === option)?.label || option : option
      return displayValue.toLowerCase().includes(submenuSearch.toLowerCase())
    })
  }

  const getOptionCount = (category: FilterCategory, option: string): number | null => {
    const countMap = documentCounts[category]
    return countMap[option] || 0
  }

  const handleBackClick = () => {
    setActiveSubmenu(null)
    setSubmenuSearch("")
  }

  const handleCloseFilter = () => {
    setIsFilterOpen(false)
    setActiveSubmenu(null)
    setSubmenuSearch("")
    setMainSearch("")
  }

  const handleClearSubmenuSearch = () => {
    setSubmenuSearch("")
    if (submenuInputRef.current) {
      submenuInputRef.current.focus()
    }
  }

  const handleClearMainSearch = () => {
    setMainSearch("")
    if (mainSearchInputRef.current) {
      mainSearchInputRef.current.focus()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Поиск документов */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск документов"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9 h-10 bg-card"
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Период */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 bg-card pr-2 flex items-center justify-start" style={{ width: '200px' }}>
                <Calendar className={cn("h-4 w-4 flex-shrink-0", !filters.period.from && !filters.period.to && "text-muted-foreground")} />
                {filters.period.from || filters.period.to ? (
                  <>
                    <span className="text-foreground truncate min-w-0 flex-1">
                      {filters.period.from
                        ? new Date(filters.period.from).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })
                        : "..."}
                      {" - "}
                      {filters.period.to
                        ? new Date(filters.period.to).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })
                        : "..."}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFiltersChange({ ...filters, period: {} })
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-muted-foreground">Период</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={
                  filters.period.from && filters.period.to
                    ? { from: filters.period.from, to: filters.period.to }
                    : undefined
                }
                onSelect={(range) => {
                  onFiltersChange({
                    ...filters,
                    period: { from: range?.from, to: range?.to },
                  })
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Фильтр */}
          <div className="relative" ref={filterRef}>
          <Button
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            className={cn("h-10 gap-2", activeFiltersCount > 0 ? "bg-foreground text-background" : "bg-card")}
            onClick={() => {
              setIsFilterOpen(!isFilterOpen)
              if (isFilterOpen) {
                setActiveSubmenu(null)
                setSubmenuSearch("")
                setMainSearch("")
              }
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтр
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
              {!activeSubmenu ? (
                <div>
                  {/* Поиск сверху без рамки */}
                  <div className="flex items-center gap-2 px-4 border-b border-border h-12">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      ref={mainSearchInputRef}
                      type="text"
                      placeholder="Фильтр..."
                      value={mainSearch}
                      onChange={(e) => setMainSearch(e.target.value)}
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {mainSearch && (
                        <button
                          onClick={handleClearMainSearch}
                          className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Список категорий */}
                  <div className="py-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => {
                        const selectedCount = (filters[category.key] as string[]).length
                        return (
                          <button
                            key={category.key}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                            onClick={() => {
                              setActiveSubmenu(category.key)
                              setMainSearch("")
                            }}
                          >
                            <category.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="flex-1 text-foreground">{category.label}</span>
                            {selectedCount > 0 && (
                              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-medium text-white">
                                {selectedCount}
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        )
                      })
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-muted-foreground">Ничего не найдено</div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Заголовок подменю с поиском */}
                  <div className="flex items-center gap-2 px-3 border-b border-border h-12">
                    <button
                      onClick={handleBackClick}
                      className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                    >
                      <ArrowLeft className="h-4 w-4 text-foreground" />
                    </button>
                    
                    <input
                      ref={submenuInputRef}
                      type="text"
                      value={submenuSearch}
                      onChange={(e) => setSubmenuSearch(e.target.value)}
                      placeholder={filterCategories.find((c) => c.key === activeSubmenu)?.label}
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {submenuSearch && (
                        <button
                          onClick={handleClearSubmenuSearch}
                          className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Список опций */}
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {(() => {
                      const category = filterCategories.find((c) => c.key === activeSubmenu)!
                      const filteredOptions = getFilteredOptions(category)

                      if (filteredOptions.length === 0) {
                        return <div className="px-4 py-8 text-center text-sm text-muted-foreground">Ничего не найдено</div>
                      }

                      return filteredOptions.map((option) => {
                        const displayValue =
                          category.key === "statuses"
                            ? filterOptions.statuses.find((s) => s.value === option)?.label || option
                            : option
                        const isChecked = (filters[category.key] as string[]).includes(option)
                        const count = getOptionCount(category.key, option)

                        return (
                          <button
                            key={option}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                            onClick={() => handleFilterToggle(category.key, option)}
                          >
                            <span className="flex-1 text-foreground truncate">{displayValue}</span>
                            {isChecked ? (
                              <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            ) : (
                              count !== null &&
                              count > 0 && <span className="text-muted-foreground text-sm flex-shrink-0">{count}</span>
                            )}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Очистить
            <span className="text-xs px-1.5 py-0.5 bg-muted rounded">ESC</span>
          </button>
        )}
      </div>

      {/* Активные фильтры */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.competitions.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full text-sm">
              <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Соревнование:</span> {c}
              <button onClick={() => removeFilter("competitions", c)} className="ml-1 p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {filters.athletes.map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Спортсмен:</span> {a}
              <button onClick={() => removeFilter("athletes", a)} className="ml-1 p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {filters.disciplines.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full text-sm">
              <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Дисциплина:</span> {d}
              <button onClick={() => removeFilter("disciplines", d)} className="ml-1 p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {filters.statuses.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full text-sm">
              <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Статус:</span> {filterOptions.statuses.find((st) => st.value === s)?.label}
              <button onClick={() => removeFilter("statuses", s)} className="ml-1 p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {filters.documentTypes.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border rounded-full text-sm">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Тип:</span> {t}
              <button onClick={() => removeFilter("documentTypes", t)} className="ml-1 p-0.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
