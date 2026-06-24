import {
  computeNetBalance,
  formatDuration,
  sumActivityTotals,
  sumTotals,
  todayISO,
} from '@nutrition-tracker/shared'
import { useEffect, useState } from 'react'
import { useNutritionGoals } from '../context/useProfile'
import { useZoneTheme } from '../context/ZoneThemeContext'
import PageHeader from '../components/layout/PageHeader'
import { PageError, PageLoading } from '../components/layout/PageState'
import ActivityMetricCard from '../components/ActivityMetricCard'
import DashboardPreviewList, { PreviewEmpty, PreviewRow } from '../components/DashboardPreviewList'
import MetricCard from '../components/MetricCard'
import NetBalanceCard from '../components/NetBalanceCard'
import { fetchActivities, type Activity } from '../lib/activities'
import { type FoodEntry, fetchEntries } from '../lib/entries'
import { buildActivityMetricConfigs } from '../lib/activityMetrics'
import { buildMetricConfigs } from '../lib/metrics'
import { routeHref } from '../lib/routing'
import { zoneTokens } from '../lib/design-tokens'

function formatRange(low: number, high: number, unit: string): string {
  return `${low.toLocaleString()}–${high.toLocaleString()} ${unit}`
}

function formatCaffeineLimit(limit: number, unit: string): string {
  return `≤${limit.toLocaleString()} ${unit}`
}

function SectionHeader({
  label,
  title,
  href,
  linkLabel,
  accent,
}: {
  label: string
  title: string
  href: string
  linkLabel: string
  accent: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            margin: '0 0 4px 0',
            color: '#71717a',
          }}
        >
          {label}
        </p>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            margin: 0,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>
      </div>
      <a
        href={href}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: accent,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        {linkLabel} →
      </a>
    </div>
  )
}

export default function Dashboard() {
  const nutritionGoals = useNutritionGoals()
  const zone = useZoneTheme()
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchEntries(), fetchActivities()])
      .then(([food, acts]) => {
        setEntries(food)
        setActivities(acts)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setLoading(false)
      })
  }, [])

  if (loading) return <PageLoading message="Loading dashboard..." />
  if (error) {
    return (
      <PageError
        message="Failed to load dashboard"
        detail={`${error}. Check that you are signed in and Supabase is reachable.`}
      />
    )
  }

  const foodTotals = sumTotals(entries)
  const activityTotals = sumActivityTotals(activities)
  const balance = computeNetBalance(
    foodTotals.calories,
    activityTotals.calories,
    nutritionGoals.calories.low,
    nutritionGoals.calories.high,
  )
  const inputMetrics = buildMetricConfigs(entries, nutritionGoals)
  const outputMetrics = buildActivityMetricConfigs(activities)
  const recentEntries = [...entries].slice(-3).reverse()
  const recentActivities = [...activities].slice(-3).reverse()

  const goalsSummary = [
    formatRange(nutritionGoals.calories.low, nutritionGoals.calories.high, 'kcal'),
    formatRange(nutritionGoals.protein.low, nutritionGoals.protein.high, 'g protein'),
    `~${nutritionGoals.carbs.value}g carbs`,
    `~${nutritionGoals.fat.value}g fat`,
    `~${nutritionGoals.fiber.value}g fiber`,
    formatCaffeineLimit(nutritionGoals.caffeine.value, 'mg caffeine'),
  ].join(' · ')

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={`${todayISO()} · Target: ${goalsSummary}`}
      />

      <div className="quick-chips">
        <a
          href={routeHref('inputs')}
          className="quick-chip"
          style={{
            background: zoneTokens.inputs.accent,
            color: zoneTokens.inputs.accentText,
            borderColor: zoneTokens.inputs.accent,
          }}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" /> Log Food
        </a>
        <a href={routeHref('inputs/recipes')} className="quick-chip">
          <i className="fa-solid fa-book-open" aria-hidden="true" /> Recipes
        </a>
        <a
          href={routeHref('outputs')}
          className="quick-chip"
          style={{
            background: zoneTokens.outputs.accent,
            color: zoneTokens.outputs.accentText,
            borderColor: zoneTokens.outputs.accent,
          }}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" /> Log Activity
        </a>
        <a href={routeHref('outputs/workouts')} className="quick-chip">
          <i className="fa-solid fa-dumbbell" aria-hidden="true" /> Workouts
        </a>
      </div>

      <div className="dashboard-bento">
        <div className="dashboard-bento-hero">
          <NetBalanceCard balance={balance} hasActivities={activities.length > 0} />
        </div>

        <div className="dashboard-bento-split">
          <section>
            <SectionHeader
              label="Nutrition"
              title="Today's Inputs"
              href={routeHref('inputs')}
              linkLabel="View all"
              accent={zoneTokens.inputs.accent}
            />
            <div className="metric-grid-2">
              {inputMetrics.map((m) => (
                <MetricCard key={m.label} config={m} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              label="Activity"
              title="Today's Outputs"
              href={routeHref('outputs')}
              linkLabel="View all"
              accent={zoneTokens.outputs.accent}
            />
            {activities.length === 0 ? (
              <div className="day-accordion" style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ fontWeight: 500, color: '#52525b', margin: '0 0 4px 0' }}>
                  No activities logged today
                </p>
                <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0 }}>
                  <a
                    href={routeHref('outputs')}
                    style={{ color: zoneTokens.outputs.accent, fontWeight: 500 }}
                  >
                    Log an activity
                  </a>{' '}
                  to track workouts and calories burned.
                </p>
              </div>
            ) : (
              <div className="metric-grid-2">
                {outputMetrics.map((metric) => (
                  <ActivityMetricCard key={metric.label} config={metric} />
                ))}
              </div>
            )}
          </section>
        </div>

        <section>
          <SectionHeader
            label="Logs"
            title="Today's Logs"
            href={routeHref('inputs')}
            linkLabel="View all"
            accent={zone.eyebrow}
          />
          <div className="metric-grid-auto">
            <DashboardPreviewList
              title="Recent Food"
              viewAllHref={routeHref('inputs')}
              viewAllLabel="Inputs"
            >
              {recentEntries.length === 0 ? (
                <PreviewEmpty message="No food logged today" />
              ) : (
                recentEntries.map((entry) => (
                  <PreviewRow
                    key={entry.id}
                    primary={entry.name}
                    secondary={entry.description || 'Food entry'}
                    meta={`${entry.calories} kcal · ${entry.protein}g protein`}
                  />
                ))
              )}
            </DashboardPreviewList>

            <DashboardPreviewList
              title="Recent Activities"
              viewAllHref={routeHref('outputs')}
              viewAllLabel="Outputs"
            >
              {recentActivities.length === 0 ? (
                <PreviewEmpty message="No activities logged today" />
              ) : (
                recentActivities.map((activity) => (
                  <PreviewRow
                    key={activity.id}
                    primary={activity.name}
                    secondary={activity.activityType}
                    meta={formatDuration(activity.movingTimeSeconds)}
                  />
                ))
              )}
            </DashboardPreviewList>
          </div>
        </section>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <p style={{ fontSize: 10, color: '#a1a1aa' }}>
          Data is estimated using standard nutritional references. Actual values may vary.
        </p>
      </div>
    </div>
  )
}