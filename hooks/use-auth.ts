"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, type User } from "@/lib/api"
import React from "react"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; email?: string }>
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  isVerificationPending: boolean
  pendingVerificationEmail: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVerificationPending, setIsVerificationPending] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    const storedVerificationEmail = localStorage.getItem("pendingVerificationEmail")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    if (storedVerificationEmail) {
      setIsVerificationPending(true)
      setPendingVerificationEmail(storedVerificationEmail)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)

    if (response.data) {
      const { token, user } = response.data
      setToken(token)
      setUser(user)
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      setIsVerificationPending(false)
      setPendingVerificationEmail(null)
      localStorage.removeItem("pendingVerificationEmail")
      return { success: true }
    }

    return { success: false, error: response.error }
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password)

    if (response.data) {
      setIsVerificationPending(true)
      setPendingVerificationEmail(email)
      localStorage.setItem("pendingVerificationEmail", email)
      return { success: true, email: response.data.email }
    }

    return { success: false, error: response.error }
  }

  const verifyEmail = async (email: string, otp: string) => {
    const response = await api.verifyEmail(email, otp)

    if (response.data) {
      setIsVerificationPending(false)
      setPendingVerificationEmail(null)
      localStorage.removeItem("pendingVerificationEmail")
      return { success: true }
    }

    return { success: false, error: response.error }
  }

  const resendVerificationCode = async (email: string) => {
    // Since the backend doesn't have a dedicated resend endpoint, we'll use register again
    // This is a common pattern where re-registering sends a new OTP
    const response = await api.register("", email, "")

    if (response.data) {
      return { success: true }
    }

    return { success: false, error: response.error }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsVerificationPending(false)
    setPendingVerificationEmail(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("pendingVerificationEmail")
  }

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    logout,
    loading,
    isVerificationPending,
    pendingVerificationEmail,
  }

  return React.createElement(AuthContext.Provider, { value: contextValue }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
