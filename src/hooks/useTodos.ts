import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useToast } from './useToast'
import type { Todo } from '../types/todo'

const CACHE_KEY = 'todos_cache'

function loadCache(userId: string): Todo[] {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCache(userId: string, todos: Todo[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(todos))
  } catch { /* quota exceeded — ignore */ }
}

export function useTodos(userId: string) {
  const [todos, setTodos] = useState<Todo[]>(() => loadCache(userId))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    saveCache(userId, todos)
  }, [userId, todos])

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[fetchTodos]', error)
        setError('Todos konnten nicht geladen werden.')
        showToast('Fehler beim Laden der Todos', 'error')
      } else {
        setTodos(data as Todo[])
      }
      setLoading(false)
    }

    fetchTodos()

    const channel = supabase
      .channel('todos-changes')
      .on<Todo>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [payload.new as Todo, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setTodos((prev) =>
              prev.map((t) => (t.id === (payload.new as Todo).id ? (payload.new as Todo) : t))
            )
          }
          if (payload.eventType === 'DELETE') {
            setTodos((prev) =>
              prev.filter((t) => t.id !== (payload.old as { id: string }).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, showToast])

  const addTodo = useCallback(async (title: string, description: string, priority: 1 | 2 | 3, dueDate: string | null = null) => {
    if (!title || title.length > 255) {
      showToast('Titel muss zwischen 1 und 255 Zeichen lang sein.', 'error')
      return
    }
    if (description.length > 1000) {
      showToast('Beschreibung darf maximal 1000 Zeichen lang sein.', 'error')
      return
    }
    if (![1, 2, 3].includes(priority)) {
      showToast('Ungültige Priorität.', 'error')
      return
    }
    if (dueDate && isNaN(Date.parse(dueDate))) {
      showToast('Ungültiges Datum.', 'error')
      return
    }
    const { error } = await supabase.from('todos').insert({
      title,
      description,
      priority,
      due_date: dueDate,
      user_id: userId,
    })
    if (error) {
      console.error('[addTodo]', error)
      showToast('Fehler beim Erstellen. Bitte versuche es erneut.', 'error')
    } else {
      showToast('Todo erstellt!')
    }
  }, [userId, showToast])

  const updateTodo = useCallback(async (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'priority' | 'is_complete' | 'due_date'>>) => {
    if (updates.title !== undefined && (!updates.title || updates.title.length > 255)) {
      showToast('Titel muss zwischen 1 und 255 Zeichen lang sein.', 'error')
      return
    }
    if (updates.description !== undefined && updates.description.length > 1000) {
      showToast('Beschreibung darf maximal 1000 Zeichen lang sein.', 'error')
      return
    }
    if (updates.priority !== undefined && ![1, 2, 3].includes(updates.priority)) {
      showToast('Ungültige Priorität.', 'error')
      return
    }
    if (updates.due_date && isNaN(Date.parse(updates.due_date))) {
      showToast('Ungültiges Datum.', 'error')
      return
    }
    const { error } = await supabase.from('todos').update(updates).eq('id', id)
    if (error) {
      console.error('[updateTodo]', error)
      showToast('Fehler beim Aktualisieren. Bitte versuche es erneut.', 'error')
    } else {
      showToast('Todo aktualisiert!')
    }
  }, [showToast])

  const deleteTodo = useCallback(async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      console.error('[deleteTodo]', error)
      showToast('Fehler beim Löschen. Bitte versuche es erneut.', 'error')
    } else {
      showToast('Todo gelöscht!')
    }
  }, [showToast])

  const toggleComplete = useCallback(async (id: string, currentValue: boolean) => {
    const { error } = await supabase.from('todos').update({ is_complete: !currentValue }).eq('id', id)
    if (error) {
      console.error('[toggleComplete]', error)
      showToast('Fehler beim Aktualisieren. Bitte versuche es erneut.', 'error')
    } else {
      showToast(currentValue ? 'Todo wieder offen' : 'Todo erledigt!')
    }
  }, [showToast])

  return { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleComplete }
}
