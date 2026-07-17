import { useState } from 'react'
import { neutrals, radius } from '../../lib/design-tokens'

interface DeviceTotalControlProps {
  deviceTotal: number | null
  bmr: number
  activityCalories: number
  dayLoading?: boolean
  onSave: (kcal: number) => Promise<void>
  onClear: () => Promise<void>
}

export default function DeviceTotalControl({
  deviceTotal,
  bmr,
  activityCalories,
  dayLoading = false,
  onSave,
  onClear,
}: DeviceTotalControlProps) {
  const [draft, setDraft] = useState(deviceTotal === null ? '' : String(deviceTotal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(deviceTotal === null)

  const usingDevice = deviceTotal !== null
  const collapsed = usingDevice && !expanded

  const handleSave = async () => {
    const parsed = Number.parseInt(draft.trim(), 10)
    if (!Number.isFinite(parsed)) {
      setError('Enter a whole number')
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
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: 0,
          padding: '4px 0',
          borderRadius: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          cursor: dayLoading ? 'default' : 'pointer',
          textAlign: 'left',
          opacity: dayLoading ? 0.55 : 1,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: neutrals.textFaint }}>
            Device
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: neutrals.textPrimary }}>
            {deviceTotal!.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: neutrals.textMuted }}>kcal</span>
          {activityCalories > 0 && (
            <span style={{ fontSize: 11, color: neutrals.textFaint }}>
              +{activityCalories} activity
            </span>
          )}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: neutrals.textMuted, flexShrink: 0 }}>
          Edit
        </span>
      </button>
    )
  }

  return (
    <div
      style={{
        padding: '4px 0',
        borderRadius: 0,
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        opacity: dayLoading ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label htmlFor="device-total-kcal" style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: neutrals.textFaint }}>
          Device total
        </label>
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
            if (e.key === 'Enter') { e.preventDefault(); void handleSave() }
            if (e.key === 'Escape' && usingDevice) { setDraft(String(deviceTotal)); setError(null); setExpanded(false) }
          }}
          placeholder={`${bmr}`}
          style={{
            width: 90,
            padding: '4px 0',
            borderRadius: 0,
            border: 'none',
            borderBottom: `1px solid ${neutrals.borderStrong}`,
            outline: 'none',
            fontSize: 14,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: neutrals.textPrimary,
            background: 'transparent',
            boxShadow: 'none',
          }}
        />
        <span style={{ fontSize: 12, color: neutrals.textMuted }}>kcal</span>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || dayLoading || draft.trim() === ''}
          style={{
            padding: '6px 12px',
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
          {saving ? '...' : 'Save'}
        </button>
        {usingDevice && (
          <>
            <button
              type="button"
              onClick={() => { setDraft(String(deviceTotal)); setError(null); setExpanded(false) }}
              disabled={saving || dayLoading}
              style={{
                padding: '6px 10px',
                borderRadius: radius.sm,
                border: 'none',
                background: 'transparent',
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
                padding: '6px 10px',
                borderRadius: radius.sm,
                border: 'none',
                background: 'transparent',
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
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#D70015' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
