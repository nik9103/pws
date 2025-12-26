import { cn } from "@/lib/utils"

interface CompetitionStatusBadgeProps {
  status: "ongoing" | "completed" | "planned"
  className?: string
}

export function CompetitionStatusBadge({ status, className }: CompetitionStatusBadgeProps) {
  const statusConfig = {
    ongoing: {
      label: "Уже идет",
      className: "bg-[#22C55E] dark:bg-emerald-600 text-white",
    },
    completed: {
      label: "Завершено",
      className: "bg-[#F5F5F5] dark:bg-gray-800 text-[#171717] dark:text-gray-300",
    },
    planned: {
      label: "Запланировано",
      className: "bg-[#3B82F6] dark:bg-blue-600 text-white",
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

