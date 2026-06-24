import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_WORKOUT_ICON,
  DEFAULT_WORKOUT_ICON_BG,
  DEFAULT_WORKOUT_ICON_COLOR,

  type NewWorkoutExercise,
  type WorkoutInput,
  type WorkoutWithExercises,
} from '@nutrition-tracker/shared'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

interface WorkoutEditorModalProps {
  workout?: WorkoutWithExercises
  onSave: (input: WorkoutInput) => Promise<void>
  onClose: () => void
}

interface ExerciseForm {
  name: string
  targetReps: string
}

const EMPTY_EXERCISE: ExerciseForm = {
  name: '',
  targetReps: '10',
}

function exerciseFormFromWorkout(workout: WorkoutWithExercises): ExerciseForm[] {
  return workout.exercises.map((exercise) => ({
    name: exercise.name,
    targetReps: String(exercise.targetReps),
  }))
}

function parseExercise(form: ExerciseForm, sortOrder: number): NewWorkoutExercise | null {
  const targetReps = form.targetReps === '' ? NaN : parseInt(form.targetReps, 10)
  if (!form.name.trim() || !Number.isFinite(targetReps) || targetReps <= 0) return null

  return {
    name: form.name.trim(),
    sortOrder,
    targetReps,
  }
}

export default function WorkoutEditorModal({ workout, onSave, onClose }: WorkoutEditorModalProps) {
  const isEdit = workout !== undefined
  const [name, setName] = useState(workout?.name ?? '')
  const [description, setDescription] = useState(workout?.description ?? '')
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(
    workout?.defaultDurationMinutes != null ? String(workout.defaultDurationMinutes) : '',
  )
  const [defaultCalories, setDefaultCalories] = useState(
    workout?.defaultCalories != null ? String(workout.defaultCalories) : '',
  )
  const [exercises, setExercises] = useState<ExerciseForm[]>(() =>
    workout ? exerciseFormFromWorkout(workout) : [{ ...EMPTY_EXERCISE }],
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const previewExercises = exercises
    .map((form, index) => parseExercise(form, index))
    .filter((exercise): exercise is NewWorkoutExercise => exercise !== null)

  const updateExercise = (index: number, patch: Partial<ExerciseForm>) => {
    setExercises((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    )
  }

  const addExerciseRow = () => {
    setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }])
  }

  const removeExerciseRow = (index: number) => {
    setExercises((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  const submit = async () => {
    const parsedExercises = exercises
      .map((form, index) => parseExercise(form, index))
      .filter((exercise): exercise is NewWorkoutExercise => exercise !== null)

    if (parsedExercises.length === 0) {
      setError('Add at least one exercise with a name and target sets')
      return
    }

    const durationValue =
      defaultDurationMinutes.trim() === '' ? null : Number.parseInt(defaultDurationMinutes, 10)
    if (durationValue !== null && (!Number.isFinite(durationValue) || durationValue < 0)) {
      setError('Duration must be a non-negative integer')
      return
    }

    const caloriesValue =
      defaultCalories.trim() === '' ? null : Number.parseInt(defaultCalories, 10)
    if (caloriesValue !== null && (!Number.isFinite(caloriesValue) || caloriesValue < 0)) {
      setError('Calories must be a non-negative integer')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave({
        name,
        description,
        icon: workout?.icon ?? DEFAULT_WORKOUT_ICON,
        iconBg: workout?.iconBg ?? DEFAULT_WORKOUT_ICON_BG,
        iconColor: workout?.iconColor ?? DEFAULT_WORKOUT_ICON_COLOR,
        defaultDurationMinutes: durationValue,
        defaultCalories: caloriesValue,
        exercises: parsedExercises,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal titleId="workout-editor-title" onClose={onClose}>
      <h3
        id="workout-editor-title"
        style={{
          fontFamily: "'Space Grotesk','Inter',sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: '0 0 4px 0',
        }}
      >
        {isEdit ? 'Edit Workout' : 'New Workout'}
      </h3>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
        Build a reusable strength routine. Target sets pre-fill when you log the workout.
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
        <label htmlFor="workout-name" style={labelBase}>
          Workout name
        </label>
        <input
          id="workout-name"
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
          style={inputBase}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="workout-description" style={labelBase}>
          Description
        </label>
        <input
          id="workout-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes"
          style={inputBase}
        />
      </div>

      <div className="modal-form-grid" style={{ marginBottom: 20 }}>
        <div>
          <label htmlFor="workout-default-duration" style={labelBase}>
            Duration per set (minutes)
          </label>
          <input
            id="workout-default-duration"
            type="number"
            min="0"
            step="1"
            value={defaultDurationMinutes}
            onChange={(e) => setDefaultDurationMinutes(e.target.value)}
            placeholder="Optional"
            style={inputBase}
          />
        </div>
        <div>
          <label htmlFor="workout-default-calories" style={labelBase}>
            Calories per set
          </label>
          <input
            id="workout-default-calories"
            type="number"
            min="0"
            step="1"
            value={defaultCalories}
            onChange={(e) => setDefaultCalories(e.target.value)}
            placeholder="Optional"
            style={inputBase}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', margin: 0 }}>Exercises</p>
        <button
          type="button"
          onClick={addExerciseRow}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#134e4b',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Add exercise
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {exercises.map((row, index) => (
          <div
            key={index}
            style={{
              padding: 16,
              borderRadius: 16,
              border: '1px solid #f4f4f5',
              background: '#fafafa',
            }}
          >
            <div className="modal-form-grid">
              <div>
                <label style={labelBase}>Exercise</label>
                <input
                  value={row.name}
                  onChange={(e) => updateExercise(index, { name: e.target.value })}
                  placeholder="Bench Press"
                  style={inputBase}
                />
              </div>
              <div>
                <label style={labelBase}>Target reps</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={row.targetReps}
                  onChange={(e) => updateExercise(index, { targetReps: e.target.value })}
                  style={inputBase}
                />
              </div>
            </div>
            {exercises.length > 1 && (
              <button
                type="button"
                onClick={() => removeExerciseRow(index)}
                style={{
                  marginTop: 12,
                  border: 'none',
                  background: 'transparent',
                  color: '#b91c1c',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Remove exercise
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginBottom: 24,
          padding: 16,
          borderRadius: 16,
          background: '#ecfdf5',
          color: '#065f46',
          fontSize: 13,
        }}
      >
        {previewExercises.length} {previewExercises.length === 1 ? 'exercise' : 'exercises'}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
          Cancel
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
          {saving ? 'Saving...' : isEdit ? 'Save Workout' : 'Create Workout'}
        </button>
      </div>
    </Modal>
  )
}