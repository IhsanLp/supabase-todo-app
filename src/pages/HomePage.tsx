import { useAuth } from '../hooks/useAuth'
import { useTodos } from '../hooks/useTodos'
import { Header } from '../components/Layout/Header'
import { TodoForm } from '../components/Todos/TodoForm'
import { TodoList } from '../components/Todos/TodoList'

export function HomePage() {
  const { user } = useAuth()
  const { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleComplete } = useTodos(user!.id)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <TodoForm onSubmit={addTodo} />

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</p>
        )}

        <TodoList
          todos={todos}
          loading={loading}
          onToggle={toggleComplete}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      </main>
    </div>
  )
}
