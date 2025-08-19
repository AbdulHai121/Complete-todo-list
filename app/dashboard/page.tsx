"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { api, type Todo } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TodoCard } from "@/components/todo-card"
import { CreateTodoDialog } from "@/components/create-todo-dialog"
import { Plus, Search, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchTodos = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await api.getTodos()
      if (response.data) {
        setTodos(response.data)
        setFilteredTodos(response.data)
      } else {
        setError(response.error || "Failed to fetch todos")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTodos(todos)
    } else {
      const filtered = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredTodos(filtered)
    }
  }, [searchQuery, todos])

  const handleTodoUpdate = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await api.updateTodo(id, updates)
      if (response.data) {
        setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)))
      } else {
        setError(response.error || "Failed to update todo")
      }
    } catch (err) {
      setError("Failed to update todo")
    }
  }

  const handleTodoDelete = async (id: string) => {
    try {
      const response = await api.deleteTodo(id)
      if (response.data) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
      } else {
        setError(response.error || "Failed to delete todo")
      }
    } catch (err) {
      setError("Failed to delete todo")
    }
  }

  const handleTodoCreate = async (title: string, description?: string) => {
    try {
      const response = await api.createTodo(title, description)
      if (response.data) {
        setTodos((prev) => [response.data, ...prev])
        setCreateDialogOpen(false)
      } else {
        setError(response.error || "Failed to create todo")
      }
    } catch (err) {
      setError("Failed to create todo")
    }
  }

  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Todo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
            <p className="text-xs text-muted-foreground">All your tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTodos.length}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodos.length}</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Todos List */}
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="font-serif text-xl mb-2">
                {searchQuery ? "No todos found" : "No todos yet"}
              </CardTitle>
              <CardDescription className="text-center mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first todo item"}
              </CardDescription>
              {!searchQuery && (
                <Button onClick={() => setCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Todo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Pending Todos */}
            {pendingTodos.filter((todo) =>
              searchQuery
                ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                : true,
            ).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">Pending Tasks</h2>
                  <Badge variant="secondary">
                    {
                      pendingTodos.filter((todo) =>
                        searchQuery
                          ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                          : true,
                      ).length
                    }
                  </Badge>
                </div>
                {pendingTodos
                  .filter((todo) =>
                    searchQuery
                      ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      : true,
                  )
                  .map((todo) => (
                    <TodoCard key={todo.id} todo={todo} onUpdate={handleTodoUpdate} onDelete={handleTodoDelete} />
                  ))}
              </div>
            )}

            {/* Completed Todos */}
            {completedTodos.filter((todo) =>
              searchQuery
                ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                : true,
            ).length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold">Completed Tasks</h2>
                  <Badge variant="outline">
                    {
                      completedTodos.filter((todo) =>
                        searchQuery
                          ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                          : true,
                      ).length
                    }
                  </Badge>
                </div>
                {completedTodos
                  .filter((todo) =>
                    searchQuery
                      ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      : true,
                  )
                  .map((todo) => (
                    <TodoCard key={todo.id} todo={todo} onUpdate={handleTodoUpdate} onDelete={handleTodoDelete} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Todo Dialog */}
      <CreateTodoDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreateTodo={handleTodoCreate} />
    </div>
  )
}
