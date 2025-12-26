"use client"

import { Download, FileText, Eye } from "lucide-react"

interface DocumentItemProps {
  name: string
  size: string
  type: string
  onPreview?: () => void
  onDownload?: () => void
}

export function DocumentItem({ name, size, type, onPreview, onDownload }: DocumentItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {size} • {type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {onPreview && (
          <button
            onClick={onPreview}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Просмотр"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Скачать"
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
