import { cn } from "@/lib/utils"

interface ApplicationStatusBadgeProps {
  status: "accepted" | "pending" | "rejected"
  className?: string
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const statusConfig = {
    accepted: {
      label: "Принята",
      className: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    },
    pending: {
      label: "На рассмотрении",
      className: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    },
    rejected: {
      label: "Отклонена",
      className: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

