export interface UserDocument {
  id: string
  name: string
  size: string
  type: string
  category: "passport" | "other"
  previewUrl?: string
}

export type Gender = "male" | "female"

export interface User {
  id: string
  firstName: string
  lastName: string
  middleName: string
  role: "Спортсмен" | "Тренер" | "Администратор" | "Судья" | "Спортивный менеджер"
  status: "active" | "inactive" | "blocked"
  birthDate: string
  age: number
  gender?: Gender
  avatar?: string
  registrationDate: string
  lastLogin: string
  email: string
  phone: string
  bankDetails: {
    cardNumber: string
    bik: string
    accountNumber: string
    recipient: string
    corrAccount: string
  }
  passport: {
    series: string
    number: string
    issuedBy: string
    issueDate: string
    registrationAddress: string
  }
  otherData: {
    inn: string
    snils: string
  }
  documents: UserDocument[]
}

export interface UserEditFormData {
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  gender: Gender
  passport: {
    seriesNumber: string
    issueDate: string
    issuedBy: string
    registrationAddress: string
  }
  otherData: {
    snils: string
    inn: string
  }
  bankDetails: {
    cardNumber: string
    recipient: string
    bik: string
    corrAccount: string
    accountNumber: string
  }
  email: string
  status: "active" | "inactive" | "blocked"
}

export interface FormErrors {
  [key: string]: string | undefined
}
