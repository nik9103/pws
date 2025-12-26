"use client"

import { User, FileText, Building2, Clock } from "lucide-react"

const navItems = [
  { id: "personal", label: "Персональные данные", icon: User },
  { id: "passport", label: "Паспортные данные", icon: FileText },
  { id: "other", label: "Прочие данные", icon: FileText },
  { id: "bank", label: "Банковские реквизиты", icon: Building2 },
  { id: "system", label: "Системная информация", icon: Clock },
]

interface SidebarNavProps {
  activeSection: string
  onNavigate: (id: string) => void
}

export function SidebarNav({ activeSection, onNavigate }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left
              ${
                isActive
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
