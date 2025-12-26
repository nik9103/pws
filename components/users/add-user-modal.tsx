"use client"

import { useState } from "react"
import { EyeOff, Eye, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User } from "@/types/user"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (userData: {
    email: string
    password: string
    role: User["role"]
    status: User["status"]
  }) => void
}

const roleOptions: User["role"][] = [
  "Спортсмен",
  "Администратор",
  "Судья",
  "Спортивный менеджер",
]

const statusOptions: User["status"][] = ["active", "inactive"]

const statusLabels: Record<User["status"], string> = {
  active: "Активен",
  inactive: "Заблокирован",
}

export function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<User["role"]>("Спортсмен")
  const [status, setStatus] = useState<User["status"]>("active")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email обязателен")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Некорректный формат email")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Пароль обязателен")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Пароль должен содержать минимум 6 символов")
      return false
    }
    if (password.length > 50) {
      setPasswordError("Пароль не должен превышать 50 символов")
      return false
    }
    setPasswordError("")
    return true
  }

  const generatePassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let generatedPassword = ""
    for (let i = 0; i < length; i++) {
      generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(generatedPassword)
    setPasswordError("")
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (value && emailError) {
      validateEmail(value)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (value && passwordError) {
      validatePassword(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    onAdd({ email, password, role, status })
    // Сброс формы
    setEmail("")
    setPassword("")
    setRole("Спортсмен")
    setStatus("active")
    setShowPassword(false)
    setEmailError("")
    setPasswordError("")
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setRole("Спортсмен")
    setStatus("active")
    setShowPassword(false)
    setEmailError("")
    setPasswordError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>Создание пользователя</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Роль и Статус в одной строке */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Роль</Label>
                <Select value={role} onValueChange={(value) => setRole(value as User["role"])}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Спортсмен" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as User["status"])}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Активный" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => validateEmail(email)}
                required
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>

            {/* Пароль */}
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="• • • • • •"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  required
                  minLength={6}
                  maxLength={50}
                  className={passwordError ? "border-destructive pr-20" : "pr-20"}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Сгенерировать пароль"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {passwordError ? (
                <p className="text-sm text-destructive">{passwordError}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Пользователь сможет изменить пароль после первого входа, минимум 6 символов
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit">Добавить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


