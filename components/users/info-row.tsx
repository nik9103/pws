import { CopyButton } from "./copy-button"

interface InfoRowProps {
  label: string
  value: string
  copyable?: boolean
  className?: string
}

export function InfoRow({ label, value, copyable = false, className }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{value}</span>
        {copyable && <CopyButton value={value} />}
      </div>
    </div>
  )
}
