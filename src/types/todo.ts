export interface Todo {
  id: string
  user_id: string
  title: string
  description: string
  is_complete: boolean
  priority: 1 | 2 | 3
  due_date: string | null
  created_at: string
}
