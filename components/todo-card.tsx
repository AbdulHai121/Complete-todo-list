"use client"
import { useState } from "react"
import type { Todo } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditTodoDialog } from "@/components/edit-todo-dialog"
import { cn } from "@/lib/utils"
import { Edit, Trash2, Calendar } from "lucide-react"

interface TodoCardProps {
  todo: Todo
  onUpdate: (id: string, updates: Partial<Todo>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoCard({ todo, onUpdate, onDelete }: TodoCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleComplete = async () => {
    setIsUpdating(true)
    try {
      await onUpdate(todo.id, { completed: !todo.completed })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(todo.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = async (title: string, description?: string) => {
    try {
      await onUpdate(todo.id, { title, description })
      setEditDialogOpen(false)
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className={cn("transition-all duration-200", todo.completed && "opacity-75")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isUpdating}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-sm leading-5",
                    todo.completed && "line-through text-muted-foreground",
                  )}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={cn("text-sm text-muted-foreground mt-1 leading-5", todo.completed && "line-through")}>
                    {todo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {todo.completed && <Badge variant="secondary">Completed</Badge>}
                <Button variant="ghost" size="sm" onClick={() => setEditDialogOpen(true)} className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{todo.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(todo.createdAt)}</span>
              </div>
              {todo.updatedAt !== todo.createdAt && (
                <div className="flex items-center gap-1">
                  <span>Updated {formatDate(todo.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <EditTodoDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} todo={todo} onUpdateTodo={handleUpdate} />
    </Card>
  )
}
