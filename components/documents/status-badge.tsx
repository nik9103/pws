import { cn } from "@/lib/utils"

type DocumentStatus = "signed" | "unsigned"
type CompetitionStatus = "ongoing" | "completed" | "planned"
type ParticipantStatus = "accepted" | "pending" | "rejected"

interface StatusBadgeProps {
  status: DocumentStatus | CompetitionStatus | ParticipantStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Обработка статусов документов
  if (status === "signed" || status === "unsigned") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
          status === "signed" 
            ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" 
            : "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
          className,
        )}
      >
        {status === "signed" ? "Подписан" : "Не подписан"}
      </span>
    )
  }

  // Обработка статусов участников
  if (status === "accepted" || status === "pending" || status === "rejected") {
    const participantStatusConfig = {
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

    const config = participantStatusConfig[status as ParticipantStatus]

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

  // Обработка статусов соревнований
  const competitionStatusConfig = {
    ongoing: {
      label: "Уже идет",
      className: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    },
    completed: {
      label: "Завершено",
      className: "bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground",
    },
    planned: {
      label: "Запланировано",
      className: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
    },
  }

  const config = competitionStatusConfig[status as CompetitionStatus]

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
