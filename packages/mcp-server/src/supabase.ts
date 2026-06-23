import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@nutrition-tracker/shared'

export type NutritionSupabase = SupabaseClient<Database>

export function createAuthenticatedSupabase(
  url: string,
  anonKey: string,
  accessToken: string,
): NutritionSupabase {
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}