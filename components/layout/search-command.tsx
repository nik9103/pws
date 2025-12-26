"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  Trophy,
  FileText,
  FileCheck,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { mockUsers } from "@/lib/mock-users"
import { mockCompetitions } from "@/lib/mock-competitions"
import { mockApplications } from "@/lib/mock-applications"
import { mockDocuments } from "@/lib/mock-documents"

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")

  // Reset search when modal closes
  React.useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  // Filter data based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      `${user.firstName} ${user.lastName} ${user.middleName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCompetitions = mockCompetitions.filter(
    (comp) =>
      comp.name.toLowerCase().includes(search.toLowerCase()) ||
      comp.discipline.toLowerCase().includes(search.toLowerCase())
  )

  const filteredApplications = mockApplications.filter(
    (app) =>
      app.athlete.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.competition.name.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(search.toLowerCase())
  )

  const filteredDocuments = mockDocuments.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.athlete.fullName.toLowerCase().includes(search.toLowerCase()) ||
      doc.competition.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Поиск"
      description="Поиск по всему сайту..."
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Введите запрос для поиска..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Результаты не найдены.</CommandEmpty>

        {filteredUsers.length > 0 && (
          <>
            <CommandGroup heading="Пользователи">
              {filteredUsers.slice(0, 5).map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => handleSelect(`/users/${user.id}`)}
                >
                  <Users className="h-4 w-4" />
                  <span>
                    {user.lastName} {user.firstName} {user.middleName}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {user.email}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {(filteredCompetitions.length > 0 ||
              filteredApplications.length > 0 ||
              filteredDocuments.length > 0) && <CommandSeparator />}
          </>
        )}

        {filteredCompetitions.length > 0 && (
          <>
            <CommandGroup heading="Соревнования">
              {filteredCompetitions.slice(0, 5).map((comp) => (
                <CommandItem
                  key={comp.id}
                  onSelect={() => handleSelect(`/competitions/${comp.id}`)}
                >
                  <Trophy className="h-4 w-4" />
                  <span>{comp.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {comp.discipline}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {(filteredApplications.length > 0 ||
              filteredDocuments.length > 0) && <CommandSeparator />}
          </>
        )}

        {filteredApplications.length > 0 && (
          <>
            <CommandGroup heading="Заявки">
              {filteredApplications.slice(0, 5).map((app) => (
                <CommandItem
                  key={app.id}
                  onSelect={() => handleSelect(`/applications/${app.id}`)}
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Заявка #{app.applicationId}</span>
                  <span className="text-muted-foreground ml-2">
                    {app.athlete.fullName}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredDocuments.length > 0 && <CommandSeparator />}
          </>
        )}

        {filteredDocuments.length > 0 && (
          <CommandGroup heading="Документы">
            {filteredDocuments.slice(0, 5).map((doc) => (
              <CommandItem key={doc.id} onSelect={() => handleSelect("/documents")}>
                <FileText className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{doc.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {doc.athlete.fullName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

