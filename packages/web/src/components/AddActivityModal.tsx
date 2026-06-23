import { useEffect, useRef, useState } from 'react'
import { validateActivity, type Activity, type NewActivity } from '@nutrition-tracker/shared'

const ACTIVITY_TYPES = ['Run', 'Ride', 'Swim', 'Walk', 'Hike', 'Workout', 'Other'] as const

interface AddActivityModalProps {
  activity?: Activity
  onAdd: (activity: NewActivity) => Promise<void>
  onClose: () => void
}

interface FormState {
  name: string
  activityType: string
  durationMinutes: string
  distanceKm: string
  averageHeartrate: string
  maxHeartrate: string
  calories: string
}

const EMPTY_FORM: FormState = {
  name: '',
  activityType: ACTIVITY_TYPES[0],
  durationMinutes: '',
  distanceKm: '',
  averageHeartrate: '',
  maxHeartrate: '',
  calories: '',
}

function formFromActivity(activity: Activity): FormState {
  return {
    name: activity.name,
    activityType: activity.activityType,
    durationMinutes: String(Math.round(activity.movingTimeSeconds / 60)),
    distanceKm:
      activity.distanceMeters !== null ? String(activity.distanceMeters / 1000) : '',
    averageHeartrate:
      activity.averageHeartrate !== null ? String(activity.averageHeartrate) : '',
    maxHeartrate: activity.maxHeartrate !== null ? String(activity.maxHeartrate) : '',
    calories: activity.calories !== null ? String(activity.calories) : '',
  }
}

function parseOptionalInt(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseOptionalFloat(value: string): number | null {
  if (value.trim() === '') return null
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default function AddActivityModal({ activity, onAdd, onClose }: AddActivityModalProps) {
  const isEdit = activity !== undefined
  const [form, setForm] = useState<FormState>(() =>
    activity ? formFromActivity(activity) : EMPTY_FORM,
  )
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    nameRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
  }, [])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const close = () => {
    setForm(activity ? formFromActivity(activity) : EMPTY_FORM)
    setError(null)
    onClose()
  }

  const submit = async () => {
    const durationMinutes = form.durationMinutes === '' ? NaN : parseInt(form.durationMinutes, 10)
    const distanceKm = parseOptionalFloat(form.distanceKm)
    const averageHeartrate = parseOptionalInt(form.averageHeartrate)
    const maxHeartrate = parseOptionalInt(form.maxHeartrate)
    const calories = parseOptionalInt(form.calories)

    const validated = validateActivity({
      name: form.name,
      activityType: form.activityType,
      movingTimeSeconds: Number.isFinite(durationMinutes) ? durationMinutes * 60 : NaN,
      distanceMeters: distanceKm !== null ? Math.round(distanceKm * 1000) : null,
      averageHeartrate,
      maxHeartrate,
      calories,
    })
    if (!validated.ok) {
      setError(validated.error)
      return
    }

    setAdding(true)
    setError(null)
    try {
      await onAdd({
        name: validated.value.name,
        activityType: validated.value.activityType,
        movingTimeSeconds: validated.value.movingTimeSeconds,
        distanceMeters: validated.value.distanceMeters,
        averageHeartrate: validated.value.averageHeartrate,
        maxHeartrate: validated.value.maxHeartrate,
        calories: validated.value.calories,
      })
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'add'} activity`)
    } finally {
      setAdding(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e4e4e7',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: '#52525b',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-form-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={close}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          padding: 32,
          width: '90%',
          maxWidth: 480,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="activity-form-title"
          style={{
            fontFamily: "'Space Grotesk','Inter',sans-serif",
            fontSize: 22,
            fontWeight: 600,
            margin: '0 0 4px 0',
          }}
        >
          {isEdit ? 'Edit Activity' : 'Log Activity'}
        </h3>
        <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
          {isEdit
            ? 'Update this activity output.'
            : "Record a workout or activity for today's outputs."}
        </p>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 12,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="activity-name" style={labelStyle}>
            Name
          </label>
          <input
            id="activity-name"
            ref={nameRef}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Morning Run"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="activity-type" style={labelStyle}>
            Activity Type
          </label>
          <select
            id="activity-type"
            value={form.activityType}
            onChange={(e) => update('activityType', e.target.value)}
            style={inputStyle}
          >
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label htmlFor="activity-duration" style={labelStyle}>
              Duration (min)
            </label>
            <input
              id="activity-duration"
              type="number"
              min="1"
              value={form.durationMinutes}
              onChange={(e) => update('durationMinutes', e.target.value)}
              placeholder="45"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="activity-distance" style={labelStyle}>
              Distance (km)
            </label>
            <input
              id="activity-distance"
              type="number"
              min="0"
              step="0.1"
              value={form.distanceKm}
              onChange={(e) => update('distanceKm', e.target.value)}
              placeholder="Optional"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="activity-avg-hr" style={labelStyle}>
              Avg Heart Rate
            </label>
            <input
              id="activity-avg-hr"
              type="number"
              min="1"
              value={form.averageHeartrate}
              onChange={(e) => update('averageHeartrate', e.target.value)}
              placeholder="Optional"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="activity-max-hr" style={labelStyle}>
              Max Heart Rate
            </label>
            <input
              id="activity-max-hr"
              type="number"
              min="1"
              value={form.maxHeartrate}
              onChange={(e) => update('maxHeartrate', e.target.value)}
              placeholder="Optional"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label htmlFor="activity-calories" style={labelStyle}>
            Calories Burned
          </label>
          <input
            id="activity-calories"
            type="number"
            min="0"
            value={form.calories}
            onChange={(e) => update('calories', e.target.value)}
            placeholder="Optional"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={close}
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
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={adding}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: adding ? '#6b7280' : '#134e4b',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {adding
              ? isEdit
                ? 'Saving...'
                : 'Logging...'
              : isEdit
                ? 'Save Changes'
                : 'Log Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}