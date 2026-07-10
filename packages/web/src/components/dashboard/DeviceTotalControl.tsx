import { useState } from 'react'
import { neutrals, radius } from '../../lib/design-tokens'

interface DeviceTotalControlProps {
  /** Saved device total for this day, or null if using BMR. */
  deviceTotal: number | null
  bmr: number
  activityCalories: number
  dayLoading?: boolean
  onSave: (kcal: number) => Promise<void>
  onClear: () => Promise<void>
}

/**
 * Enter wearable full-day calories. Replaces BMR as the day's base burn;
 * logged workouts still add on top.
 * Collapses after save; tap the summary to edit.
 */
export default function DeviceTotalControl({
  deviceTotal,
  bmr,
  activityCalories,
  dayLoading = false,
  onSave,
  onClear,
}: DeviceTotalControlProps) {
  // Parent remounts via key when date/deviceTotal changes so draft stays in sync without effects.
  const [draft, setDraft] = useState(deviceTotal === null ? '' : String(deviceTotal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Expanded when no saved value, or user taps to edit. */
  const [expanded, setExpanded] = useState(deviceTotal === null)

  const baseBurn = deviceTotal !== null ? deviceTotal : bmr
  const totalOut = baseBurn + activityCalories
  const usingDevice = deviceTotal !== null
  const collapsed = usingDevice && !expanded

  const handleSave = async () => {
    const parsed = Number.parseInt(draft.trim(), 10)
    if (!Number.isFinite(parsed)) {
      setError('Enter a whole number of kcal')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(parsed)
      setExpanded(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    setSaving(true)
    setError(null)
    try {
      await onClear()
      setDraft('')
      setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear')
    } finally {
      setSaving(false)
    }
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={dayLoading}
        aria-expanded={false}
        aria-label={`Device total ${deviceTotal!.toLocaleString()} kilocalories. Tap to edit.`}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          margin: 0,
          padding: '10px 14px',
          borderRadius: radius.md,
          background: neutrals.surfaceMuted,
          border: `1px solid ${neutrals.border}`,
          cursor: dayLoading ? 'default' : 'pointer',
          textAlign: 'left',
          opacity: dayLoading ? 0.55 : 1,
          transition: 'opacity 0.15s ease, background 0.15s ease',
        }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: neutrals.textFaint,
            }}
          >
            Device total
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: neutrals.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            {deviceTotal!.toLocaleString()}{' '}
            <span style={{ fontSize: 12, fontWeight: 500, color: neutrals.textMuted }}>kcal</span>
          </span>
          {activityCalories > 0 && (
            <span style={{ fontSize: 11, color: neutrals.textFaint }}>
              + {activityCalories.toLocaleString()} activity → {totalOut.toLocaleString()} out
            </span>
          )}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: neutrals.textMuted,
            flexShrink: 0,
          }}
        >
          Edit
        </span>
      </button>
    )
  }

  return (
    <div
      style={{
        marginBottom: 0,
        padding: '12px 14px',
        borderRadius: radius.md,
        background: neutrals.surfaceMuted,
        border: `1px solid ${neutrals.border}`,
        opacity: dayLoading ? 0.55 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: 10,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <label
            htmlFor="device-total-kcal"
            style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: neutrals.textFaint,
              marginBottom: 6,
            }}
          >
            Device total
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              id="device-total-kcal"
              type="number"
              min={0}
              max={10000}
              step={1}
              inputMode="numeric"
              value={draft}
              disabled={saving || dayLoading}
              autoFocus={usingDevice}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSave()
                }
                if (e.key === 'Escape' && usingDevice) {
                  setDraft(String(deviceTotal))
                  setError(null)
                  setExpanded(false)
                }
              }}
              placeholder={`e.g. ${bmr + 800}`}
              style={{
                width: 110,
                padding: '8px 10px',
                borderRadius: radius.sm,
                border: `1px solid ${neutrals.borderStrong}`,
                fontSize: 15,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: neutrals.textPrimary,
                background: neutrals.surface,
              }}
            />
            <span style={{ fontSize: 13, color: neutrals.textMuted }}>kcal</span>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || dayLoading || draft.trim() === ''}
              style={{
                padding: '8px 12px',
                borderRadius: radius.sm,
                border: 'none',
                background: neutrals.textPrimary,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                opacity: draft.trim() === '' ? 0.5 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {usingDevice && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(String(deviceTotal))
                    setError(null)
                    setExpanded(false)
                  }}
                  disabled={saving || dayLoading}
                  style={{
                    padding: '8px 10px',
                    borderRadius: radius.sm,
                    border: `1px solid ${neutrals.borderStrong}`,
                    background: neutrals.surface,
                    color: neutrals.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  disabled={saving || dayLoading}
                  style={{
                    padding: '8px 10px',
                    borderRadius: radius.sm,
                    border: `1px solid ${neutrals.borderStrong}`,
                    background: neutrals.surface,
                    color: neutrals.textMuted,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: neutrals.textMuted,
            lineHeight: 1.45,
            flex: '1 1 200px',
            maxWidth: 360,
          }}
        >
          {usingDevice ? (
            <>
              Base <strong style={{ color: neutrals.textSecondary }}>{baseBurn.toLocaleString()}</strong>{' '}
              (device)
              {activityCalories > 0 && (
                <>
                  {' '}
                  + {activityCalories.toLocaleString()} activity ={' '}
                  <strong style={{ color: neutrals.textSecondary }}>{totalOut.toLocaleString()}</strong>{' '}
                  out
                </>
              )}
              {activityCalories === 0 && <> replaces BMR for this day.</>}
            </>
          ) : (
            <>
              Using provisional BMR ({bmr.toLocaleString()} kcal). Enter your watch’s full-day total
              when ready — it can be lower or higher than BMR.
            </>
          )}
        </p>
      </div>
      {error && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#D70015' }} role="alert">
          {error}
        </p>
      )}
      <p style={{ margin: '8px 0 0', fontSize: 11, color: neutrals.textFaint, lineHeight: 1.4 }}>
        If the watch total already includes workouts you log here, leave those workout calories at 0
        or you will double-count.
      </p>
    </div>
  )
}
