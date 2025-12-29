"use client"

import { useState, useMemo, useEffect } from "react"
import { UserRoundPlus, Search, X } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { CompetitionJudge } from "@/types/competition"

interface AssignJudgesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentJudges: CompetitionJudge[]
  allJudges: CompetitionJudge[]
  onAssign: (judges: CompetitionJudge[]) => void
}

export function AssignJudgesModal({
  open,
  onOpenChange,
  currentJudges,
  allJudges,
  onAssign,
}: AssignJudgesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJudgeIds, setSelectedJudgeIds] = useState<Set<string>>(
    new Set(currentJudges.map((j) => j.id))
  )
  const [hasUserInteraction, setHasUserInteraction] = useState(false)

  // Reset search and interaction state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setHasUserInteraction(false)
      setSelectedJudgeIds(new Set(currentJudges.map((j) => j.id)))
    }
  }, [open, currentJudges])

  // Update selected when currentJudges change (but don't mark as interaction)
  useEffect(() => {
    if (open && !hasUserInteraction) {
      setSelectedJudgeIds(new Set(currentJudges.map((j) => j.id)))
    }
  }, [currentJudges, open, hasUserInteraction])

  const filteredJudges = useMemo(() => {
    if (!searchQuery.trim()) {
      return allJudges
    }
    const query = searchQuery.toLowerCase()
    return allJudges.filter(
      (judge) =>
        judge.fullName.toLowerCase().includes(query) ||
        judge.initials.toLowerCase().includes(query)
    )
  }, [allJudges, searchQuery])

  const selectedCount = selectedJudgeIds.size

  const handleToggleJudge = (judgeId: string) => {
    setHasUserInteraction(true)
    setSelectedJudgeIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(judgeId)) {
        newSet.delete(judgeId)
      } else {
        newSet.add(judgeId)
      }
      return newSet
    })
  }

  const handleAssign = () => {
    const selectedJudges = allJudges.filter((judge) =>
      selectedJudgeIds.has(judge.id)
    )
    onAssign(selectedJudges)
    onOpenChange(false)
    setSearchQuery("")
  }

  const handleCancel = () => {
    setSelectedJudgeIds(new Set(currentJudges.map((j) => j.id)))
    setSearchQuery("")
    onOpenChange(false)
  }

  const handleClearAll = () => {
    setHasUserInteraction(true)
    setSelectedJudgeIds(new Set())
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={(hasUserInteraction && selectedCount > 0) || currentJudges.length > 0 ? `Назначено судей: ${selectedCount}` : "Назначить судей"}
      description={(hasUserInteraction && selectedCount > 0) || currentJudges.length > 0 ? "Выберите судей для назначения" : "Выберите судей из списка"}
      shouldFilter={false}
      showCloseButton={false}
      className="sm:max-w-[512px]"
    >
      <div className="flex flex-col">
        {/* Custom Search Input with Clear Button */}
        <div className="flex h-12 items-center gap-2 border-b border-border px-3 bg-background">
          <Search className="size-4 shrink-0 opacity-50 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Header with Clear All button - Fixed height */}
        <div className="flex items-center justify-between px-3 h-[45px] bg-background">
          {(hasUserInteraction && selectedCount > 0) || currentJudges.length > 0 ? (
            <>
              <span className="text-sm text-muted-foreground">
                Назначено судей: <span className="font-semibold text-foreground">{selectedCount}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Очистить все
              </Button>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Назначьте судей на соревнование</span>
          )}
        </div>

        {/* Judges List */}
        <CommandList className="max-h-[300px]">
          <CommandEmpty>
            {searchQuery ? "Судьи не найдены" : "Нет доступных судей"}
          </CommandEmpty>

          {filteredJudges.length > 0 && (
            <CommandGroup>
              {filteredJudges.map((judge, index) => {
                const isSelected = selectedJudgeIds.has(judge.id)
                const prevJudge = filteredJudges[index - 1]
                const nextJudge = filteredJudges[index + 1]
                const isPrevSelected = prevJudge ? selectedJudgeIds.has(prevJudge.id) : false
                const isNextSelected = nextJudge ? selectedJudgeIds.has(nextJudge.id) : false
                
                // Определяем скругление для выбранных элементов и hover
                let roundedClass = ""
                let hoverRoundedClass = ""
                let spacingClass = ""
                
                if (isSelected) {
                  if (!isPrevSelected && !isNextSelected) {
                    // Единственный выбранный элемент
                    roundedClass = "!rounded-md"
                    hoverRoundedClass = "hover:!rounded-md"
                  } else if (!isPrevSelected && isNextSelected) {
                    // Первый в группе выбранных - скругление только сверху
                    roundedClass = "!rounded-t-md !rounded-b-none"
                    hoverRoundedClass = "hover:!rounded-t-md hover:!rounded-b-none"
                    spacingClass = "!mb-0"
                  } else if (isPrevSelected && !isNextSelected) {
                    // Последний в группе выбранных - скругление только снизу
                    roundedClass = "!rounded-b-md !rounded-t-none"
                    hoverRoundedClass = "hover:!rounded-b-md hover:!rounded-t-none"
                    spacingClass = "!mt-0"
                  } else if (isPrevSelected && isNextSelected) {
                    // Средний в группе выбранных - без скругления и без промежутков
                    roundedClass = "!rounded-none"
                    hoverRoundedClass = "hover:!rounded-none"
                    spacingClass = "!my-0"
                  }
                } else {
                  // Для невыбранных элементов определяем скругление при hover
                  if (isPrevSelected && isNextSelected) {
                    // Средний между выбранными - без скругления при hover
                    hoverRoundedClass = "hover:!rounded-none"
                    spacingClass = "hover:!my-0"
                  } else if (isPrevSelected && !isNextSelected) {
                    // После выбранного - скругление снизу при hover
                    hoverRoundedClass = "hover:!rounded-b-md hover:!rounded-t-none"
                    spacingClass = "hover:!mt-0"
                  } else if (!isPrevSelected && isNextSelected) {
                    // Перед выбранным - скругление сверху при hover
                    hoverRoundedClass = "hover:!rounded-t-md hover:!rounded-b-none"
                    spacingClass = "hover:!mb-0"
                  } else {
                    // Обычный элемент - полное скругление при hover
                    hoverRoundedClass = "hover:!rounded-md"
                  }
                  roundedClass = "!rounded-none"
                }

                return (
                  <CommandItem
                    key={judge.id}
                    onSelect={() => handleToggleJudge(judge.id)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer hover:bg-accent/20 dark:hover:bg-accent/20 transition-colors",
                      isSelected && "bg-accent/30 dark:bg-accent/25",
                      roundedClass,
                      hoverRoundedClass,
                      spacingClass
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 flex-shrink-0 transition-all",
                      isSelected && "ring-2 ring-accent/50 dark:ring-accent/30",
                      "hover:ring-2 hover:ring-accent/50 dark:hover:ring-accent/30"
                    )}>
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {judge.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm",
                          isSelected ? "font-semibold text-foreground" : "font-normal text-foreground"
                        )}>
                          {judge.fullName}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleJudge(judge.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="[&_[data-slot=checkbox-indicator]]:flex [&_[data-slot=checkbox-indicator]]:items-center [&_[data-slot=checkbox-indicator]]:justify-center [&_[data-slot=checkbox-indicator]]:w-full [&_[data-slot=checkbox-indicator]]:h-full [&_[data-slot=checkbox-indicator]_svg]:size-3 [&_[data-slot=checkbox-indicator]_svg]:m-auto [&_[data-slot=checkbox-indicator]_svg_path]:stroke-[3]"
                        />
                      </div>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-3 py-3 border-t border-border bg-background">
          <Button variant="outline" onClick={handleCancel} className="h-9">
            Отмена
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedCount === 0}
            className="h-9"
          >
            Добавить
          </Button>
        </div>
      </div>
    </CommandDialog>
  )
}
