import { Skeleton } from "./skeleton"
import { Card, CardContent, CardHeader } from "./card"

// Скелетон для карточек статистики на главной странице
export function StatisticCardSkeleton() {
  return (
    <Card className="rounded-[10px] shadow-xs py-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-4">
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-[10px]" />
        </div>
      </CardContent>
    </Card>
  )
}

// Скелетон для элементов активности
export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4 border-b border-border last:border-b-0">
      <Skeleton className="h-8 w-8 rounded-[10px] shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
          <Skeleton className="h-3 w-24 shrink-0" />
        </div>
      </div>
    </div>
  )
}

// Скелетон для таблицы пользователей
export function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto" style={{ scrollbarGutter: 'stable' }}>
        <table className="w-full" style={{ minWidth: '1024px' }}>
          <thead>
            <tr className="border-b">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 h-[52px] text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b last:border-b-0">
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Скелетон для строки таблицы пользователей (специфичный)
export function UserTableRowSkeleton() {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  )
}

// Скелетон для профиля пользователя
export function UserProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-32 rounded" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-4 w-36 mb-3" />
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-3" />
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Скелетон для фильтров
export function FiltersSkeleton() {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-72 rounded" />
          <Skeleton className="h-10 w-[200px] rounded" />
          <Skeleton className="h-10 w-40 rounded" />
        </div>
      </div>
    </div>
  )
}

// Скелетон для заголовка страницы с кнопкой
export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <Skeleton className="h-9 w-48 rounded" />
    </div>
  )
}

// Скелетон для пагинации
export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between mt-6">
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded" />
        <Skeleton className="h-9 w-9 rounded" />
        <Skeleton className="h-9 w-9 rounded" />
        <Skeleton className="h-9 w-9 rounded" />
      </div>
    </div>
  )
}

// Скелетон для карточки соревнования/заявки в таблице
export function CompetitionTableRowSkeleton() {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-48" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-12" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  )
}

// Скелетон для профиля соревнования
export function CompetitionProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-7 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <Skeleton className="h-8 w-96 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border border-border">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Скелетон для страницы редактирования с боковой навигацией (пользователи, соревнования)
export function EditPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[896px] mx-auto px-8 pb-8">
        {/* Sticky Header */}
        <div className="sticky top-14 z-40 bg-background" style={{ height: '90px' }}>
          <div className="flex items-center justify-between gap-4 h-full">
            <div className="flex-1">
              <div className="flex items-start justify-start gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-7 w-56 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded" />
              <Skeleton className="h-9 w-28 rounded" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <aside className="sticky top-[146px] self-start">
            <nav className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg mb-1" />
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border border-border rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-full rounded" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

