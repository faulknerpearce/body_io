import {
  buildProfileUpdatePayload,
  mapProfileRow,
  type ProfileUpdate,
  type UserProfile,
} from '@nutrition-tracker/shared'
import { supabase } from './supabase'

export type { ProfileUpdate, UserProfile }

const PROFILE_COLUMNS = 'display_name, nutrition_goals, age, height_cm, weight_kg'

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Profile not found')
  return mapProfileRow(data)
}

export async function saveProfileUpdate(
  userId: string,
  update: ProfileUpdate,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(buildProfileUpdatePayload(update))
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return mapProfileRow(data)
}