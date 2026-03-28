import { Navigate } from 'react-router-dom'
import { AuthForm } from '../components/Auth/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Laden...</p>
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <AuthForm />
}
