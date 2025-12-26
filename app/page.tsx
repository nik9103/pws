"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, FileSymlink, Scale, UserRoundCheck, CircleCheck, CircleX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { StatisticCardSkeleton, ActivityItemSkeleton } from "@/components/ui/skeletons"

interface StatisticCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  iconBgColor: string
  iconColor: string
}

function StatisticCard({ title, value, icon: Icon, iconBgColor, iconColor }: StatisticCardProps) {
  return (
    <Card className="rounded-[10px] shadow-xs py-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-sm font-medium leading-normal text-foreground">{title}</p>
            </div>
            <div>
              <p className="text-3xl font-bold leading-none text-foreground">{value}</p>
            </div>
          </div>
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
  statusIcon: React.ElementType
  iconBgColor: string
  iconColor: string
}

function ActivityItem({ title, description, time, statusIcon: StatusIcon, iconBgColor, iconColor }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-4 border-b border-border last:border-b-0">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]", iconBgColor)}>
        <StatusIcon className={cn("h-5 w-5", iconColor)} strokeWidth={1.33} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{title}</p>
            <p className="text-sm font-normal leading-normal text-muted-foreground">{description}</p>
          </div>
          <p className="text-xs font-normal leading-none text-muted-foreground shrink-0 whitespace-nowrap">{time}</p>
        </div>
      </div>
    </div>
  )
}

const statistics = [
  {
    title: "Активные соревнования",
    value: "12",
    icon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Новые заявки",
    value: "3",
    icon: FileSymlink,
    iconBgColor: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    title: "Зарегистрированные судьи",
    value: "34",
    icon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    title: "Активные спортсмены",
    value: "34",
    icon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
]

type ActivityType = "all" | "approved" | "created" | "rejected"

interface Activity {
  id: string
  title: string
  description: string
  time: string
  statusIcon: React.ElementType
  iconBgColor: string
  iconColor: string
  type: ActivityType
}

const allActivities: Activity[] = [
  {
    id: "1",
    title: "Заявка одобрена",
    description: 'Спортсмен Иванов И.И. одобрен для участия в "Чемпионат России"',
    time: "около 2 часов назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "2",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Кубок Москвы по плаванию 2025"',
    time: "около 2 часов назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "3",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Петрова П.П. отклонена: неполный пакет документов',
    time: "около 2 часов назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "4",
    title: "Судья назначен",
    description: 'Судья Сидоров С.С. назначен на соревнование "Первенство города"',
    time: "около 7 часов назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "5",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Козлов К.К.",
    time: "1 день назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "6",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Козлов К.К.",
    time: "1 день назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "7",
    title: "Заявка одобрена",
    description: 'Спортсмен Сидоров С.С. одобрен для участия в "Кубок Москвы"',
    time: "2 дня назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "8",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Иванова И.И. отклонена: недостаточно документов',
    time: "2 дня назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "9",
    title: "Заявка одобрена",
    description: 'Спортсмен Петров П.П. одобрен для участия в "Первенство России"',
    time: "3 дня назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "10",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Чемпионат Москвы по бегу 2025"',
    time: "3 дня назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "11",
    title: "Судья назначен",
    description: 'Судья Кузнецов К.К. назначен на соревнование "Кубок России"',
    time: "3 дня назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "12",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Смирнов С.С.",
    time: "4 дня назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "13",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Соколова С.С. отклонена: просроченные документы',
    time: "4 дня назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "14",
    title: "Заявка одобрена",
    description: 'Спортсмен Волков В.В. одобрен для участия в "Кубок мира"',
    time: "5 дней назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "15",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Первенство области по плаванию"',
    time: "5 дней назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "16",
    title: "Судья назначен",
    description: 'Судья Орлов О.О. назначен на соревнование "Чемпионат города"',
    time: "6 дней назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "17",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Лебедев Л.Л.",
    time: "6 дней назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "18",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Новикова Н.Н. отклонена: неполная информация',
    time: "1 неделю назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "19",
    title: "Заявка одобрена",
    description: 'Спортсмен Морозов М.М. одобрен для участия в "Кубок Европы"',
    time: "1 неделю назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "20",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Чемпионат региона по легкой атлетике"',
    time: "1 неделю назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "21",
    title: "Судья назначен",
    description: 'Судья Соколов С.С. назначен на соревнование "Первенство страны"',
    time: "1 неделю назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "22",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Павлов П.П.",
    time: "1 неделю назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "23",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Федорова Ф.Ф. отклонена: несоответствие требованиям',
    time: "1 неделю назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "24",
    title: "Заявка одобрена",
    description: 'Спортсмен Николаев Н.Н. одобрен для участия в "Кубок Азии"',
    time: "1 неделю назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "25",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Международный турнир по плаванию"',
    time: "2 недели назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "26",
    title: "Судья назначен",
    description: 'Судья Михайлов М.М. назначен на соревнование "Кубок континента"',
    time: "2 недели назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "27",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Егоров Е.Е.",
    time: "2 недели назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "28",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Степанова С.С. отклонена: отсутствие справок',
    time: "2 недели назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "29",
    title: "Заявка одобрена",
    description: 'Спортсмен Григорьев Г.Г. одобрен для участия в "Чемпионат мира"',
    time: "2 недели назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
  {
    id: "30",
    title: "Новое соревнование создано",
    description: 'Создано соревнование "Национальный чемпионат по плаванию"',
    time: "2 недели назад",
    statusIcon: Trophy,
    iconBgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    type: "created",
  },
  {
    id: "31",
    title: "Судья назначен",
    description: 'Судья Романов Р.Р. назначен на соревнование "Турнир чемпионов"',
    time: "3 недели назад",
    statusIcon: Scale,
    iconBgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    type: "created",
  },
  {
    id: "32",
    title: "Новая регистрация",
    description: "Зарегистрирован новый спортсмен: Воробьев В.В.",
    time: "3 недели назад",
    statusIcon: UserRoundCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "created",
  },
  {
    id: "33",
    title: "Заявка отклонена",
    description: 'Заявка спортсмена Сергеева С.С. отклонена: некорректные данные',
    time: "3 недели назад",
    statusIcon: CircleX,
    iconBgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    type: "rejected",
  },
  {
    id: "34",
    title: "Заявка одобрена",
    description: 'Спортсмен Васильев В.В. одобрен для участия в "Суперкубок"',
    time: "3 недели назад",
    statusIcon: CircleCheck,
    iconBgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    type: "approved",
  },
]

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActivityType>("all")
  const [displayedCount, setDisplayedCount] = useState(4)
  const itemsPerPage = 10

  useEffect(() => {
    // Симуляция загрузки данных
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredActivities = useMemo(() => {
    if (activeTab === "all") {
      return allActivities
    }
    return allActivities.filter((activity) => activity.type === activeTab)
  }, [activeTab])

  const displayedActivities = filteredActivities.slice(0, displayedCount)
  const hasMore = displayedCount < filteredActivities.length

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + itemsPerPage)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as ActivityType)
    setDisplayedCount(4) // Сбрасываем счетчик при смене таба
  }

  const tabLabels: Record<ActivityType, string> = {
    all: "Все",
    approved: "Одобренные",
    created: "Созданные",
    rejected: "Отклоненные",
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="px-6 py-6">
        {/* Title */}
        <div className="mb-3 pb-3">
          <h1 className="text-xl font-semibold leading-none text-foreground">Панель управления</h1>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatisticCardSkeleton key={i} />)
            ) : (
              statistics.map((stat) => <StatisticCard key={stat.title} {...stat} />)
            )}
        </div>

        {/* Recent Activities Card */}
        <Card className="rounded-[10px] shadow-xs py-0">
          <CardHeader className="pt-6 pb-3 border-b-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold leading-none">Последние действия</CardTitle>
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-auto">
                  <TabsList className="h-9 bg-muted p-[3px] rounded-[10px]">
                    <TabsTrigger
                      value="all"
                      className="h-[calc(100%-1px)] px-2 py-1 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
                    >
                      {tabLabels.all}
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="h-[calc(100%-1px)] px-2 py-1 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
                    >
                      {tabLabels.approved}
                    </TabsTrigger>
                    <TabsTrigger
                      value="created"
                      className="h-[calc(100%-1px)] px-2 py-1 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
                    >
                      {tabLabels.created}
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="h-[calc(100%-1px)] px-2 py-1 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
                    >
                      {tabLabels.rejected}
                    </TabsTrigger>
                  </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ActivityItemSkeleton key={i} />
                  ))}
                </div>
              ) : displayedActivities.length === 0 ? (
                <Empty className="border-0 p-12">
                  <EmptyMedia variant="icon">
                    <CircleX className="h-6 w-6 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>Нет действий</EmptyTitle>
                  <EmptyDescription>
                    {activeTab === "all"
                      ? "Нет последних действий для отображения"
                      : `Нет действий в категории "${tabLabels[activeTab]}"`}
                  </EmptyDescription>
                </Empty>
              ) : (
                <>
                  <div className="divide-y divide-border">
                    {displayedActivities.map((activity) => (
                      <ActivityItem key={activity.id} {...activity} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="px-4 py-4 border-t border-border">
                      <Button
                        variant="ghost"
                        onClick={handleShowMore}
                        className="w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        Показать больше
                      </Button>
                    </div>
                  )}
                </>
              )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
