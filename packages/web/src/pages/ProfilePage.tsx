import { useState } from 'react'
import type { ProfileUpdate, UserProfile } from '@nutrition-tracker/shared'
import GoalsFormFields from '../components/GoalsFormFields'
import { useProfile } from '../context/useProfile'
import { defaultGoalsForm, normalizeGoals } from '../lib/goalsForm'
import { cardSurface, inputBase, labelBase, pageTitle, sectionHeader } from '../lib/styles'

function optionalInt(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function optionalWeight(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : null
}

function profileFormKey(profile: UserProfile): string {
  return [
    profile.displayName,
    profile.age ?? '',
    profile.heightCm ?? '',
    profile.weightKg ?? '',
    JSON.stringify(profile.nutritionGoals),
  ].join('|')
}

interface ProfileFormProps {
  profile: UserProfile
  updateProfile: (update: ProfileUpdate) => Promise<{ error: string | null }>
}

function ProfileForm({ profile, updateProfile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [age, setAge] = useState(profile.age === null ? '' : String(profile.age))
  const [heightCm, setHeightCm] = useState(profile.heightCm === null ? '' : String(profile.heightCm))
  const [weightKg, setWeightKg] = useState(profile.weightKg === null ? '' : String(profile.weightKg))
  const [goalsForm, setGoalsForm] = useState(() => structuredClone(profile.nutritionGoals))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const resetGoalsDefaults = () => {
    setGoalsForm(defaultGoalsForm())
    setError(null)
    setSaved(false)
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updateProfile({
      displayName,
      age: optionalInt(age),
      heightCm: optionalInt(heightCm),
      weightKg: optionalWeight(weightKg),
      nutritionGoals: normalizeGoals(goalsForm),
    })

    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSaved(true)
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {saved && (
        <div
          role="status"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#ecfdf5',
            color: '#047857',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          Profile saved.
        </div>
      )}

      <section style={{ ...cardSurface, padding: 24, marginBottom: 24 }}>
        <h3
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Basic Information
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
          Optional details to keep your account up to date.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="profile-display-name" style={labelBase}>
              Display name
            </label>
            <input
              id="profile-display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How your name appears in the app"
              style={inputBase}
            />
          </div>

          <div className="modal-form-grid">
            <div>
              <label htmlFor="profile-age" style={labelBase}>
                Age
              </label>
              <input
                id="profile-age"
                type="number"
                min="13"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-height" style={labelBase}>
                Height (cm)
              </label>
              <input
                id="profile-height"
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
            <div>
              <label htmlFor="profile-weight" style={labelBase}>
                Weight (kg)
              </label>
              <input
                id="profile-weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Optional"
                style={inputBase}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...cardSurface, padding: 24, marginBottom: 24 }}>
        <h3
          style={{
            fontFamily: "'Space Grotesk','Inter',system-ui,sans-serif",
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          Daily Goals
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
          These targets power the dashboard and inputs panels. Calories and protein ranges also set
          the net energy goal band.
        </p>

        <GoalsFormFields form={goalsForm} onChange={setGoalsForm} idPrefix="profile-goal" />
      </section>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={resetGoalsDefaults}
          style={{
            padding: '10px 20px',
            borderRadius: 9999,
            border: '1px solid #e4e4e7',
            background: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            color: '#52525b',
          }}
        >
          Reset goal defaults
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          style={{
            padding: '10px 20px',
            borderRadius: 9999,
            border: 'none',
            background: saving ? '#6b7280' : '#134e4b',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </>
  )
}

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile()

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        Loading profile...
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={sectionHeader}>Account</p>
        <h2 className="page-title-mobile" style={pageTitle}>
          Profile
        </h2>
        <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
          Manage your basic information and daily nutrition targets.
        </p>
      </div>

      <ProfileForm
        key={profileFormKey(profile)}
        profile={profile}
        updateProfile={updateProfile}
      />
    </div>
  )
}