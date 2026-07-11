import {
  buildProfileUpdatePayload,
  detectBrowserTimeZone,
  mapProfileRow,
  type ProfileUpdate,
  type UserProfile,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { ProfileUpdate, UserProfile }

const BASE_PROFILE_COLUMNS =
  'display_name, nutrition_goals, age, height_cm, weight_kg, time_zone'
/** Pre-wearable extended columns (gender + BMR override). */
const GENDER_BMR_COLUMNS = `${BASE_PROFILE_COLUMNS}, gender, bmr_override`
/** Full profile including fitness-tracker flag. */
const FULL_PROFILE_COLUMNS = `${GENDER_BMR_COLUMNS}, uses_wearable`

/** True only when the error is about a missing profiles column (not other tables). */
function isMissingProfileColumnError(message: string): boolean {
  const m = message.toLowerCase()
  if (/daily_device_totals|activities|food_entries/i.test(message)) return false
  return (
    /could not find the '?(gender|bmr_override|uses_wearable)'? column/i.test(message) ||
    /column ['"]?profiles?\.(gender|bmr_override|uses_wearable)/i.test(message) ||
    (/schema cache/i.test(m) &&
      /(gender|bmr_override|uses_wearable)/i.test(message) &&
      /column|profiles?/i.test(m))
  )
}

function isMissingUsesWearableError(message: string): boolean {
  return (
    /could not find the '?uses_wearable'? column/i.test(message) ||
    /column ['"]?profiles?\.uses_wearable/i.test(message) ||
    (/schema cache/i.test(message) && /uses_wearable/i.test(message))
  )
}

function readUsesWearableFlag(data: Record<string, unknown> | null | undefined): boolean | null {
  if (!data || !('uses_wearable' in data)) return null
  const raw = data.uses_wearable
  if (raw === true || raw === 'true' || raw === 1 || raw === '1' || raw === 't') return true
  if (raw === false || raw === 'false' || raw === 0 || raw === '0' || raw === 'f') return false
  return null
}

async function fetchProfileRow(
  userId: string,
  columns: string,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(columns)
    .eq('id', userId)
    .maybeSingle()

  if (error) return { data: null, error }
  return { data: data as Record<string, unknown> | null, error: null }
}

/** Load uses_wearable in its own request so a partial schema never invents false. */
async function fetchUsesWearableFlag(userId: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('uses_wearable')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingUsesWearableError(error.message)) return null
    // Non-schema errors still matter — surface as null and let caller use row default carefully
    console.warn('[profile] uses_wearable select failed:', error.message)
    return null
  }
  return readUsesWearableFlag(data as Record<string, unknown> | null)
}

async function loadProfileRow(userId: string): Promise<Record<string, unknown>> {
  const full = await fetchProfileRow(userId, FULL_PROFILE_COLUMNS)
  if (!full.error && full.data) {
    // Prefer explicit flag select if the combined row is missing the key for any reason
    if (!('uses_wearable' in full.data)) {
      const flag = await fetchUsesWearableFlag(userId)
      if (flag !== null) return { ...full.data, uses_wearable: flag }
    }
    return full.data
  }

  if (full.error && !isMissingProfileColumnError(full.error.message)) {
    throw new Error(full.error.message)
  }

  // Build row without uses_wearable, then attach the flag from a dedicated select.
  let baseRow: Record<string, unknown>
  const mid = await fetchProfileRow(userId, GENDER_BMR_COLUMNS)
  if (!mid.error && mid.data) {
    baseRow = mid.data
  } else {
    if (mid.error && !isMissingProfileColumnError(mid.error.message)) {
      throw new Error(mid.error.message)
    }
    const base = await fetchProfileRow(userId, BASE_PROFILE_COLUMNS)
    if (base.error) throw new Error(base.error.message)
    if (!base.data) throw new Error('Profile not found')
    baseRow = base.data
  }

  const flag = await fetchUsesWearableFlag(userId)
  return {
    ...baseRow,
    uses_wearable: flag === true,
  }
}

async function saveProfileRow(
  userId: string,
  update: ProfileUpdate,
  columns: string,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  const payload = buildProfileUpdatePayload(update)
  // Never include uses_wearable here when we're on a fallback column set — caller handles flag.
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(columns)
    .single()

  if (error) return { data: null, error }
  return { data: data as unknown as Record<string, unknown>, error: null }
}

/** Persist uses_wearable alone and verify the value read back. */
async function saveUsesWearableOnly(
  userId: string,
  usesWearable: boolean,
): Promise<{ ok: true; value: boolean } | { ok: false; error: string }> {
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ uses_wearable: usesWearable })
    .eq('id', userId)

  if (updateError) {
    return {
      ok: false,
      error: isMissingUsesWearableError(updateError.message)
        ? 'Fitness tracker setting could not be saved (database schema). Try again in a minute.'
        : updateError.message,
    }
  }

  // Verify with a fresh select (do not trust update returning empty under RLS edge cases)
  const verified = await fetchUsesWearableFlag(userId)
  if (verified === null) {
    return {
      ok: false,
      error:
        'Fitness tracker setting was written but could not be verified. Refresh and try again.',
    }
  }
  if (verified !== usesWearable) {
    return {
      ok: false,
      error: `Fitness tracker setting did not stick (expected ${usesWearable}, got ${verified}).`,
    }
  }
  return { ok: true, value: verified }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const row = await loadProfileRow(userId)
  const profile = mapProfileRow(row as Parameters<typeof mapProfileRow>[0])
  const browserTimeZone = detectBrowserTimeZone()
  if (profile.timeZone !== browserTimeZone) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ time_zone: browserTimeZone })
      .eq('id', userId)

    if (updateError && !isMissingProfileColumnError(updateError.message)) {
      throw new Error(updateError.message)
    }

    // Re-load full row so uses_wearable is never dropped after timezone patch
    const refreshed = await loadProfileRow(userId)
    return mapProfileRow({
      ...refreshed,
      time_zone: browserTimeZone,
    } as Parameters<typeof mapProfileRow>[0])
  }

  return profile
}

export async function saveProfileUpdate(
  userId: string,
  update: ProfileUpdate,
): Promise<UserProfile> {
  // Split the flag so core profile save cannot silently swallow it.
  const usesWearable = update.usesWearable
  const coreUpdate: ProfileUpdate = { ...update, usesWearable: undefined }

  let saved = await saveProfileRow(userId, { ...coreUpdate, usesWearable }, FULL_PROFILE_COLUMNS)

  if (saved.error && isMissingProfileColumnError(saved.error.message)) {
    const columns = isMissingUsesWearableError(saved.error.message)
      ? GENDER_BMR_COLUMNS
      : BASE_PROFILE_COLUMNS
    const legacyUpdate: ProfileUpdate =
      columns === BASE_PROFILE_COLUMNS
        ? { ...coreUpdate, gender: undefined, bmrOverride: undefined }
        : coreUpdate

    saved = await saveProfileRow(userId, legacyUpdate, columns)
    if (saved.error) throw new Error(saved.error.message)
    if (!saved.data) throw new Error('Profile not found')
  } else if (saved.error) {
    throw new Error(saved.error.message)
  }

  if (!saved.data) throw new Error('Profile not found')

  // Always write + verify the tracker flag when the form sent it (true or false).
  if (usesWearable !== undefined) {
    const wear = await saveUsesWearableOnly(userId, usesWearable)
    if (!wear.ok) throw new Error(wear.error)
    saved.data = { ...saved.data, uses_wearable: wear.value }
  }

  if (update.displayName !== undefined) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: update.displayName.trim() },
    })
    if (authError) throw new Error(authError.message)
  }

  // Final authoritative reload so refresh and in-app state match the database.
  const reloaded = await loadProfileRow(userId)
  return mapProfileRow(reloaded as Parameters<typeof mapProfileRow>[0])
}
