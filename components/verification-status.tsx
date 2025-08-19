"use client"

import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function VerificationStatus() {
  const { isVerificationPending, pendingVerificationEmail } = useAuth()

  if (!isVerificationPending || !pendingVerificationEmail) {
    return null
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Please verify your email address: {pendingVerificationEmail}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="ml-4 bg-transparent border-amber-300 hover:bg-amber-100">
          <Link href={`/auth/verify?email=${encodeURIComponent(pendingVerificationEmail)}`}>Verify Now</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
