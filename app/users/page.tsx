"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { UserFilters, type UserFilterState } from "@/components/users/user-filters"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { AddUserModal } from "@/components/users/add-user-modal"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { UserTableRowSkeleton, FiltersSkeleton, PageHeaderSkeleton, PaginationSkeleton } from "@/components/ui/skeletons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/documents/pagination"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Plus, MoreVertical, ArrowUpDown, Pencil, Eye, Lock, Unlock, Trash2, ChevronsUpDown, X, AlertTriangle, CheckCircle2 } from "lucide-react"
import { mockUsers } from "@/lib/mock-users"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"

type SortField = "name" | "role" | "email" | "phone" | "status" | "lastLogin"
type SortDirection = "asc" | "desc"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilterState>({
    search: "",
    roles: [],
    statuses: [],
    period: {},
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [statusDialogUser, setStatusDialogUser] = useState<User | null>(null)
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(mockUsers)

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (filters.search) {
        const fullName = `${user.lastName} ${user.firstName} ${user.middleName}`
        const matchesSearch =
          fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase())
        if (!matchesSearch) return false
      }
      // Role filter
      if (filters.roles.length > 0 && !filters.roles.includes(user.role)) {
        return false
      }
      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(user.status)) {
        return false
      }
      // Period filter - фильтр по дате регистрации
      if (filters.period.from || filters.period.to) {
        if (!user.registrationDate) return false
        
        // Parse date string like "22 окт. 2024, 09:12" to Date
        const monthMap: { [key: string]: number } = {
          "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5,
          "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
          "января": 0, "февраля": 1, "марта": 2, "апреля": 3, "мая": 4, "июня": 5,
          "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11,
          "февр": 1, "сент": 8
        }
        
        const datePart = user.registrationDate.split(',')[0] // "22 окт. 2024"
        const parts = datePart.split(' ')
        const day = parseInt(parts[0])
        const monthKey = parts[1].replace('.', '').replace('.', '')
        const year = parseInt(parts[2])
        const month = monthMap[monthKey]
        
        if (month === undefined) return false
        
        const userDate = new Date(year, month, day)
        
        if (filters.period.from) {
          const fromDate = new Date(filters.period.from)
          fromDate.setHours(0, 0, 0, 0)
          if (userDate < fromDate) return false
        }
        
        if (filters.period.to) {
          const toDate = new Date(filters.period.to)
          toDate.setHours(23, 59, 59, 999)
          if (userDate > toDate) return false
        }
      }
      return true
    })
  }, [filters])

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aValue: string, bValue: string
      switch (sortField) {
        case "name":
          aValue = `${a.lastName} ${a.firstName} ${a.middleName}`
          bValue = `${b.lastName} ${b.firstName} ${b.middleName}`
          break
        case "role":
          aValue = a.role
          bValue = b.role
          break
        case "email":
          aValue = a.email
          bValue = b.email
          break
        case "phone":
          aValue = a.phone
          bValue = b.phone
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "lastLogin":
          aValue = a.lastLogin
          bValue = b.lastLogin
          break
        default:
          return 0
      }
      const comparison = aValue.localeCompare(bValue, "ru")
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredUsers, sortField, sortDirection])

  const totalPages = Math.ceil(sortedUsers.length / pageSize)
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getInitials = (user: User) => {
    return `${user.lastName[0]}${user.firstName[0]}`
  }

  const formatDate = (dateString: string): string => {
    // Маппинг полных названий месяцев на сокращенные (в порядке от длинных к коротким)
    const replacements: Array<[string, string]> = [
      ["января", "янв."],
      ["февраля", "фев."],
      ["марта", "мар."],
      ["апреля", "апр."],
      ["июня", "июн."],
      ["июля", "июл."],
      ["августа", "авг."],
      ["сентября", "сен."],
      ["октября", "окт."],
      ["ноября", "ноя."],
      ["декабря", "дек."],
      ["мая", "май"],
      // Варианты без окончания (после полных, чтобы не заменять уже обработанные)
      ["февр.", "фев."],
      ["сент.", "сен."],
    ]

    let formatted = dateString

    // Заменяем полные названия месяцев на сокращенные (регистронезависимо)
    for (const [full, short] of replacements) {
      // Простая замена строки (глобально, без учета регистра)
      const regex = new RegExp(full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi")
      formatted = formatted.replace(regex, short)
    }

    return formatted
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      roles: [],
      statuses: [],
      period: {},
    })
  }

  const handleAddUser = (userData: {
    email: string
    password: string
    role: User["role"]
    status: User["status"]
  }) => {
    // Здесь должна быть логика добавления пользователя
    // Пока просто показываем toast
    toast({
      title: "Пользователь добавлен",
      description: `Пользователь ${userData.email} успешно создан`,
      variant: "success",
    })
    setIsAddModalOpen(false)
  }

  const handleBlockUser = (user: User) => {
    setStatusDialogUser(user)
  }

  const handleDeleteUser = (user: User) => {
    setDeleteDialogUser(user)
  }

  const handleStatusConfirm = () => {
    if (statusDialogUser) {
      const newStatus = statusDialogUser.status === "active" ? "inactive" : "active"
      
      // Обновляем статус пользователя в состоянии
      setUsers(users.map(user => 
        user.id === statusDialogUser.id 
          ? { ...user, status: newStatus }
          : user
      ))
      
      toast({
        title: "Статус изменен",
        description: `Пользователь ${statusDialogUser.lastName} ${statusDialogUser.firstName} ${newStatus === "active" ? "активирован" : "заблокирован"}`,
        variant: "success",
      })
      setStatusDialogUser(null)
    }
  }

  const handleStatusCancel = () => {
    setStatusDialogUser(null)
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogUser) {
      // TODO: Implement delete functionality
      toast({
        title: "Пользователь удален",
        description: `Пользователь ${deleteDialogUser.lastName} ${deleteDialogUser.firstName} успешно удален`,
        variant: "success",
      })
      setDeleteDialogUser(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogUser(null)
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortField === field
    return (
      <button
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => handleSort(field)}
      >
        {children}
        {isActive ? (
          <ChevronsUpDown className={cn("h-3.5 w-3.5 text-foreground")} />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5" />
        )}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-6 py-6">
        {isLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold flex items-center gap-3">
              Пользователи
              <span className="text-sm font-normal px-2.5 py-1 bg-muted rounded-md text-muted-foreground">
                {filteredUsers.length}
              </span>
            </h1>
            <Button onClick={() => setIsAddModalOpen(true)} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Добавить пользователя
            </Button>
          </div>
        )}

        <div className="mb-6">
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
            <UserFilters filters={filters} onFiltersChange={setFilters} totalUsers={filteredUsers.length} />
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto" style={{ scrollbarGutter: 'stable' }}>
            <table className="w-full" style={{ minWidth: '1024px' }}>
              <thead>
                <tr className="border-b">
                  <th className="px-4 h-[52px] text-left" style={{ width: '25%', minWidth: '200px' }}>
                    <SortButton field="name">Пользователь</SortButton>
                  </th>
                  <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '120px' }}>
                    <SortButton field="role">Роль</SortButton>
                  </th>
                  <th className="px-4 h-[52px] text-left" style={{ width: '20%', minWidth: '180px' }}>
                    <SortButton field="email">Email</SortButton>
                  </th>
                  <th className="px-4 h-[52px] text-left" style={{ width: '15%', minWidth: '140px' }}>
                    <SortButton field="phone">Телефон</SortButton>
                  </th>
                  <th className="px-4 h-[52px] text-left" style={{ width: '12%', minWidth: '100px' }}>
                    <SortButton field="status">Статус</SortButton>
                  </th>
                  <th className="px-4 h-[52px] text-left" style={{ width: '13%', minWidth: '140px' }}>
                    <SortButton field="lastLogin">Последний вход</SortButton>
                  </th>
                  <th className="h-[52px] px-3 sticky right-0 bg-card z-20 rounded-tr-lg" style={{ width: '60px' }}></th>
                </tr>
              </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => <UserTableRowSkeleton key={i} />)
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16">
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle className="text-sm">Пользователи не найдены</EmptyTitle>
                        <EmptyDescription className="whitespace-nowrap">
                          Попробуйте изменить параметры поиска или сбросить фильтры
                        </EmptyDescription>
                        <Button
                          onClick={handleClearFilters}
                          variant="outline"
                          className="mt-4 gap-2"
                        >
                          <X className="h-4 w-4" />
                          Очистить
                        </Button>
                      </EmptyHeader>
                    </Empty>
                  </td>
                </tr>
              ) : (
                  paginatedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b last:border-b-0 hover:bg-accent/20 transition-colors cursor-pointer group"
                  )}
                  onClick={() => (window.location.href = `/users/${user.id}`)}
                >
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '25%', minWidth: '200px' }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground flex-shrink-0">
                        {getInitials(user)}
                      </span>
                      <span className="text-sm truncate">
                        {user.lastName} {user.firstName} {user.middleName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '15%', minWidth: '120px' }}>
                    <span className="text-sm truncate">{user.role}</span>
                  </td>
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '20%', minWidth: '180px' }}>
                    <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                  </td>
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '15%', minWidth: '140px' }}>
                    <span className="text-sm text-muted-foreground truncate">{user.phone}</span>
                  </td>
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '12%', minWidth: '100px' }}>
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 overflow-hidden" style={{ width: '13%', minWidth: '140px' }}>
                    <span className="text-sm text-muted-foreground truncate">{formatDate(user.lastLogin)}</span>
                  </td>
                  <td 
                    className={cn(
                      "px-3 py-3 sticky right-0 z-20 transition-colors",
                      "bg-card group-hover:bg-accent/20",
                      index === paginatedUsers.length - 1 && "rounded-br-lg"
                    )} 
                    style={{ 
                      width: '60px'
                    }} 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}/edit`} className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2" />
                              Редактировать
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/users/${user.id}`} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              Просмотр
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBlockUser(user); }}>
                            {user.status === "active" ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Заблокировать
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Разблокировать
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
                  ))
                )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {isLoading ? (
          <PaginationSkeleton />
        ) : (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            pageSize={pageSize}
            totalItems={sortedUsers.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        )}
      </main>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />

      {/* Status Change Dialog */}
      <AlertDialog open={!!statusDialogUser} onOpenChange={(open) => !open && setStatusDialogUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {statusDialogUser?.status === "active" ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
              )}
              Подтверждение изменения статуса
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusDialogUser?.status === "active" ? (
                "Вы уверены, что хотите изменить статус пользователя? Если отключить, пользователь будет заблокирован и потеряет доступ."
              ) : (
                "Вы уверены, что хотите активировать пользователя? Пользователь получит доступ к системе."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStatusCancel}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={
                statusDialogUser?.status === "active"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              }
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialogUser} onOpenChange={(open) => !open && setDeleteDialogUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              Подтверждение удаления пользователя
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя? Это действие нельзя отменить. Все данные пользователя будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
