const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

interface User {
  id: string
  name: string
  email: string
}

interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

interface AuthResponse {
  token: string
  user: User
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: "include", // Added credentials for cookie support
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, clear local storage
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/auth/login"
          return { error: "Session expired. Please login again." }
        }
        return { error: data.error || `HTTP ${response.status}: ${response.statusText}` }
      }

      return { data }
    } catch (error) {
      console.error("API request failed:", error)
      return { error: "Network error occurred. Please check your connection." }
    }
  }

  // Auth methods
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<ApiResponse<{ token: string; email: string; message: string }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async verifyEmail(email: string, otp: string): Promise<ApiResponse<{ message: string }>> {
    return this.request("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    })
  }

  async resendVerificationCode(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async getTodos(): Promise<ApiResponse<Todo[]>> {
    return this.request("/todos")
  }

  async createTodo(title: string, description?: string): Promise<ApiResponse<Todo>> {
    if (!title.trim()) {
      return { error: "Title is required" }
    }

    return this.request("/todos", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        description: description?.trim() || undefined,
      }),
    })
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<ApiResponse<Todo>> {
    if (!id) {
      return { error: "Todo ID is required" }
    }

    const validUpdates = Object.fromEntries(Object.entries(updates).filter(([_, value]) => value !== undefined))

    if (Object.keys(validUpdates).length === 0) {
      return { error: "No valid updates provided" }
    }

    return this.request(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(validUpdates),
    })
  }

  async deleteTodo(id: string): Promise<ApiResponse<{ message: string }>> {
    if (!id) {
      return { error: "Todo ID is required" }
    }

    return this.request(`/todos/${id}`, {
      method: "DELETE",
    })
  }

  async searchTodos(query: string): Promise<ApiResponse<Todo[]>> {
    if (!query.trim()) {
      return this.getTodos()
    }

    return this.request(`/todos/search?q=${encodeURIComponent(query.trim())}`)
  }

  async getTodoStats(): Promise<
    ApiResponse<{
      total: number
      completed: number
      pending: number
      completionRate: number
    }>
  > {
    return this.request("/todos/stats")
  }

  async bulkUpdateTodos(updates: Array<{ id: string; updates: Partial<Todo> }>): Promise<ApiResponse<Todo[]>> {
    if (!updates.length) {
      return { error: "No updates provided" }
    }

    return this.request("/todos/bulk", {
      method: "PUT",
      body: JSON.stringify({ updates }),
    })
  }

  async bulkDeleteTodos(ids: string[]): Promise<ApiResponse<{ message: string; deletedCount: number }>> {
    if (!ids.length) {
      return { error: "No todo IDs provided" }
    }

    return this.request("/todos/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    })
  }

  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request("/health")
  }
}

export const api = new ApiClient()
export type { User, Todo, AuthResponse, ApiResponse }
