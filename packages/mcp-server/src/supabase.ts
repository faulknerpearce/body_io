import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@body-io/shared'

export type BodyIOSupabase = SupabaseClient<Database>

export function createAuthenticatedSupabase(
  url: string,
  anonKey: string,
  accessToken: string,
): BodyIOSupabase {
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}