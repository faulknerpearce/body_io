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

function isMissingProfileColumnError(message: string): boolean {
  return (
    /could not find the '?(gender|bmr_override|uses_wearable)'? column/i.test(message) ||
    /column profiles\.(gender|bmr_override|uses_wearable) does not exist/i.test(message) ||
    /schema cache/i.test(message)
  )
}

function isMissingUsesWearableError(message: string): boolean {
  return (
    /could not find the '?uses_wearable'? column/i.test(message) ||
    /column profiles\.uses_wearable does not exist/i.test(message) ||
    (/schema cache/i.test(message) && /uses_wearable/i.test(message))
  )
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

async function loadProfileRow(userId: string): Promise<Record<string, unknown>> {
  const full = await fetchProfileRow(userId, FULL_PROFILE_COLUMNS)
  if (!full.error && full.data) return full.data

  if (full.error && !isMissingProfileColumnError(full.error.message)) {
    throw new Error(full.error.message)
  }

  // Schema cache may lag after migration — try without uses_wearable.
  const mid = await fetchProfileRow(userId, GENDER_BMR_COLUMNS)
  if (!mid.error && mid.data) {
    return { ...mid.data, uses_wearable: false }
  }

  if (mid.error && !isMissingProfileColumnError(mid.error.message)) {
    throw new Error(mid.error.message)
  }

  const base = await fetchProfileRow(userId, BASE_PROFILE_COLUMNS)
  if (base.error) throw new Error(base.error.message)
  if (!base.data) throw new Error('Profile not found')
  return { ...base.data, uses_wearable: false }
}

async function saveProfileRow(
  userId: string,
  update: ProfileUpdate,
  columns: string,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  const payload = buildProfileUpdatePayload(update)
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(columns)
    .single()

  if (error) return { data: null, error }
  return { data: data as unknown as Record<string, unknown>, error: null }
}

/** Persist uses_wearable alone (after core profile save if full update fails schema cache). */
async function saveUsesWearableOnly(
  userId: string,
  usesWearable: boolean,
): Promise<{ ok: true; value: boolean } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ uses_wearable: usesWearable })
    .eq('id', userId)
    .select('uses_wearable')
    .single()

  if (error) {
    return {
      ok: false,
      error: isMissingUsesWearableError(error.message)
        ? 'Fitness tracker setting could not be saved yet (database schema still updating). Wait a minute and try again.'
        : error.message,
    }
  }
  return { ok: true, value: data.uses_wearable === true }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const row = await loadProfileRow(userId)
  const profile = mapProfileRow(row as Parameters<typeof mapProfileRow>[0])
  const browserTimeZone = detectBrowserTimeZone()
  if (profile.timeZone !== browserTimeZone) {
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ time_zone: browserTimeZone })
      .eq('id', userId)
      .select(FULL_PROFILE_COLUMNS)
      .single()

    if (updateError) {
      // Timezone-only update may fail select on missing columns; still apply local TZ.
      if (isMissingProfileColumnError(updateError.message)) {
        await supabase.from('profiles').update({ time_zone: browserTimeZone }).eq('id', userId)
        return mapProfileRow({
          ...row,
          time_zone: browserTimeZone,
        } as Parameters<typeof mapProfileRow>[0])
      }
      throw new Error(updateError.message)
    }

    return mapProfileRow({
      ...row,
      ...(updated as Record<string, unknown>),
      time_zone: browserTimeZone,
    } as Parameters<typeof mapProfileRow>[0])
  }

  return profile
}

export async function saveProfileUpdate(
  userId: string,
  update: ProfileUpdate,
): Promise<UserProfile> {
  let saved = await saveProfileRow(userId, update, FULL_PROFILE_COLUMNS)

  if (saved.error && isMissingProfileColumnError(saved.error.message)) {
    // Save core fields without uses_wearable if schema cache is stale.
    const withoutWearable: ProfileUpdate = { ...update, usesWearable: undefined }
    const columns = isMissingUsesWearableError(saved.error.message)
      ? GENDER_BMR_COLUMNS
      : BASE_PROFILE_COLUMNS
    const legacyUpdate: ProfileUpdate =
      columns === BASE_PROFILE_COLUMNS
        ? { ...withoutWearable, gender: undefined, bmrOverride: undefined }
        : withoutWearable

    saved = await saveProfileRow(userId, legacyUpdate, columns)
    if (saved.error) throw new Error(saved.error.message)
    if (!saved.data) throw new Error('Profile not found')

    // Always try to persist the tracker flag separately when requested.
    if (update.usesWearable !== undefined) {
      const wear = await saveUsesWearableOnly(userId, update.usesWearable)
      if (!wear.ok) throw new Error(wear.error)
      saved.data = { ...saved.data, uses_wearable: wear.value }
    } else {
      // Re-read flag if present
      const flag = await fetchProfileRow(userId, 'uses_wearable')
      if (!flag.error && flag.data && 'uses_wearable' in flag.data) {
        saved.data = { ...saved.data, uses_wearable: flag.data.uses_wearable }
      }
    }
  }

  if (saved.error) throw new Error(saved.error.message)
  if (!saved.data) throw new Error('Profile not found')

  if (update.displayName !== undefined) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: update.displayName.trim() },
    })
    if (authError) throw new Error(authError.message)
  }

  // Trust the row returned from the database — do not invent usesWearable from the form.
  return mapProfileRow(saved.data as Parameters<typeof mapProfileRow>[0])
}
