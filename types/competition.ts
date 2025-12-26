export interface CompetitionParticipant {
  id: string
  fullName: string
  initials: string
  status: "accepted" | "pending" | "rejected"
}

export interface CompetitionJudge {
  id: string
  fullName: string
  initials: string
}

export interface Competition {
  id: string
  name: string
  discipline: string
  startDate: string // формат "15.01.2024"
  endDate: string // формат "15.01.2025"
  status: "ongoing" | "completed" | "planned"
  organizer?: string
  inMinistryList?: boolean
  participants?: CompetitionParticipant[]
  judges?: CompetitionJudge[]
}

export interface CompetitionFilterState {
  search: string
  period: { from?: Date; to?: Date }
  disciplines: string[]
  statuses: ("ongoing" | "completed" | "planned")[]
}

