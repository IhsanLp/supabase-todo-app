import { useState } from 'react'
import type { Todo } from '../../types/todo'
import { TodoForm } from './TodoForm'

const priorityConfig = {
  1: { label: 'Hoch', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  2: { label: 'Mittel', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  3: { label: 'Niedrig', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

const PRIORITY_REMINDER_HOURS: Record<number, number> = {
  3: 24,
  2: 48,
}

function getAgeHours(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
}

function shouldSuggestUpgrade(todo: Todo): boolean {
  if (todo.is_complete || todo.priority === 1) return false
  const threshold = PRIORITY_REMINDER_HOURS[todo.priority]
  return threshold !== undefined && getAgeHours(todo.created_at) >= threshold
}

function isOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.is_complete) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(todo.due_date) < today
}

function isDueSoon(todo: Todo): boolean {
  if (!todo.due_date || todo.is_complete) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(todo.due_date)
  const diffDays = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= 1
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, currentValue: boolean) => void
  onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'priority' | 'due_date'>>) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const priority = priorityConfig[todo.priority]
  const suggestUpgrade = shouldSuggestUpgrade(todo)
  const overdue = isOverdue(todo)
  const dueSoon = isDueSoon(todo)

  if (editing) {
    return (
      <TodoForm
        todo={todo}
        onSubmit={(title, description, priorityVal, dueDate) => {
          onUpdate(todo.id, { title, description, priority: priorityVal, due_date: dueDate })
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border ${overdue ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'} ${todo.is_complete ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.is_complete}
          onChange={() => onToggle(todo.id, todo.is_complete)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium ${todo.is_complete ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {todo.title}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
              {priority.label}
            </span>
            {overdue && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-600 text-white">
                Überfällig
              </span>
            )}
            {dueSoon && !overdue && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Bald fällig
              </span>
            )}
          </div>
          {todo.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(todo.created_at).toLocaleDateString('de-DE')}
            </p>
            {todo.due_date && (
              <p className={`text-xs ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                Fällig: {new Date(todo.due_date).toLocaleDateString('de-DE')}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
          >
            Bearbeiten
          </button>
          <button
            onClick={() => {
              if (window.confirm('Todo wirklich löschen?')) {
                onDelete(todo.id)
              }
            }}
            className="text-xs px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
          >
            Löschen
          </button>
        </div>
      </div>

      {suggestUpgrade && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <span className="text-xs text-amber-700 dark:text-amber-400">
            Dieses Todo ist seit über {PRIORITY_REMINDER_HOURS[todo.priority]}h offen. Priorität erhöhen?
          </span>
          <button
            onClick={() => onUpdate(todo.id, { priority: (todo.priority - 1) as 1 | 2 })}
            className="text-xs px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors font-medium"
          >
            Ja, erhöhen
          </button>
        </div>
      )}
    </div>
  )
}
