import {
  mapRow,
  sumTotals,
  calGoal,
  proGoal,
  carbGoal,
  caffeineGoal,
  goals,
  todayISO,
  offsetDateISO,
  buildInsertPayload,
  buildUpdatePayload,
  parseEntryInput,
  type FoodEntry,
  type NewFoodEntry,
  type Totals,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export { sumTotals, calGoal, proGoal, carbGoal, caffeineGoal, goals, todayISO, offsetDateISO }
export type { FoodEntry, NewFoodEntry }

export interface DaySummary {
  date: string
  entries: FoodEntry[]
  totals: Totals
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

export async function fetchEntries(date: string = todayISO()): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('entry_date', date)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function fetchPriorDaySummaries(daysBack = 30): Promise<DaySummary[]> {
  const today = todayISO()
  const startDate = offsetDateISO(daysBack)

  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .gte('entry_date', startDate)
    .lt('entry_date', today)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)

  const byDate = new Map<string, FoodEntry[]>()
  for (const row of data ?? []) {
    const date = row.entry_date
    const list = byDate.get(date) ?? []
    list.push(mapRow(row))
    byDate.set(date, list)
  }

  return [...byDate.entries()].map(([date, entries]) => ({
    date,
    entries,
    totals: sumTotals(entries),
  }))
}

export async function addEntry(input: NewFoodEntry): Promise<FoodEntry> {
  const userId = await requireUserId()
  const parsed = parseEntryInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const entry = {
    ...buildInsertPayload(parsed.value, crypto.randomUUID(), userId),
    entry_date: todayISO(),
  }
  const { data, error } = await supabase.from('food_entries').insert(entry).select().single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateEntry(id: string, input: NewFoodEntry): Promise<FoodEntry> {
  const parsed = parseEntryInput(input as Record<string, unknown>)
  if (!parsed.ok) throw new Error(parsed.error)

  const { data, error } = await supabase
    .from('food_entries')
    .update(buildUpdatePayload(parsed.value))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}