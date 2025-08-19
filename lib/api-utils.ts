import type { ApiResponse } from "@/lib/api"

export function isApiError<T>(response: ApiResponse<T>): response is { error: string } {
  return "error" in response && !!response.error
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is { data: T } {
  return "data" in response && response.data !== undefined
}

export function handleApiError(error: string): string {
  // Map common API errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    "Network error occurred": "Unable to connect to the server. Please check your internet connection.",
    "Session expired": "Your session has expired. Please log in again.",
    "Invalid credentials": "The email or password you entered is incorrect.",
    "Email already registered": "An account with this email already exists.",
    "Email not verified": "Please verify your email address before logging in.",
    "Invalid OTP": "The verification code you entered is incorrect.",
    "OTP has expired": "The verification code has expired. Please request a new one.",
    "Missing fields": "Please fill in all required fields.",
    "Todo not found": "The requested todo item could not be found.",
    Unauthorized: "You are not authorized to perform this action.",
  }

  return errorMappings[error] || error
}

export function formatApiDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid date"
  }
}

export function validateTodoData(title: string, description?: string): { isValid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: "Title is required" }
  }

  if (title.trim().length > 200) {
    return { isValid: false, error: "Title must be less than 200 characters" }
  }

  if (description && description.trim().length > 1000) {
    return { isValid: false, error: "Description must be less than 1000 characters" }
  }

  return { isValid: true }
}

export async function retryApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries = 3,
  delay = 1000,
): Promise<ApiResponse<T>> {
  let lastError = "Unknown error"

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall()

      if (isApiSuccess(result)) {
        return result
      }

      lastError = result.error || "API call failed"

      // Don't retry on authentication errors or client errors
      if (lastError.includes("401") || lastError.includes("403") || lastError.includes("400")) {
        return result
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Network error"

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt))
      }
    }
  }

  return { error: `Failed after ${maxRetries} attempts: ${lastError}` }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}
