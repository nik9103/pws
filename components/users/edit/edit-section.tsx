"use client"

import { forwardRef, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface EditSectionProps {
  id: string
  icon: LucideIcon
  title: string
  children: ReactNode
}

export const EditSection = forwardRef<HTMLDivElement, EditSectionProps>(({ id, icon: Icon, title, children }, ref) => {
  return (
    <div ref={ref} id={id} className="bg-card border border-border rounded-2xl p-6 scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
})

EditSection.displayName = "EditSection"
