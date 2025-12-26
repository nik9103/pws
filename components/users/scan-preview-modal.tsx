"use client"

import { X, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserDocument } from "@/types/user"

interface ScanPreviewModalProps {
  document: UserDocument | null
  isOpen: boolean
  onClose: () => void
}

export function ScanPreviewModal({ document, isOpen, onClose }: ScanPreviewModalProps) {
  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4">
        <div className="bg-[#2a2a2a] rounded-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-white">
                <div className="font-medium">{document.name}</div>
                <div className="text-sm text-gray-400">
                  {document.size} • {document.type}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => {
                  // Download logic
                  console.log("Downloading:", document.name)
                }}
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex items-center justify-center p-6 min-h-[500px]">
            <div className="bg-white dark:bg-card rounded-lg shadow-2xl w-full max-w-md aspect-[3/4] flex items-center justify-center">
              {/* Placeholder for scan image */}
              <img
                src={
                  document.previewUrl ||
                  `/placeholder.svg?height=600&width=450&query=${encodeURIComponent(document.name + " document scan")}`
                }
                alt={document.name}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
