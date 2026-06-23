import type { ValidationResult } from './validation.js'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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

export function parseLogDate(
  value: unknown,
  options?: { fallback?: string; allowFuture?: boolean; now?: Date },
): ValidationResult<string> {
  const fallback = options?.fallback
  const raw =
    typeof value === 'string' && value.trim() !== ''
      ? value.trim()
      : typeof fallback === 'string'
        ? fallback
        : undefined

  if (!raw) {
    return { ok: false, error: 'date is required (YYYY-MM-DD)' }
  }
  if (!ISO_DATE_RE.test(raw)) {
    return { ok: false, error: 'date must be YYYY-MM-DD' }
  }

  const [y, m, d] = raw.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
    return { ok: false, error: 'date is not a valid calendar day' }
  }

  if (!options?.allowFuture) {
    const today = todayISO(options?.now)
    if (raw > today) {
      return { ok: false, error: 'date cannot be in the future' }
    }
  }

  return { ok: true, value: raw }
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
