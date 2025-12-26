import { cn } from "@/lib/utils"

interface DocumentIconProps {
  className?: string
  status?: "signed" | "unsigned"
}

export function DocumentIcon({ className, status = "unsigned" }: DocumentIconProps) {
  const isSigned = status === "signed"
  
  return (
    <div className={cn(
      "flex h-10 w-10 items-center justify-center rounded-lg",
      isSigned ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-orange-50 dark:bg-orange-950/30",
      className
    )}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11.667 1.667H5.001c-.917 0-1.658.75-1.658 1.666L3.334 16.667c0 .916.742 1.666 1.659 1.666h9.174c.917 0 1.667-.75 1.667-1.666V6.667l-4.167-5z"
          fill={isSigned ? "#22C55E" : "#F97316"}
        />
        <path d="M11.667 1.667v5h5" fill={isSigned ? "#86EFAC" : "#FDBA74"} />
        <path
          d="M13.334 10.833H6.667M13.334 14.167H6.667M8.334 7.5H6.667"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
