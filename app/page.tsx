"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Plus, Search, Shield, AlertCircle, Server } from "lucide-react"
import { ConnectionTest } from "@/components/connection-test"

export default function HomePage() {
  const { user } = useAuth()

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground text-lg">Ready to manage your tasks efficiently?</p>
          </div>

          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">
              <strong>Setup Required:</strong> Make sure your backend server is running on port 5000, or set{" "}
              <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> in your .env.local file.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl font-bold text-foreground mb-6">Organize Your Life with TodoApp</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern, intuitive todo application that helps you stay productive and organized. Manage your tasks with
            ease and never miss a deadline again.
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <ConnectionTest />
        </div>

        <div className="mb-16">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" />
                <CardTitle className="font-serif text-blue-900">Backend Setup Instructions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="space-y-3">
                <p className="font-medium">To use this application, you need to:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Start your backend server (typically on port 5000)</li>
                  <li>
                    Create a <code className="bg-blue-100 px-1 rounded">.env.local</code> file in your project root
                  </li>
                  <li>
                    Add: <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_API_URL=http://localhost:5000/api</code>
                  </li>
                  <li>Restart your frontend development server</li>
                </ol>
                <p className="text-xs text-blue-600 mt-3">
                  Replace the port number if your backend runs on a different port.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Easy Task Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quickly add new tasks with detailed descriptions and organize them efficiently.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Smart Search</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Find any task instantly with our powerful search functionality.</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is protected with email verification and secure authentication.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="bg-card rounded-lg p-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-8">Why Choose TodoApp?</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Complete Task Management</h3>
                <p className="text-muted-foreground text-sm">
                  Create, update, delete, and search through your tasks with full CRUD functionality.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Email Verification</h3>
                <p className="text-muted-foreground text-sm">
                  Secure your account with our email verification system using OTP codes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Clean Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Intuitive interface designed for productivity and ease of use.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Responsive Design</h3>
                <p className="text-muted-foreground text-sm">Works perfectly on desktop, tablet, and mobile devices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
