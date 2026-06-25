import { useEffect, useState } from 'react'
import type { WorkoutWithExercises } from '@nutrition-tracker/shared'
import { fetchWorkout } from '../lib/workouts'
import { iconTileMd, labelBase } from '../lib/styles'
import Modal from './Modal'

interface WorkoutViewModalProps {
  workoutId: string
  onClose: () => void
  mode?: 'owned' | 'shared'
  ownerDisplayName?: string
  savedCopyId?: string | null
  savingCopy?: boolean
  onShare?: (workout: WorkoutWithExercises) => void
  onSaveCopy?: () => void
}

export default function WorkoutViewModal({
  workoutId,
  onClose,
  mode = 'owned',
  ownerDisplayName,
  savedCopyId,
  savingCopy = false,
  onShare,
  onSaveCopy,
}: WorkoutViewModalProps) {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)

    fetchWorkout(workoutId)
      .then((data) => {
        setWorkout(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load workout')
        setLoading(false)
      })

    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId])

  return (
    <Modal titleId="workout-view-title" onClose={onClose} size="wide">
      {loading ? (
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Loading workout...</p>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : workout ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ ...iconTileMd, background: workout.iconBg }}>
              <i
                className={`fa-solid ${workout.icon}`}
                style={{ color: workout.iconColor, fontSize: 20 }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                id="workout-view-title"
                style={{
                  fontFamily: "'Space Grotesk','Inter',sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                }}
              >
                {workout.name}
              </h3>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>
                {mode === 'shared' && ownerDisplayName ? `Shared by ${ownerDisplayName} · ` : ''}
                {workout.exercises.length} exercises
                {workout.defaultDurationMinutes !== null && ` · ${workout.defaultDurationMinutes} min/set`}
                {workout.defaultCalories !== null && ` · ${workout.defaultCalories} kcal/set`}
              </p>
            </div>
          </div>

          {workout.description && (
            <p style={{ fontSize: 13, color: '#52525b', margin: '0 0 20px 0' }}>{workout.description}</p>
          )}

          <p style={{ ...labelBase, marginBottom: 10 }}>Exercises</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {workout.exercises.map((exercise) => (
              <div
                key={exercise.id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 8,
                  width: '100%',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: '#fafafa',
                    border: '1px solid #e4e4e7',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#18181b',
                  }}
                >
                  {exercise.name}
                </span>
                <span
                  style={{
                    flex: '0 0 96px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#065f46',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {exercise.targetReps} {exercise.targetReps === 1 ? 'rep' : 'reps'}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        {mode === 'owned' && workout && onShare && (
          <button
            type="button"
            onClick={() => onShare(workout)}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: '1px solid #e4e4e7',
              background: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#134e4b',
            }}
          >
            Share
          </button>
        )}
        {mode === 'shared' && onSaveCopy && (
          <button
            type="button"
            onClick={onSaveCopy}
            disabled={!!savedCopyId || savingCopy}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: savedCopyId ? '#e4e4e7' : '#134e4b',
              fontSize: 13,
              fontWeight: 500,
              cursor: savedCopyId ? 'default' : 'pointer',
              color: savedCopyId ? '#71717a' : 'white',
            }}
          >
            {savedCopyId ? 'Already saved' : savingCopy ? 'Saving...' : 'Save to my library'}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
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
          Close
        </button>
      </div>
    </Modal>
  )
}