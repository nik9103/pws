"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Bell, X, CheckCheck, CheckCircle2, AlertCircle, Info, XCircle, Trash2, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/notification"

interface NotificationsDropdownProps {
  notifications: Notification[]
  onNotificationRead?: (id: string) => void
  onNotificationDelete?: (id: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
}

export function NotificationsDropdown({
  notifications,
  onNotificationRead,
  onNotificationDelete,
  onMarkAllAsRead,
  onClearAll,
}: NotificationsDropdownProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [open, setOpen] = useState(false)

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read)
    }
    return notifications
  }, [notifications, filter])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onNotificationRead) {
      onNotificationRead(notification.id)
    }
    setOpen(false)
    router.push(notification.href)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (onNotificationDelete) {
      onNotificationDelete(id)
    }
  }

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    }
  }

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll()
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return CheckCircle2
      case "warning":
        return AlertCircle
      case "error":
        return XCircle
      default:
        return Info
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400"
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "error":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-lg" sideOffset={8}>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-[57px] border-b border-border">
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-semibold text-foreground leading-none">Уведомления</h3>
              {unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-orange-500 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="h-7 min-w-[120px] flex items-center justify-end">
              {unreadCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Прочитать все
                </Button>
              ) : notifications.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Очистить все
                </Button>
              ) : null}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filter === "all"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              Все
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filter === "unread"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              Непрочитанные
            </button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  {filter === "unread" ? (
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Inbox className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1.5">
                  {filter === "unread" ? "Нет непрочитанных" : "Нет уведомлений"}
                </p>
                <p className="text-xs text-muted-foreground text-center max-w-[240px]">
                  {filter === "unread"
                    ? "Все уведомления прочитаны"
                    : "Здесь будут отображаться ваши уведомления"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  const iconColor = getNotificationColor(notification.type)

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "relative group px-4 py-3.5 hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.read && "bg-accent/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "flex items-center justify-center w-9 h-9 rounded-lg",
                            notification.type === "success" && "bg-green-100 dark:bg-green-900/30",
                            notification.type === "warning" && "bg-yellow-100 dark:bg-yellow-900/30",
                            notification.type === "error" && "bg-red-100 dark:bg-red-900/30",
                            notification.type === "info" && "bg-blue-100 dark:bg-blue-900/30"
                          )}>
                            <Icon className={cn("h-4 w-4", iconColor)} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h4
                            className={cn(
                              "text-sm font-medium leading-5 mb-1.5",
                              !notification.read && "text-foreground font-semibold"
                            )}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-[18px] mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground leading-4">{notification.createdAt}</p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className={cn(
                            "opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-md mt-0.5",
                            "text-muted-foreground hover:text-foreground hover:bg-accent",
                            "transition-all duration-200"
                          )}
                          aria-label="Удалить уведомление"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

