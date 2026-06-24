import type { ActivityExercise } from './types.js'

export function mapActivityExerciseRow(row: {
  id: string
  workout_exercise_id: string | null
  sort_order: number
  name: string
  reps_completed: number
}): ActivityExercise {
  return {
    id: row.id,
    workoutExerciseId: row.workout_exercise_id,
    name: row.name,
    sortOrder: row.sort_order,
    repsCompleted: row.reps_completed,
  }
}