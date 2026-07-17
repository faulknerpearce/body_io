import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import CatalogRow from '../components/layout/CatalogRow'
import PageHeader from '../components/layout/PageHeader'
import { PageError, PageLoading } from '../components/layout/PageState'
import LogRecipeModal from '../components/LogRecipeModal'
import type { RecipeLogSubmitOptions } from '../components/RecipeLogFields'
import Modal from '../components/Modal'
import RecipeViewModal from '../components/RecipeViewModal'
import SharedActivityViewModal from '../components/SharedActivityViewModal'
import SharedEntryViewModal from '../components/SharedEntryViewModal'
import WorkoutViewModal from '../components/WorkoutViewModal'
import { useProfile } from '../context/useProfile'
import { iconForActivityType } from '../lib/activityIcons'
import { forkActivity } from '../lib/activities'
import { forkEntry } from '../lib/entries'
import { forkRecipe, logRecipe } from '../lib/recipes'
import { getSharedSeenAt, isShareNew, markSharedAsSeen } from '../lib/sharedNotifications'
import {
  dismissActivityShare,
  dismissEntryShare,
  dismissRecipeShare,
  dismissWorkoutShare,
  fetchActivitiesSharedWithMe,
  fetchEntriesSharedWithMe,
  fetchRecipesSharedWithMe,
  fetchWorkoutsSharedWithMe,
  type SharedActivityItem,
  type SharedEntryItem,
  type SharedRecipeItem,
  type SharedWorkoutItem,
} from '../lib/sharing'
import { forkWorkout } from '../lib/workouts'

/** Human-readable when a share arrived (local timezone) — date + time. */
function formatShareReceivedAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'unknown date'
  const datePart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} at ${timePart}`
}

function SharedSection({
  title,
  count,
  emptyMessage,
  children,
}: {
  title: string
  count: number
  emptyMessage: string
  children: ReactNode
}) {
  return (
    <section>
      <h2
        className="on-sky-text"
        style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px 0' }}
      >
        {title} ({count})
      </h2>
      {count === 0 ? (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 28,
            border: '1px solid rgba(28, 28, 30, 0.06)',
            background: 'rgba(255, 255, 255, 0.92)',
            color: '#6c6c70',
            fontSize: 13,
            boxShadow: '0 4px 16px rgba(28, 28, 30, 0.06)',
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </section>
  )
}

function SharedCatalogActions({
  resourceLabel,
  onView,
  onAccept,
  acceptLoading,
  onDecline,
  declining,
}: {
  resourceLabel: string
  onView: () => void
  onAccept: () => void
  acceptLoading: boolean
  onDecline: () => void
  declining: boolean
}) {
  return (
    <>
      <button
        type="button"
        className="delicate-icon-action"
        onClick={onView}
        aria-label={`View ${resourceLabel}`}
        title={`View ${resourceLabel}`}
      >
        <i className="fa-regular fa-eye" />
      </button>
      <button
        type="button"
        className="delicate-icon-action"
        onClick={onDecline}
        disabled={declining || acceptLoading}
        aria-label={`Decline shared ${resourceLabel}`}
        title={`Decline shared ${resourceLabel}`}
      >
        <i className="fa-solid fa-xmark" />
      </button>
      <button
        type="button"
        className="catalog-add-log-button"
        onClick={onAccept}
        disabled={acceptLoading || declining}
        aria-label={`Accept shared ${resourceLabel}`}
        title={`Accept shared ${resourceLabel}`}
      >
        <i className={acceptLoading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-check'} />
      </button>
    </>
  )
}

export default function SharedWithMePage() {
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entries, setEntries] = useState<SharedEntryItem[]>([])
  const [recipes, setRecipes] = useState<SharedRecipeItem[]>([])
  const [activities, setActivities] = useState<SharedActivityItem[]>([])
  const [workouts, setWorkouts] = useState<SharedWorkoutItem[]>([])
  const [viewingEntry, setViewingEntry] = useState<SharedEntryItem | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<SharedRecipeItem | null>(null)
  /** Choice sheet: save to library vs log to meals (list primary action). */
  const [recipeActionItem, setRecipeActionItem] = useState<SharedRecipeItem | null>(null)
  const [loggingRecipe, setLoggingRecipe] = useState<SharedRecipeItem | null>(null)
  const [viewingActivity, setViewingActivity] = useState<SharedActivityItem | null>(null)
  const [viewingWorkout, setViewingWorkout] = useState<SharedWorkoutItem | null>(null)
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null)
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null)
  const [savingActivityId, setSavingActivityId] = useState<string | null>(null)
  const [savingWorkoutId, setSavingWorkoutId] = useState<string | null>(null)
  const [dismissingEntryId, setDismissingEntryId] = useState<string | null>(null)
  const [dismissingRecipeId, setDismissingRecipeId] = useState<string | null>(null)
  const [dismissingActivityId, setDismissingActivityId] = useState<string | null>(null)
  const [dismissingWorkoutId, setDismissingWorkoutId] = useState<string | null>(null)
  const [logSuccess, setLogSuccess] = useState<string | null>(null)
  const [seenAtBaseline] = useState(() => getSharedSeenAt())

  const loadShared = async () => {
    const [sharedEntries, sharedRecipes, sharedActivities, sharedWorkouts] = await Promise.all([
      fetchEntriesSharedWithMe(),
      fetchRecipesSharedWithMe(),
      fetchActivitiesSharedWithMe(),
      fetchWorkoutsSharedWithMe(),
    ])
    setEntries(sharedEntries)
    setRecipes(sharedRecipes)
    setActivities(sharedActivities)
    setWorkouts(sharedWorkouts)
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        await loadShared()
        if (!cancelled) setLoading(false)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load shared items')
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      markSharedAsSeen()
    }
  }, [])

  const isNew = (createdAt: string) => isShareNew(createdAt, seenAtBaseline)

  const totalCount = entries.length + recipes.length + activities.length + workouts.length

  const handleAddSharedEntry = async (item: SharedEntryItem) => {
    setSavingEntryId(item.share.id)
    try {
      await forkEntry(item.entry.id, item.share.id)
      await dismissEntryShare(item.share.id)
      setEntries((prev) => prev.filter((e) => e.share.id !== item.share.id))
      setViewingEntry(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry')
    } finally {
      setSavingEntryId(null)
    }
  }

  const handleSaveSharedRecipe = async (item: SharedRecipeItem): Promise<boolean> => {
    setSavingRecipeId(item.share.id)
    setError(null)
    try {
      const saved = await forkRecipe(item.recipe.id, item.share.id)
      // Keep the share visible so the user can still log to meals independently.
      setRecipes((prev) =>
        prev.map((r) =>
          r.share.id === item.share.id
            ? { ...r, share: { ...r.share, savedCopyId: saved.id } }
            : r,
        ),
      )
      setViewingRecipe((current) =>
        current?.share.id === item.share.id
          ? { ...current, share: { ...current.share, savedCopyId: saved.id } }
          : current,
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe')
      return false
    } finally {
      setSavingRecipeId(null)
    }
  }

  const handleLogSharedRecipe = async (options: RecipeLogSubmitOptions) => {
    if (!loggingRecipe) return
    setError(null)
    await logRecipe({
      recipeId: loggingRecipe.recipe.id,
      portionUnit: options.portionUnit,
      portionQuantity: options.portionQuantity,
      servingWeightGrams: options.servingWeightGrams,
      entryDate: options.entryDate,
      loggedAt: options.loggedAt,
    })
    setLogSuccess(`Added ${loggingRecipe.recipe.name} to your food log.`)
    setLoggingRecipe(null)
  }

  const handleAddSharedActivity = async (item: SharedActivityItem) => {
    setSavingActivityId(item.share.id)
    try {
      await forkActivity(item.activity.id, item.share.id)
      await dismissActivityShare(item.share.id)
      setActivities((prev) => prev.filter((a) => a.share.id !== item.share.id))
      setViewingActivity(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add activity')
    } finally {
      setSavingActivityId(null)
    }
  }

  const handleSaveSharedWorkout = async (item: SharedWorkoutItem) => {
    setSavingWorkoutId(item.share.id)
    try {
      await forkWorkout(item.workout.id, item.share.id)
      await dismissWorkoutShare(item.share.id)
      setWorkouts((prev) => prev.filter((w) => w.share.id !== item.share.id))
      setViewingWorkout(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSavingWorkoutId(null)
    }
  }

  const handleDismissEntry = async (item: SharedEntryItem) => {
    setDismissingEntryId(item.share.id)
    setError(null)
    try {
      await dismissEntryShare(item.share.id)
      setEntries((prev) => prev.filter((entry) => entry.share.id !== item.share.id))
      if (viewingEntry?.share.id === item.share.id) setViewingEntry(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared meal')
    } finally {
      setDismissingEntryId(null)
    }
  }

  const handleDismissRecipe = async (item: SharedRecipeItem) => {
    setDismissingRecipeId(item.share.id)
    setError(null)
    try {
      await dismissRecipeShare(item.share.id)
      setRecipes((prev) => prev.filter((recipe) => recipe.share.id !== item.share.id))
      if (viewingRecipe?.share.id === item.share.id) setViewingRecipe(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared recipe')
    } finally {
      setDismissingRecipeId(null)
    }
  }

  const handleDismissActivity = async (item: SharedActivityItem) => {
    setDismissingActivityId(item.share.id)
    setError(null)
    try {
      await dismissActivityShare(item.share.id)
      setActivities((prev) => prev.filter((activity) => activity.share.id !== item.share.id))
      if (viewingActivity?.share.id === item.share.id) setViewingActivity(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared activity')
    } finally {
      setDismissingActivityId(null)
    }
  }

  const handleDismissWorkout = async (item: SharedWorkoutItem) => {
    setDismissingWorkoutId(item.share.id)
    setError(null)
    try {
      await dismissWorkoutShare(item.share.id)
      setWorkouts((prev) => prev.filter((workout) => workout.share.id !== item.share.id))
      if (viewingWorkout?.share.id === item.share.id) setViewingWorkout(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove shared workout')
    } finally {
      setDismissingWorkoutId(null)
    }
  }

  if (loading) return <PageLoading message="Loading shared items..." />
  if (error && totalCount === 0) return <PageError message="Failed to load shared items" detail={error} />

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Shared With Me"
        description="Meals, recipes, activities, and workouts that other people have shared with you."
      />

      {logSuccess && (
        <div
          role="status"
          style={{
            marginBottom: 16,
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 24 }}>
        <SharedSection
          title="Meals"
          count={entries.length}
          emptyMessage="No meals shared with you yet."
        >
          <div className="catalog-list">
            {entries.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.entry.icon}
                iconBg={item.entry.iconBg}
                iconColor={item.entry.iconColor}
                title={item.entry.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.entry.calories} kcal · Received ${formatShareReceivedAt(item.share.createdAt)}`}
                onView={() => setViewingEntry(item)}
                actions={
                  <SharedCatalogActions
                    resourceLabel="meal"
                    onView={() => setViewingEntry(item)}
                    onAccept={() => handleAddSharedEntry(item)}
                    acceptLoading={savingEntryId === item.share.id}
                    onDecline={() => handleDismissEntry(item)}
                    declining={dismissingEntryId === item.share.id}
                  />
                }
              />
            ))}
          </div>
        </SharedSection>

        <SharedSection
          title="Recipes"
          count={recipes.length}
          emptyMessage="No recipes shared with you yet."
        >
          <div className="catalog-list">
            {recipes.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.recipe.icon}
                iconBg={item.recipe.iconBg}
                iconColor={item.recipe.iconColor}
                title={item.recipe.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.recipe.ingredientCount} ingredients${
                  item.share.savedCopyId ? ' · In your library' : ''
                }`}
                onView={() => setViewingRecipe(item)}
                actions={
                  <>
                    <button
                      type="button"
                      className="delicate-icon-action"
                      onClick={() => setViewingRecipe(item)}
                      aria-label="View recipe"
                      title="View recipe"
                    >
                      <i className="fa-regular fa-eye" />
                    </button>
                    <button
                      type="button"
                      className="delicate-icon-action"
                      onClick={() => handleDismissRecipe(item)}
                      disabled={dismissingRecipeId === item.share.id || savingRecipeId === item.share.id}
                      aria-label="Decline shared recipe"
                      title="Decline shared recipe"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                    {/* Primary: choose library vs log — never silent-log or silent-accept */}
                    <button
                      type="button"
                      className="catalog-add-log-button"
                      onClick={() => {
                        setLogSuccess(null)
                        setError(null)
                        setRecipeActionItem(item)
                      }}
                      aria-label="Add shared recipe — choose library or food log"
                      title="Add to library or log to meals"
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </SharedSection>

        <SharedSection
          title="Activities"
          count={activities.length}
          emptyMessage="No activities shared with you yet."
        >
          <div className="catalog-list">
            {activities.map((item) => {
              const icon = iconForActivityType(item.activity.activityType)
              return (
                <CatalogRow
                  key={item.share.id}
                  isNew={isNew(item.share.createdAt)}
                  icon={icon}
                  iconBg="#f0f8f4"
                  iconColor="var(--zone-accent)"
                  title={item.activity.name}
                  subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.activity.activityType}`}
                  onView={() => setViewingActivity(item)}
                  actions={
                    <SharedCatalogActions
                      resourceLabel="activity"
                      onView={() => setViewingActivity(item)}
                      onAccept={() => handleAddSharedActivity(item)}
                      acceptLoading={savingActivityId === item.share.id}
                      onDecline={() => handleDismissActivity(item)}
                      declining={dismissingActivityId === item.share.id}
                    />
                  }
                />
              )
            })}
          </div>
        </SharedSection>

        <SharedSection
          title="Workouts"
          count={workouts.length}
          emptyMessage="No workouts shared with you yet."
        >
          <div className="catalog-list">
            {workouts.map((item) => (
              <CatalogRow
                key={item.share.id}
                isNew={isNew(item.share.createdAt)}
                icon={item.workout.icon}
                iconBg={item.workout.iconBg}
                iconColor={item.workout.iconColor}
                title={item.workout.name}
                subtitle={`Shared by ${item.share.ownerDisplayName} · ${item.workout.exerciseCount} exercises`}
                onView={() => setViewingWorkout(item)}
                actions={
                  <SharedCatalogActions
                    resourceLabel="workout"
                    onView={() => setViewingWorkout(item)}
                    onAccept={() => handleSaveSharedWorkout(item)}
                    acceptLoading={savingWorkoutId === item.share.id}
                    onDecline={() => handleDismissWorkout(item)}
                    declining={dismissingWorkoutId === item.share.id}
                  />
                }
              />
            ))}
          </div>
        </SharedSection>
      </div>

      {viewingEntry && (
        <SharedEntryViewModal
          item={viewingEntry}
          timeZone={profile.timeZone}
          saving={savingEntryId === viewingEntry.share.id}
          onAddToLog={async () => handleAddSharedEntry(viewingEntry)}
          onClose={() => setViewingEntry(null)}
        />
      )}

      {viewingActivity && (
        <SharedActivityViewModal
          item={viewingActivity}
          timeZone={profile.timeZone}
          saving={savingActivityId === viewingActivity.share.id}
          onAddToLog={async () => handleAddSharedActivity(viewingActivity)}
          onClose={() => setViewingActivity(null)}
        />
      )}

      {viewingRecipe && (
        <RecipeViewModal
          recipeId={viewingRecipe.recipe.id}
          onClose={() => setViewingRecipe(null)}
          mode="shared"
          ownerDisplayName={viewingRecipe.share.ownerDisplayName}
          savedCopyId={viewingRecipe.share.savedCopyId}
          savingCopy={savingRecipeId === viewingRecipe.share.id}
          onSaveCopy={async () => handleSaveSharedRecipe(viewingRecipe)}
          onLogToMeals={() => {
            setLogSuccess(null)
            setLoggingRecipe(viewingRecipe)
            setViewingRecipe(null)
          }}
        />
      )}

      {recipeActionItem && (
        <Modal titleId="shared-recipe-action-title" onClose={() => setRecipeActionItem(null)}>
          <h3
            id="shared-recipe-action-title"
            style={{
              fontFamily: "'Space Grotesk','Inter',sans-serif",
              fontSize: 22,
              fontWeight: 600,
              margin: '0 0 4px 0',
            }}
          >
            {recipeActionItem.recipe.name}
          </h3>
          <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 20px 0' }}>
            Shared by {recipeActionItem.share.ownerDisplayName}. Choose what you want to do — these
            are independent.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              disabled={
                !!recipeActionItem.share.savedCopyId ||
                savingRecipeId === recipeActionItem.share.id
              }
              onClick={async () => {
                const item = recipeActionItem
                const ok = await handleSaveSharedRecipe(item)
                if (ok) {
                  setRecipeActionItem(null)
                  setLogSuccess(`Saved ${item.recipe.name} to your recipes.`)
                }
              }}
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid #e4e4e7',
                background: recipeActionItem.share.savedCopyId ? '#f4f4f5' : 'white',
                color: '#18181b',
                fontSize: 14,
                fontWeight: 500,
                cursor: recipeActionItem.share.savedCopyId ? 'default' : 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {recipeActionItem.share.savedCopyId
                  ? 'Already in my recipes'
                  : savingRecipeId === recipeActionItem.share.id
                    ? 'Saving…'
                    : 'Save to my recipes'}
              </div>
              <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>
                Copy into your recipe library. Does not log a meal.
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoggingRecipe(recipeActionItem)
                setRecipeActionItem(null)
              }}
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                border: 'none',
                background: 'var(--zone-accent)',
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600 }}>Log to my meals</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                Choose date, time, servings or grams — does not require saving to your library.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRecipeActionItem(null)}
              style={{
                padding: '10px 16px',
                borderRadius: 9999,
                border: '1px solid #e4e4e7',
                background: 'white',
                color: '#52525b',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                alignSelf: 'flex-end',
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {loggingRecipe && (
        <LogRecipeModal
          recipe={loggingRecipe.recipe}
          timeZone={profile.timeZone}
          subtitle={
            <>
              Log <strong style={{ color: '#18181b' }}>{loggingRecipe.recipe.name}</strong> to your
              food log
              {loggingRecipe.share.ownerDisplayName
                ? ` (shared by ${loggingRecipe.share.ownerDisplayName})`
                : ''}
              .
            </>
          }
          onLog={handleLogSharedRecipe}
          onClose={() => setLoggingRecipe(null)}
        />
      )}

      {viewingWorkout && (
        <WorkoutViewModal
          workoutId={viewingWorkout.workout.id}
          onClose={() => setViewingWorkout(null)}
          mode="shared"
          ownerDisplayName={viewingWorkout.share.ownerDisplayName}
          savedCopyId={viewingWorkout.share.savedCopyId}
          savingCopy={savingWorkoutId === viewingWorkout.share.id}
          onSaveCopy={async () => handleSaveSharedWorkout(viewingWorkout)}
        />
      )}
    </div>
  )
}