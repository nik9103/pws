"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface AvatarOption {
  id: string
  url: string | null
  type: "default" | "uploaded"
  initials?: string
}

interface AvatarUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatar: string | null
  initials: string
  onSave: (avatarUrl: string | null) => void
}

const DEFAULT_AVATAR_COLOR = "bg-gray-100 dark:bg-muted"

export function AvatarUploadModal({
  open,
  onOpenChange,
  currentAvatar,
  initials,
  onSave,
}: AvatarUploadModalProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Инициализация аватарок
  const initializeAvatars = useCallback((): AvatarOption[] => {
    const avatars: AvatarOption[] = [
      { id: "default", url: null, type: "default" },
    ]
    if (currentAvatar) {
      avatars.push({ id: "current", url: currentAvatar, type: "uploaded" })
    }
    return avatars
  }, [currentAvatar])

  const [avatars, setAvatars] = useState<AvatarOption[]>(initializeAvatars())
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    currentAvatar ? "current" : "default"
  )

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (open) {
      const initialAvatars = initializeAvatars()
      setAvatars(initialAvatars)
      setSelectedAvatarId(currentAvatar ? "current" : "default")
    }
  }, [open, currentAvatar, initializeAvatars])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5MB",
        variant: "destructive",
      })
      return
    }

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Файл должен быть изображением",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const uploadedAvatars = avatars.filter((a) => a.type === "uploaded")
      
      // Если уже 3 аватарки (2 загруженных + 1 дефолтная)
      if (uploadedAvatars.length >= 2) {
        toast({
          title: "Ошибка",
          description: "Максимальное количество аватарок - 3",
          variant: "destructive",
        })
        return
      }

      const newAvatar: AvatarOption = {
        id: `upload-${Date.now()}`,
        url: reader.result as string,
        type: "uploaded",
      }

      // Добавляем новую аватарку перед кружком с плюсиком
      const defaultAvatar = avatars.find((a) => a.id === "default")!
      const uploadedAvatarsList = avatars.filter((a) => a.type === "uploaded")
      const newAvatars = [
        defaultAvatar,
        ...uploadedAvatarsList,
        newAvatar,
      ]

      setAvatars(newAvatars)
      setSelectedAvatarId(newAvatar.id)
      
      toast({
        title: "Аватар загружен",
        variant: "success",
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteAvatar = (avatarId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (avatarId === "default") {
      toast({
        title: "Ошибка",
        description: "Нельзя удалить аватар по умолчанию",
        variant: "destructive",
      })
      return
    }

    setAvatars(avatars.filter((a) => a.id !== avatarId))
    
    // Если удаляем выбранную аватарку, выбираем дефолтную
    if (selectedAvatarId === avatarId) {
      setSelectedAvatarId("default")
    }

    toast({
      title: "Аватар удален",
      variant: "success",
    })
  }

  const handleSave = () => {
    const selectedAvatar = avatars.find((a) => a.id === selectedAvatarId)
    const avatarUrl = selectedAvatar?.id === "default" ? null : selectedAvatar?.url || null
    onSave(avatarUrl)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const canAddMore = avatars.filter((a) => a.type === "uploaded").length < 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Заменить аватарку</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="relative">
                <button
                  onClick={() => setSelectedAvatarId(avatar.id)}
                  className={`
                    relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all
                    ${
                      selectedAvatarId === avatar.id
                        ? "border-foreground ring-2 ring-foreground/20 dark:ring-foreground/40"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                >
                  {avatar.url ? (
                    <img
                      src={avatar.url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full ${DEFAULT_AVATAR_COLOR} flex items-center justify-center`}>
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {initials}
                      </span>
                    </div>
                  )}
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute inset-0 bg-foreground/10 dark:bg-foreground/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-background"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
                {avatar.type === "uploaded" && (
                  <button
                    onClick={(e) => handleDeleteAvatar(avatar.id, e)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            
            {canAddMore && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-border">
          <Button variant="outline" onClick={handleCancel}>
            Отменить
          </Button>
          <Button onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

