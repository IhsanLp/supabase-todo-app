# Supabase Todo App

Eine moderne Todo-App mit React, Supabase und Tailwind CSS.

**Live:** [supabase-todo-app-ihsan.vercel.app](https://supabase-todo-app-ihsan.vercel.app)

## Features

- **Authentifizierung** — Login & Registrierung über Supabase Auth
- **CRUD** — Todos erstellen, bearbeiten, löschen und abhaken
- **Echtzeit-Updates** — Änderungen erscheinen live in allen Tabs (Supabase Realtime)
- **Dark Mode** — Toggle mit Speicherung im localStorage
- **Prioritäten** — Hoch / Mittel / Niedrig mit farbigen Badges, sortiert nach Wichtigkeit
- **Fälligkeitsdatum** — Date Picker mit Überfällig- und Bald-fällig-Warnungen
- **Prioritäts-Erinnerung** — Vorschlag zur Erhöhung wenn ein Todo zu lange offen ist
- **Toast-Benachrichtigungen** — Erfolgsmeldungen bei jeder Aktion
- **Offline-Cache** — localStorage Fallback bei Verbindungsproblemen

## Tech-Stack

- [React](https://react.dev) + TypeScript
- [Vite](https://vite.dev) als Build Tool
- [Supabase](https://supabase.com) (Auth, PostgreSQL, Realtime)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev
```

`.env` Datei im Root erstellen:

```
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

## Supabase Setup

Dieses SQL im Supabase SQL Editor ausführen:

```sql
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  is_complete boolean default false,
  priority smallint default 2 check (priority between 1 and 3),
  due_date date default null,
  created_at timestamptz default now() not null
);

create index idx_todos_user_id on public.todos(user_id);
alter table public.todos enable row level security;

create policy "Users can view own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Users can insert own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos" on public.todos for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.todos;
```

## Deployment

Gehostet auf [Vercel](https://vercel.com). Bei jedem Push auf `main` wird automatisch neu deployed.

Environment Variables in Vercel setzen:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
