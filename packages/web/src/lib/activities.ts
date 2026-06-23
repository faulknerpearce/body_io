import {
  buildActivityInsertPayload,
  buildActivityUpdatePayload,
  mapActivityRow,
  offsetDateISO,
  parseActivityInput,
  sumActivityTotals,
  todayISO,
  type Activity,
  type ActivityTotals,
  type NewActivity,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { Activity, NewActivity }

export interface ActivityDaySummary {
  date: string
  activities: Activity[]
  totals: ActivityTotals
}

async function requireUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('Not signed in')
  return user.id
}

export async function fetchActivities(date: string = todayISO()): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('activity_date', date)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapActivityRow)
}

export async function fetchActivityDaySummaries(daysBack = 30): Promise<ActivityDaySummary[]> {
  const today = todayISO()
  const startDate = offsetDateISO(daysBack)

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('activity_date', startDate)
    .lte('activity_date', today)
    .order('activity_date', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)

  const byDate = new Map<string, Activity[]>()
  for (const row of data ?? []) {
    const date = row.activity_date
    const list = byDate.get(date) ?? []
    list.push(mapActivityRow(row))
    byDate.set(date, list)
  }

  if (!byDate.has(today)) {
    byDate.set(today, [])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, activities]) => ({
      date,
      activities,
      totals: sumActivityTotals(activities),
    }))
}

export async function addActivity(input: NewActivity): Promise<Activity> {
  const userId = await requireUserId()
  const parsed = parseActivityInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const activity = buildActivityInsertPayload(parsed.value, crypto.randomUUID(), userId, todayISO())
  const { data, error } = await supabase.from('activities').insert(activity).select().single()
  if (error) throw new Error(error.message)
  return mapActivityRow(data)
}

export async function updateActivity(id: string, input: NewActivity): Promise<Activity> {
  const parsed = parseActivityInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const { data, error } = await supabase
    .from('activities')
    .update(buildActivityUpdatePayload(parsed.value))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapActivityRow(data)
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
