import { useCallback, useRef, useState } from 'react'
import type { AppRoute } from '../lib/routing'
import PageHeader from '../components/layout/PageHeader'
import type { DayNavHeaderState } from '../lib/dayNavState'
import PageShell from '../components/layout/PageShell'
import ZoneButton from '../components/layout/ZoneButton'
import ZoneSubNav from '../components/layout/ZoneSubNav'
import OutputsPage from './OutputsPage'
import WorkoutsPage from './WorkoutsPage'

interface OutputsZoneProps {
  route: Extract<AppRoute, 'outputs' | 'outputs/workouts'>
}

export default function OutputsZone({ route }: OutputsZoneProps) {
  const isWorkouts = route === 'outputs/workouts'
  const openCreateWorkoutRef = useRef<(() => void) | null>(null)
  const openLogActivityRef = useRef<(() => void) | null>(null)
  const [dayNavState, setDayNavState] = useState<DayNavHeaderState | null>(null)
  const handleOpenCreateReady = useCallback((openCreate: () => void) => {
    openCreateWorkoutRef.current = openCreate
  }, [])
  const handleOpenLogActivityReady = useCallback((openLogActivity: () => void) => {
    openLogActivityRef.current = openLogActivity
  }, [])
  const handleDayNavStateReady = useCallback((state: DayNavHeaderState | null) => {
    setDayNavState(state)
  }, [])

  return (
    <PageShell zone="outputs">
      <PageHeader
        eyebrow={isWorkouts ? 'Outputs › Workouts' : 'Outputs'}
        title={isWorkouts ? 'Workouts' : 'Activity Log'}
        description={
          isWorkouts
            ? 'Saved routines for quick activity logging.'
            : 'Browse days and log activities with stats and history.'
        }
        actions={
          isWorkouts ? (
            <ZoneButton variant="primary" onClick={() => openCreateWorkoutRef.current?.()}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> New Workout
            </ZoneButton>
          ) : (
            <ZoneButton variant="primary" onClick={() => openLogActivityRef.current?.()}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> Log Activity
            </ZoneButton>
          )
        }
      />
      <ZoneSubNav
        active={route}
        items={[
          { route: 'outputs', label: 'Log' },
          { route: 'outputs/workouts', label: 'Workouts' },
        ]}
      />
      {isWorkouts ? (
        <WorkoutsPage onOpenCreateReady={handleOpenCreateReady} />
      ) : (
        <OutputsPage
          onOpenLogActivityReady={handleOpenLogActivityReady}
          onDayNavStateReady={handleDayNavStateReady}
        />
      )}
    </PageShell>
  )
}