"use client"

import { useState, useEffect, useCallback } from "react"
import { api, type Todo } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

interface UseTodosReturn {
  todos: Todo[]
  loading: boolean
  error: string | null
  createTodo: (title: string, description?: string) => Promise<boolean>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<boolean>
  deleteTodo: (id: string) => Promise<boolean>
  searchTodos: (query: string) => Promise<void>
  refreshTodos: () => Promise<void>
  clearError: () => void
  stats: {
    total: number
    completed: number
    pending: number
    completionRate: number
  }
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshTodos = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await api.getTodos()
      if (response.data) {
        setTodos(response.data)
      } else {
        setError(response.error || "Failed to fetch todos")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [user])

  const createTodo = useCallback(async (title: string, description?: string): Promise<boolean> => {
    setError(null)

    try {
      const response = await api.createTodo(title, description)
      if (response.data) {
        setTodos((prev) => [response.data, ...prev])
        return true
      } else {
        setError(response.error || "Failed to create todo")
        return false
      }
    } catch (err) {
      setError("Failed to create todo")
      return false
    }
  }, [])

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>): Promise<boolean> => {
    setError(null)

    try {
      const response = await api.updateTodo(id, updates)
      if (response.data) {
        setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)))
        return true
      } else {
        setError(response.error || "Failed to update todo")
        return false
      }
    } catch (err) {
      setError("Failed to update todo")
      return false
    }
  }, [])

  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    setError(null)

    try {
      const response = await api.deleteTodo(id)
      if (response.data) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
        return true
      } else {
        setError(response.error || "Failed to delete todo")
        return false
      }
    } catch (err) {
      setError("Failed to delete todo")
      return false
    }
  }, [])

  const searchTodos = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.searchTodos(query)
      if (response.data) {
        setTodos(response.data)
      } else {
        setError(response.error || "Failed to search todos")
      }
    } catch (err) {
      setError("Failed to search todos")
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate stats from current todos
  const stats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    pending: todos.filter((todo) => !todo.completed).length,
    completionRate:
      todos.length > 0 ? Math.round((todos.filter((todo) => todo.completed).length / todos.length) * 100) : 0,
  }

  // Initial load
  useEffect(() => {
    refreshTodos()
  }, [refreshTodos])

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    searchTodos,
    refreshTodos,
    clearError,
    stats,
  }
}
