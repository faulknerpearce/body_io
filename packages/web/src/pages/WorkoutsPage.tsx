import { useEffect, useMemo, useState } from 'react'
import type { WorkoutSummary, WorkoutWithExercises } from '@nutrition-tracker/shared'
import LogWorkoutModal from '../components/LogWorkoutModal'
import WorkoutEditorModal from '../components/WorkoutEditorModal'
import WorkoutViewModal from '../components/WorkoutViewModal'
import {
  filterAndSortWorkouts,
  WORKOUT_SORT_OPTIONS,
  type WorkoutSortOption,
} from '../lib/workoutFilters'
import {
  deleteWorkout,
  fetchWorkout,
  fetchWorkoutSummaries,
  logWorkout,
  saveWorkout,
} from '../lib/workouts'
import { cardSurface, iconTileMd, inputBase, pageTitle, sectionHeader } from '../lib/styles'

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingWorkout, setEditingWorkout] = useState<WorkoutWithExercises | null | undefined>(
    undefined,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loggingWorkout, setLoggingWorkout] = useState<WorkoutSummary | null>(null)
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null)
  const [logSuccess, setLogSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<WorkoutSortOption>('name-asc')

  const visibleWorkouts = useMemo(
    () => filterAndSortWorkouts(workouts, searchQuery, sortBy),
    [workouts, searchQuery, sortBy],
  )
  const hasActiveFilters = searchQuery.trim() !== '' || sortBy !== 'name-asc'

  const loadWorkouts = async () => {
    const data = await fetchWorkoutSummaries()
    setWorkouts(data)
  }

  useEffect(() => {
    fetchWorkoutSummaries()
      .then((data) => {
        setWorkouts(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load workouts')
        setLoading(false)
      })
  }, [])

  const openCreate = () => setEditingWorkout(null)

  const openEdit = async (id: string) => {
    try {
      setEditingWorkout(await fetchWorkout(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workout')
    }
  }

  const handleLogWorkout = async (options: {
    setsLogged: number
    durationMinutes?: number
    calories?: number | null
  }) => {
    if (!loggingWorkout) return
    await logWorkout({
      workoutId: loggingWorkout.id,
      setsLogged: options.setsLogged,
      durationMinutes: options.durationMinutes,
      calories: options.calories,
    })
    setLogSuccess(`Added ${loggingWorkout.name} to today's activity log.`)
    setLoggingWorkout(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      await deleteWorkout(id)
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        style={{ textAlign: 'center', padding: '80px 20px', color: '#a1a1aa' }}
      >
        <i
          className="fa-solid fa-spinner fa-spin"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        Loading workouts...
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p style={sectionHeader}>Templates</p>
          <h2 className="page-title-mobile" style={pageTitle}>
            Workouts
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
            Save strength routines with exercises, then quick-log them from Outputs.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          style={{
            padding: '10px 20px',
            borderRadius: 9999,
            border: 'none',
            background: '#134e4b',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          New Workout
        </button>
      </div>

      {logSuccess && (
        <div
          role="status"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {logSuccess}
        </div>
      )}

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

      {workouts.length > 0 && (
        <div
          style={{
            ...cardSurface,
            padding: 20,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(180px, 220px)',
              gap: 12,
              alignItems: 'end',
            }}
            className="recipe-toolbar"
          >
            <div>
              <label
                htmlFor="workout-search"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#52525b',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Search workouts
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a1a1aa',
                    fontSize: 13,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="workout-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  style={{ ...inputBase, paddingLeft: 38 }}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="workout-sort"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#52525b',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Sort by
              </label>
              <select
                id="workout-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as WorkoutSortOption)}
                style={{ ...inputBase, paddingRight: 12 }}
              >
                {WORKOUT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              fontSize: 12,
              color: '#71717a',
            }}
          >
            <span>
              Showing {visibleWorkouts.length} of {workouts.length}{' '}
              {workouts.length === 1 ? 'workout' : 'workouts'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSortBy('name-asc')
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 9999,
                  border: '1px solid #e4e4e7',
                  background: 'white',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: '#52525b',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {workouts.length === 0 ? (
        <div style={{ ...cardSurface, padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: 0 }}>No workouts yet. Create one to speed up logging.</p>
        </div>
      ) : visibleWorkouts.length === 0 ? (
        <div style={{ ...cardSurface, padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#52525b' }}>
            No matching workouts
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            Try a different search term or{' '}
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#134e4b',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              clear your search
            </button>
            .
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleWorkouts.map((workout) => (
            <div
              key={workout.id}
              style={{
                ...cardSurface,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ ...iconTileMd, background: workout.iconBg }}>
                  <i
                    className={`fa-solid ${workout.icon}`}
                    style={{ color: workout.iconColor, fontSize: 18 }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#18181b' }}>{workout.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>
                    {workout.exerciseCount} exercises
                    {workout.defaultDurationMinutes !== null &&
                      ` · ${workout.defaultDurationMinutes} min/set`}
                    {workout.defaultCalories !== null && ` · ${workout.defaultCalories} kcal/set`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLogSuccess(null)
                    setLoggingWorkout(workout)
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: 'none',
                    background: '#134e4b',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Add to Log
                </button>
                <button
                  type="button"
                  onClick={() => setViewingWorkoutId(workout.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #e4e4e7',
                    background: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(workout.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #e4e4e7',
                    background: 'white',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(workout.id)}
                  disabled={deletingId === workout.id}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid #fecaca',
                    background: '#fff1f2',
                    color: '#b91c1c',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {deletingId === workout.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingWorkout !== undefined && (
        <WorkoutEditorModal
          workout={editingWorkout ?? undefined}
          onClose={() => setEditingWorkout(undefined)}
          onSave={async (input) => {
            await saveWorkout(input, editingWorkout?.id)
            await loadWorkouts()
          }}
        />
      )}

      {loggingWorkout && (
        <LogWorkoutModal
          workout={loggingWorkout}
          onLog={handleLogWorkout}
          onClose={() => setLoggingWorkout(null)}
        />
      )}

      {viewingWorkoutId && (
        <WorkoutViewModal
          workoutId={viewingWorkoutId}
          onClose={() => setViewingWorkoutId(null)}
        />
      )}
    </div>
  )
}