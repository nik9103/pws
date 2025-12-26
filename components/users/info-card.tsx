import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface InfoCardProps {
  icon: LucideIcon
  title: string
  children: ReactNode
  footer?: ReactNode
  headerAction?: ReactNode
}

export function InfoCard({ icon: Icon, title, children, footer, headerAction }: InfoCardProps) {
  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden shadow-xs">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-[10px]">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="text-base font-semibold leading-none text-foreground">{title}</h3>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </div>
      <div className="px-6 py-3">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-border">{footer}</div>}
    </div>
  )
}
