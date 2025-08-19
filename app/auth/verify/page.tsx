"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, Mail, CheckCircle, RefreshCw, Clock } from "lucide-react"

export default function VerifyPage() {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds

  const { verifyEmail, resendVerificationCode, pendingVerificationEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else if (pendingVerificationEmail) {
      setEmail(pendingVerificationEmail)
    }
  }, [searchParams, pendingVerificationEmail])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email) {
      setError("Email is required")
      setLoading(false)
      return
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      setLoading(false)
      return
    }

    try {
      const result = await verifyEmail(email, otp)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(result.error || "Verification failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return

    setResendLoading(true)
    setError("")

    try {
      const result = await resendVerificationCode(email)

      if (result.success) {
        setResendCooldown(60) // 60 second cooldown
        setTimeRemaining(600) // Reset timer to 10 minutes
        setOtp("") // Clear current OTP
      } else {
        setError(result.error || "Failed to resend verification code")
      }
    } catch (err) {
      setError("Failed to resend verification code")
    } finally {
      setResendLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl text-primary">Email Verified!</CardTitle>
          <CardDescription>Your account has been successfully verified. Redirecting to login...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="font-serif text-2xl">Verify Your Email</CardTitle>
        <CardDescription>We've sent a 6-digit verification code to {email || "your email"}</CardDescription>
        {timeRemaining > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Code expires in {formatTime(timeRemaining)}</span>
            </div>
            <Progress value={(timeRemaining / 600) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!email && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(value)
              }}
              maxLength={6}
              required
              disabled={loading}
              className="text-center text-lg tracking-widest"
            />
            {timeRemaining <= 60 && timeRemaining > 0 && (
              <p className="text-xs text-destructive">Code expires in {formatTime(timeRemaining)}</p>
            )}
            {timeRemaining === 0 && (
              <p className="text-xs text-destructive">Code has expired. Please request a new one.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6 || timeRemaining === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0 || !email}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Wrong email? </span>
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up again
              </Link>
            </div>
            <div>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
