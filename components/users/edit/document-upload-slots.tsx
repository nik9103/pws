"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, FileText, Trash2, Loader2, Check, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserDocument } from "@/types/user"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "uploading" | "success"

interface UploadingFile {
  name: string
  state: UploadState
}

interface DocumentSlot {
  id: string
  title: string
  document: UserDocument | null
  uploading: UploadingFile | null
}

interface DocumentUploadSlotsProps {
  documents: UserDocument[]
  onDocumentsChange: (docs: UserDocument[]) => void
  onPreview: (doc: UserDocument) => void
  category: "passport" | "other"
  slotTitles: string[] // Заголовки для слотов, например ["Скан паспорта с фото", "Скан паспорта с пропиской"]
}

export function DocumentUploadSlots({
  documents,
  onDocumentsChange,
  onPreview,
  category,
  slotTitles,
}: DocumentUploadSlotsProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [isDragging, setIsDragging] = useState<number | null>(null)

  // Инициализируем слоты на основе заголовков (фиксированный порядок)
  const initializeSlots = useCallback((): DocumentSlot[] => {
    const slots: DocumentSlot[] = []
    const maxSlots = Math.min(2, slotTitles.length)
    for (let i = 0; i < maxSlots; i++) {
      slots.push({
        id: `slot-${i}`,
        title: slotTitles[i] || `Документ ${i + 1}`,
        document: null,
        uploading: null,
      })
    }
    return slots
  }, [slotTitles])

  const [slots, setSlots] = useState<DocumentSlot[]>(initializeSlots())

  // Обновляем документы в слотах при изменении documents, сохраняя порядок слотов
  useEffect(() => {
    const filteredDocs = documents.filter((d) => d.category === category)
    
    setSlots((prev) => {
      // Создаем мапу документов по их названию (которое соответствует заголовку слота)
      const docMap = new Map<string, UserDocument>()
      filteredDocs.forEach((doc) => {
        docMap.set(doc.name, doc)
      })

      // Обновляем только поле document в каждом слоте, сохраняя порядок
      return prev.map((slot) => {
        const doc = docMap.get(slot.title) || null
        return {
          ...slot,
          document: doc,
        }
      })
    })
  }, [documents, category])

  const handleDragEnter = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(slotIndex)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const simulateUpload = useCallback(
    (file: File, slotIndex: number) => {
      const uploadingFile: UploadingFile = {
        name: file.name,
        state: "uploading",
      }

      setSlots((prev) => {
        const newSlots = [...prev]
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          uploading: uploadingFile,
        }
        return newSlots
      })

      // Simulate upload progress
      setTimeout(() => {
        setSlots((prev) => {
          const newSlots = [...prev]
          newSlots[slotIndex] = {
            ...newSlots[slotIndex],
            uploading: { ...uploadingFile, state: "success" },
          }
          return newSlots
        })

        // After success, add to documents and remove from uploading
        setTimeout(() => {
          setSlots((prev) => {
            const slotTitle = prev[slotIndex]?.title || `Документ ${slotIndex + 1}`
            const newDoc: UserDocument = {
              id: Date.now().toString(),
              name: slotTitle, // Используем заголовок слота как название
              size: `${(file.size / 1024 / 1024).toFixed(1)} МБ`,
              type: file.name.split(".").pop()?.toUpperCase() || "PDF",
              category,
            }

            // Удаляем старый документ из этого слота (если есть) и добавляем новый
            const filteredDocs = documents.filter((d) => {
              // Удаляем документы этой категории, кроме тех, которые уже в других слотах
              if (d.category !== category) return true
              // Удаляем документ, который был в этом слоте (по названию)
              return d.name !== slotTitle
            })
            onDocumentsChange([...filteredDocs, newDoc])

            const newSlots = [...prev]
            newSlots[slotIndex] = {
              ...newSlots[slotIndex],
              uploading: null,
            }
            return newSlots
          })

        }, 1000)
      }, 1500)
    },
    [documents, onDocumentsChange, category],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(null)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        setSlots((prev) => {
          if (!prev[slotIndex]?.document && !prev[slotIndex]?.uploading) {
            simulateUpload(files[0], slotIndex)
          }
          return prev
        })
      }
    },
    [simulateUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        setSlots((prev) => {
          if (!prev[slotIndex]?.document && !prev[slotIndex]?.uploading) {
            simulateUpload(files[0], slotIndex)
          }
          return prev
        })
      }
      if (inputRefs.current[slotIndex]) {
        inputRefs.current[slotIndex]!.value = ""
      }
    },
    [simulateUpload],
  )

  const handleDelete = useCallback(
    (docId: string) => {
      onDocumentsChange(documents.filter((d) => d.id !== docId))
    },
    [documents, onDocumentsChange],
  )

  return (
    <div className="space-y-3">
      {slots.map((slot, index) => {
        const hasDocument = slot.document !== null
        const isUploading = slot.uploading !== null
        const showUploadZone = !hasDocument && !isUploading

        return (
          <div key={slot.id}>
            {showUploadZone ? (
              // Состояние загрузки
              <div
                className={cn(
                  "relative border rounded-xl p-4 transition-all cursor-pointer h-16 flex items-center",
                  isDragging === index
                    ? "border-blue-500 border-dashed bg-blue-50/50 dark:bg-blue-950/30"
                    : "border-border border-dashed hover:border-primary/50 hover:bg-accent/50"
                )}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => inputRefs.current[index]?.click()}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, index)}
                />
                <div className="flex items-center gap-3 w-full">
                  <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">Загрузите {slot.title.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG до 10 МБ</p>
                  </div>
                </div>
              </div>
            ) : isUploading ? (
              // Состояние загрузки
              <div className="border border-border rounded-xl p-4 bg-muted/50 h-16 flex items-center transition-all duration-300">
                <div className="flex items-center gap-3 w-full">
                  <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                    {slot.uploading?.state === "uploading" && (
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    )}
                    {slot.uploading?.state === "success" && (
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {slot.uploading?.state === "uploading" ? "Загрузка файла..." : "Документ загружен"}
                    </p>
                    <p className="text-xs text-muted-foreground">{slot.uploading?.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Состояние с загруженным файлом
              <div className="border border-border rounded-xl p-4 bg-muted/50 h-16 flex items-center transition-all duration-300">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{slot.document?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.document?.size} • {slot.document?.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (slot.document) {
                          onPreview(slot.document)
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (slot.document) {
                          handleDelete(slot.document.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

