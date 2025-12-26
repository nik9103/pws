export interface Document {
  id: string
  name: string
  type: "Согласие" | "Договор" | "Страховка"
  status: "signed" | "unsigned"
  date?: string
  size: string
  athlete: {
    initials: string
    fullName: string
  }
  competition: string
  discipline: string
}

export interface FilterState {
  search: string
  period: { from?: Date; to?: Date }
  athletes: string[]
  competitions: string[]
  disciplines: string[]
  statuses: ("signed" | "unsigned")[]
  documentTypes: string[]
}
