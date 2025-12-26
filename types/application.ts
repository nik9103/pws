export interface ApplicationDocument {
  id: string
  name: string
  type: "Согласие" | "Договор" | "Страховка"
  status: "signed" | "unsigned"
  date?: string
  size: string
}

export interface Application {
  id: string
  applicationId: string // например, "2025001"
  athlete: {
    initials: string
    fullName: string
    birthDate?: string
    age?: number
    email?: string
    phone?: string
  }
  competition: {
    name: string
    dateRange: string // "10 фев. - 16 фев. 2025"
    discipline?: string
    participants?: number
    location?: string
  }
  submissionDate: string // "12 янв. 2025"
  status: "accepted" | "pending" | "rejected"
  documents?: ApplicationDocument[]
}

export interface ApplicationFilterState {
  search: string
  period: { from?: Date; to?: Date }
  athletes: string[]
  competitions: string[]
  statuses: ("accepted" | "pending" | "rejected")[]
}

