"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, FileText, Eye, Trash2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserDocument } from "@/types/user"

type UploadState = "idle" | "dragging" | "uploading" | "success" | "uploaded"

interface UploadingFile {
  name: string
  state: UploadState
  progress?: number
}

interface FileUploadProps {
  documents: UserDocument[]
  onDocumentsChange: (docs: UserDocument[]) => void
  onPreview: (doc: UserDocument) => void
  category: "passport" | "other"
}

export function FileUpload({ documents, onDocumentsChange, onPreview, category }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const simulateUpload = useCallback(
    (file: File) => {
      const uploadingFile: UploadingFile = {
        name: file.name,
        state: "uploading",
      }
      setUploadingFiles((prev) => [...prev, uploadingFile])

      // Simulate upload progress
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, state: "success" as UploadState } : f)),
        )

        // After success, add to documents and remove from uploading
        setTimeout(() => {
          const newDoc: UserDocument = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            size: `${(file.size / 1024 / 1024).toFixed(1)} МБ`,
            type: file.name.split(".").pop()?.toUpperCase() || "PDF",
            category,
          }
          onDocumentsChange([...documents, newDoc])
          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name))
        }, 1000)
      }, 1500)
    },
    [documents, onDocumentsChange, category],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      files.forEach(simulateUpload)
    },
    [simulateUpload],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      files.forEach(simulateUpload)
      if (inputRef.current) {
        inputRef.current.value = ""
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

  const filteredDocs = documents.filter((d) => d.category === category)

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        className={`
          relative border rounded-xl p-4 transition-all cursor-pointer
          ${
            isDragging
              ? "border-blue-500 border-dashed bg-blue-50/50 dark:bg-blue-950/30"
              : "border-border border-dashed hover:border-border/80"
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          onChange={handleFileSelect}
        />
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-foreground">Выберите или перетащите файл сюда</p>
            <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG до 10 МБ</p>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.map((file) => (
        <div key={file.name} className="border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            {file.state === "uploading" && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />}
            {file.state === "success" && (
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {file.state === "uploading" ? "Загрузка файла..." : "Документ загружен"}
              </p>
              <p className="text-xs text-muted-foreground">{file.name}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Uploaded Documents */}
      {filteredDocs.map((doc) => (
        <div key={doc.id} className="border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.size} • {doc.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(doc)
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
                  handleDelete(doc.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
