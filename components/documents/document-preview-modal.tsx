"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { X, Download, Upload, Loader2, CheckCircle2 } from "lucide-react"
import type { Document } from "@/types/document"
import { DocumentIcon } from "./document-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentPreviewModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  showSigningPanel?: boolean
  onDocumentSigned?: () => void
}

type UploadState = "idle" | "uploading" | "success"

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  showSigningPanel = false,
  onDocumentSigned,
}: DocumentPreviewModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = (file: File) => {
    setUploadState("uploading")
    setUploadedFileName(file.name)
    // Simulate upload
    setTimeout(() => {
      setUploadState("success")
      // Call callback after successful upload
      if (onDocumentSigned) {
        setTimeout(() => {
          onDocumentSigned()
        }, 500)
      }
    }, 1500)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleClose = () => {
    setUploadState("idle")
    setUploadedFileName("")
    onClose()
  }

  if (!isOpen || !document) return null

  const showSigning = showSigningPanel || document.status === "unsigned"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      <div className="relative z-10 flex w-full max-w-5xl mx-4">
        {/* Main Content */}
        <div className={cn("bg-gray-50 dark:bg-card rounded-l-xl flex-1 flex flex-col border-r border-border", !showSigning && "rounded-r-xl border-r-0")}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <DocumentIcon status={document.status} />
              <div className="text-foreground">
                <div className="font-medium">{document.name}</div>
                <div className="text-sm text-muted-foreground">
                  {document.status === "signed" ? "Подписан" : "Не подписан"}
                  {document.date && ` • ${document.date}`} • {document.size}
                </div>
              </div>
            </div>
            {!showSigning && (
              <div className="flex items-center gap-2">
                {document.status === "signed" && (
                  <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                    <Download className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Document Preview */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-card rounded-lg shadow-2xl w-full max-w-xl p-8">
              <h1 className="text-2xl font-bold text-center text-emerald-600 mb-6">Договор на участие</h1>

              <div className="space-y-4 text-sm">
                <section>
                  <h2 className="font-bold mb-2 text-gray-900 dark:text-foreground">1. ПРЕДМЕТ ДОГОВОРА</h2>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Настоящий договор заключен между Организатором соревнования и Участником и определяет условия
                    участия в спортивном мероприятии "Чемпионат России 2024".
                  </p>
                </section>

                <section>
                  <h2 className="font-bold mb-2 text-gray-900 dark:text-foreground">2. ПРАВА И ОБЯЗАННОСТИ СТОРОН</h2>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-foreground">2.1. Организатор обязуется:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-muted-foreground pl-4 space-y-1">
                      <li>Обеспечить проведение соревнования в соответствии с регламентом</li>
                      <li>Предоставить необходимое оборудование и инвентарь</li>
                      <li>Обеспечить медицинское сопровождение мероприятия</li>
                    </ul>
                    <p className="font-medium mt-3 text-gray-900 dark:text-foreground">2.2. Участник обязуется:</p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-muted-foreground pl-4 space-y-1">
                      <li>Соблюдать правила и регламент соревнования</li>
                      <li>Пройти медицинское обследование и предоставить справку</li>
                      <li>Иметь страховой полис на период проведения соревнования</li>
                    </ul>
                  </div>
                </section>

                <div className="border-t border-gray-200 dark:border-border pt-4 mt-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="font-bold text-xs mb-1 text-gray-900 dark:text-foreground">ОРГАНИЗАТОР</p>
                      <p className="text-xs text-gray-600 dark:text-muted-foreground mb-2">Спортивная Федерация России</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">Подпись: ________________</p>
                    </div>
                    <div>
                      <p className="font-bold text-xs mb-1 text-gray-900 dark:text-foreground">УЧАСТНИК</p>
                      <p className="text-xs text-gray-600 dark:text-muted-foreground mb-2">Иванов Иван Иванович</p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">Подпись: ________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signing Panel */}
        {showSigning && (
          <div className="bg-card rounded-r-xl flex flex-col" style={{ width: '340px' }}>
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div>
                <h3 className="font-semibold">Подписание документа</h3>
                <p className="text-sm text-muted-foreground">Инструкция</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1 text-foreground">Скачайте документ</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Нажмите кнопку ниже, чтобы скачать документ для подписания
                  </p>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 gap-2">
                    <Download className="h-4 w-4" />
                    Скачать документ
                  </Button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1 text-foreground">Подпишите документ</h4>
                  <p className="text-sm text-muted-foreground">
                    Используйте вашу электронную подпись для подписания скачанного документа
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-1 text-foreground">Загрузите документ</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Используйте вашу электронную подпись для подписания скачанного документа
                  </p>

                  {uploadState === "uploading" ? (
                    <div className="border border-dashed border-border rounded-xl bg-muted p-4 text-center" style={{ width: '100%', height: '140px' }}>
                      <div className="flex flex-col items-center justify-center gap-2 h-full">
                        <Loader2 className="h-6 w-6 text-[#F97316] animate-spin flex-shrink-0" />
                        <p className="text-xs font-medium text-foreground">Загрузка файла...</p>
                        <p className="text-xs text-muted-foreground truncate w-full">{uploadedFileName}</p>
                      </div>
                    </div>
                  ) : uploadState === "success" ? (
                    <div className="border border-dashed border-border rounded-xl bg-muted p-4 text-center animate-in fade-in-0 zoom-in-95 duration-300" style={{ width: '100%', height: '140px' }}>
                      <div className="flex flex-col items-center justify-center gap-2 h-full">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in-95 duration-300 flex-shrink-0" />
                        <p className="text-xs font-medium text-foreground">Документ загружен</p>
                        <p className="text-xs text-muted-foreground truncate w-full">{uploadedFileName}</p>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        "border border-dashed rounded-xl bg-muted p-4 text-center cursor-pointer transition-colors flex items-center justify-center",
                        isDragOver ? "border-blue-500 border-2 bg-blue-50 dark:bg-blue-950/30" : "border-border hover:border-border/80",
                      )}
                      style={{ width: '100%', height: '140px' }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleFileSelect}
                      />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs font-medium text-foreground">Выберите или перетащите файл сюда</p>
                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG до 10 МБ</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
