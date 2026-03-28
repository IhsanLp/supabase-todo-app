import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

export function Header() {
  const { user, signOut } = useAuth()
  const { dark, toggleDark } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Todo App</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {dark ? 'Hell' : 'Dunkel'}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  )
}
