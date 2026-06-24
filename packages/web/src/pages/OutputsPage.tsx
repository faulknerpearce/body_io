import {
  formatDayLabel,
  formatDistance,
  formatDuration,
  sumActivityTotals,
  todayISO,
} from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import { pageTitle, sectionHeader as sectionLabelStyle } from '../lib/styles'
import ActivityLogSection from '../components/ActivityLogSection'
import ActivityMetricCard from '../components/ActivityMetricCard'
import { buildActivityMetricConfigs } from '../lib/activityMetrics'
import {
  addActivity,
  deleteActivity,
  fetchActivityDaySummaries,
  updateActivity,
  type Activity,
  type ActivityDaySummary,
  type NewActivity,
} from '../lib/activities'
import { logWorkout } from '../lib/workouts'

function updateDayActivities(
  days: ActivityDaySummary[],
  date: string,
  activities: Activity[],
): ActivityDaySummary[] {
  return days.map((day) =>
    day.date === date ? { ...day, activities, totals: sumActivityTotals(activities) } : day,
  )
}

export default function OutputsPage() {
  const [days, setDays] = useState<ActivityDaySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDate, setExpandedDate] = useState<string | null>(todayISO())

  useEffect(() => {
    fetchActivityDaySummaries()
      .then((data) => {
        setDays(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load activities')
        setLoading(false)
      })
  }, [])

  async function persistAdd(input: NewActivity) {
    const activity = await addActivity(input)
    const today = todayISO()
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayActivities(prev, today, [...existing.activities, activity])
      }
      return [
        { date: today, activities: [activity], totals: sumActivityTotals([activity]) },
        ...prev,
      ]
    })
  }

  async function persistLogWorkout(options: { workoutId: string; setsLogged: number }) {
    const activity = await logWorkout(options)
    const today = todayISO()
    setDays((prev) => {
      const existing = prev.find((day) => day.date === today)
      if (existing) {
        return updateDayActivities(prev, today, [...existing.activities, activity])
      }
      return [
        { date: today, activities: [activity], totals: sumActivityTotals([activity]) },
        ...prev,
      ]
    })
  }

  async function persistUpdate(id: string, input: NewActivity) {
    const updated = await updateActivity(id, input)
    setDays((prev) =>
      prev.map((day) => {
        const activities = day.activities.map((activity) =>
          activity.id === id ? updated : activity,
        )
        return activities === day.activities
          ? day
          : { ...day, activities, totals: sumActivityTotals(activities) }
      }),
    )
  }

  async function persistDelete(id: string) {
    await deleteActivity(id)
    setDays((prev) =>
      prev.map((day) => {
        const activities = day.activities.filter((activity) => activity.id !== id)
        return activities.length === day.activities.length
          ? day
          : { ...day, activities, totals: sumActivityTotals(activities) }
      }),
    )
  }

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
        Loading activities...
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" style={{ textAlign: 'center', padding: '80px 20px', color: '#dc2626' }}>
        <i
          className="fa-solid fa-circle-exclamation"
          style={{ fontSize: 32, marginBottom: 12, display: 'block' }}
        />
        <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Failed to load activities</p>
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabelStyle}>Activity Logs</p>
        <h2 className="page-title-mobile" style={pageTitle}>
          Outputs
        </h2>
        <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
          Log cardio manually or pick a saved workout template with per-exercise sets.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map((day) => {
          const expanded = expandedDate === day.date
          const isToday = day.date === todayISO()

          return (
            <div
              key={day.date}
              style={{
                background: 'white',
                border: '1px solid #e4e4e7',
                borderRadius: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedDate(expanded ? null : day.date)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {formatDayLabel(day.date)}
                  </div>
                  <div style={{ fontSize: 12, color: '#71717a' }}>{day.date}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#a1a1aa',
                      marginTop: 4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {day.activities.length}{' '}
                    {day.activities.length === 1 ? 'activity' : 'activities'} •{' '}
                    {formatDuration(day.totals.movingTimeSeconds)} •{' '}
                    {formatDistance(day.totals.distanceMeters || null)}
                    {day.totals.calories > 0 && ` • ${day.totals.calories} kcal burned`}
                  </div>
                </div>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    color: '#71717a',
                    fontSize: 14,
                    transition: 'transform 0.2s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {expanded && (
                <div
                  className="log-section-content"
                  style={{ padding: '0 24px 24px', borderTop: '1px solid #f4f4f5' }}
                >
                  <div className="metric-grid-2" style={{ paddingTop: 20, marginBottom: 24 }}>
                    {buildActivityMetricConfigs(day.activities).map((metric) => (
                      <ActivityMetricCard key={metric.label} config={metric} />
                    ))}
                  </div>
                  <ActivityLogSection
                    activities={day.activities}
                    onAdd={isToday ? persistAdd : undefined}
                    onLogWorkout={isToday ? persistLogWorkout : undefined}
                    onEdit={persistUpdate}
                    onDelete={persistDelete}
                    title={`${formatDayLabel(day.date)} Activities`}
                    subtitle={
                      isToday
                        ? 'Log, edit, or remove activities for today'
                        : 'Edit or remove activities from this day'
                    }
                    defaultExpanded
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
