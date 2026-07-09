import { describe, expect, it } from 'vitest'
import {
  buildActivityExerciseInsertPayload,
  buildWorkoutExerciseInsertPayload,
  buildWorkoutExerciseSnapshot,
  buildWorkoutInsertPayload,
  resolveLogWorkoutMetrics,
  scaleWorkoutMetric,
  sumRepsCompleted,
  validateRepsCompleted,
  validateWorkoutInput,
  validateWorkoutSetsLogged,
  type WorkoutWithExercises,
} from '../workout.js'

describe('validateWorkoutInput', () => {
  it('requires a name and at least one exercise', () => {
    expect(validateWorkoutInput({ name: '', exercises: [] }).ok).toBe(false)
    expect(
      validateWorkoutInput({
        name: 'Push Day',
        exercises: [{ name: 'Bench Press', sortOrder: 0, targetReps: 10 }],
      }).ok,
    ).toBe(true)
  })

  it('rejects non-positive target reps', () => {
    const result = validateWorkoutInput({
      name: 'Push Day',
      exercises: [{ name: 'Bench Press', sortOrder: 0, targetReps: 0 }],
    })
    expect(result.ok).toBe(false)
  })
})

describe('workout totals', () => {
  it('sums completed reps', () => {
    expect(
      sumRepsCompleted([
        { repsCompleted: 10 },
        { repsCompleted: 25 },
      ]),
    ).toBe(35)
  })
})

describe('build payloads', () => {
  it('builds workout and exercise insert payloads', () => {
    const workout = buildWorkoutInsertPayload(
      {
        name: 'Push Day',
        exercises: [{ name: 'Bench Press', sortOrder: 0, targetReps: 10 }],
      },
      'user-1',
      'workout-1',
    )
    expect(workout.name).toBe('Push Day')
    expect(workout.icon).toBe('fa-dumbbell')

    const exercise = buildWorkoutExerciseInsertPayload(
      'workout-1',
      'user-1',
      { name: 'Bench Press', sortOrder: 0, targetReps: 10 },
      'exercise-1',
    )
    expect(exercise.target_reps).toBe(10)

    const logged = buildActivityExerciseInsertPayload(
      'activity-1',
      'user-1',
      {
        workoutExerciseId: 'exercise-1',
        name: 'Bench Press',
        sortOrder: 0,
        repsCompleted: 10,
      },
      'logged-1',
    )
    expect(logged.reps_completed).toBe(10)
  })
})

describe('buildWorkoutExerciseSnapshot', () => {
  const template: WorkoutWithExercises = {
    id: 'workout-1',
    name: 'Calisthenics',
    description: '',
    icon: 'fa-dumbbell',
    iconBg: '#f0f8f4',
    iconColor: '#134e4b',
    defaultDurationMinutes: 20,
    defaultCalories: 220,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    exercises: [
      { id: 'ex-1', name: 'Pull-ups', sortOrder: 0, targetReps: 10 },
      { id: 'ex-2', name: 'Push-ups', sortOrder: 1, targetReps: 25 },
    ],
  }

  it('snapshots template exercises without overrides', () => {
    const snapshot = buildWorkoutExerciseSnapshot(template)
    expect(snapshot).toEqual([
      {
        workoutExerciseId: 'ex-1',
        name: 'Pull-ups',
        sortOrder: 0,
        repsCompleted: 10,
      },
      {
        workoutExerciseId: 'ex-2',
        name: 'Push-ups',
        sortOrder: 1,
        repsCompleted: 25,
      },
    ])
  })
})

describe('validateWorkoutSetsLogged', () => {
  it('defaults to 1 and rejects invalid values', () => {
    expect(validateWorkoutSetsLogged(undefined)).toBe(1)
    expect(validateWorkoutSetsLogged(3)).toBe(3)
    expect(() => validateWorkoutSetsLogged(0)).toThrow()
  })
})

describe('validateRepsCompleted', () => {
  it('rejects invalid values', () => {
    expect(() => validateRepsCompleted(0)).toThrow()
    expect(validateRepsCompleted(10)).toBe(10)
  })
})

describe('resolveLogWorkoutMetrics', () => {
  const template = {
    defaultDurationMinutes: 20,
    defaultCalories: 150,
  }

  it('scales template metrics by sets logged', () => {
    expect(scaleWorkoutMetric(20, 3)).toBe(60)
    expect(resolveLogWorkoutMetrics(template, 3)).toEqual({
      durationMinutes: 60,
      calories: 450,
    })
  })

  it('allows overrides when logging', () => {
    expect(
      resolveLogWorkoutMetrics(template, 3, {
        durationMinutes: 50,
        calories: 400,
      }),
    ).toEqual({
      durationMinutes: 50,
      calories: 400,
    })
  })
})