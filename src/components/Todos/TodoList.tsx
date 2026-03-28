import { useMemo } from 'react'
import type { Todo } from '../../types/todo'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onToggle: (id: string, currentValue: boolean) => void
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'priority' | 'due_date'>>) => void
  onDelete: (id: string) => void
}

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.is_complete) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(todo.due_date) < today
}

export function TodoList({ todos, loading, onToggle, onUpdate, onDelete }: TodoListProps) {
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.is_complete !== b.is_complete) return a.is_complete ? 1 : -1
      const aOverdue = isOverdue(a)
      const bOverdue = isOverdue(b)
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1
      if (a.priority !== b.priority) return a.priority - b.priority
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [todos])

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Todos werden geladen...</p>
  }

  if (todos.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Noch keine Todos vorhanden. Erstelle dein erstes!</p>
  }

  return (
    <div className="space-y-3">
      {sortedTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
