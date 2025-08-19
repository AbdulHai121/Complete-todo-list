"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"

interface ConnectionStatus {
  status: "idle" | "testing" | "success" | "error"
  message: string
  details?: string
}

export function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "idle",
    message: 'Click "Test Connection" to check backend connectivity',
  })

  const testConnection = async () => {
    setConnectionStatus({ status: "testing", message: "Testing connection..." })

    try {
      // First try a simple health check
      const healthResult = await api.healthCheck()

      if (healthResult.data) {
        setConnectionStatus({
          status: "success",
          message: "Backend connection successful!",
          details: `Server responded at ${new Date().toLocaleTimeString()}`,
        })
      } else {
        setConnectionStatus({
          status: "error",
          message: "Backend server responded but with an error",
          details: healthResult.error || "Unknown error",
        })
      }
    } catch (error) {
      // If health check fails, provide detailed troubleshooting
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      setConnectionStatus({
        status: "error",
        message: "Cannot connect to backend server",
        details: `Trying to connect to: ${apiUrl}\n\nPossible solutions:\n1. Start your backend server\n2. Check if it's running on the correct port\n3. Verify CORS is configured\n4. Set NEXT_PUBLIC_API_URL environment variable`,
      })
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <RefreshCw className="h-4 w-4" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-600">
            Connected
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Disconnected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Backend Connection Test
            </CardTitle>
            <CardDescription>Test connectivity to your backend API server</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">API Endpoint:</p>
            <p className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
            </p>
          </div>
          <Button onClick={testConnection} disabled={connectionStatus.status === "testing"} size="sm">
            {connectionStatus.status === "testing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg border p-3 bg-muted/50">
          <p className="text-sm font-medium mb-1">Status:</p>
          <p className="text-sm">{connectionStatus.message}</p>
          {connectionStatus.details && (
            <pre className="text-xs mt-2 whitespace-pre-wrap text-muted-foreground">{connectionStatus.details}</pre>
          )}
        </div>

        {connectionStatus.status === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <h4 className="text-sm font-medium text-red-800 mb-2">Troubleshooting Steps:</h4>
            <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
              <li>Make sure your backend server is running</li>
              <li>Check if the server is listening on the correct port</li>
              <li>Verify CORS is configured to allow requests from localhost:3000</li>
              <li>Set the NEXT_PUBLIC_API_URL environment variable if using a different port</li>
              <li>Check your backend server logs for any errors</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
