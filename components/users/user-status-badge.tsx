import { Badge } from "@/components/ui/badge"
import type { User } from "@/types/user"
import { cn } from "@/lib/utils"

interface UserStatusBadgeProps {
  status: User["status"]
  className?: string
}

const statusConfig = {
  active: {
    label: "Активен",
    className: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/40 border-transparent",
  },
  inactive: {
    label: "Заблокирован",
    className: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 border-transparent",
  },
  blocked: {
    label: "Заблокирован",
    className: "bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted/80 border-transparent",
  },
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

