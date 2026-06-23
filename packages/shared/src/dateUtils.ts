export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Returns an ISO date string `days` before `from` (local calendar). */
export function offsetDateISO(days: number, from: Date = new Date()): string {
  const date = new Date(from)
  date.setDate(date.getDate() - days)
  return todayISO(date)
}

export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const today = todayISO(now)
  const yesterday = offsetDateISO(1, now)
  if (iso === today) return 'Today'
  if (iso === yesterday) return 'Yesterday'
  return parseISODate(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}
