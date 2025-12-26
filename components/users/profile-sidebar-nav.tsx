"use client"

import { User, Lock, Mail, Monitor } from "lucide-react"

const navItems = [
  { id: "personal", label: "Личные данные", icon: User },
  { id: "security", label: "Безопасность", icon: Lock },
  { id: "email", label: "Электронная почта", icon: Mail },
  { id: "activity", label: "Активность", icon: Monitor },
]

interface ProfileSidebarNavProps {
  activeSection: string
  onNavigate: (id: string) => void
}

export function ProfileSidebarNav({ activeSection, onNavigate }: ProfileSidebarNavProps) {
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
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

