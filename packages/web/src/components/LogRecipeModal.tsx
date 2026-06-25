import { useEffect, useRef, useState } from 'react'
import { scaleRecipeToServings, type RecipeSummary } from '@nutrition-tracker/shared'
import { focusIfDesktop } from '../lib/device'
import { inputBase, labelBase } from '../lib/styles'
import Modal from './Modal'

interface LogRecipeModalProps {
  recipe: RecipeSummary
  onLog: (servings: number) => Promise<void>
  onClose: () => void
}

export default function LogRecipeModal({ recipe, onLog, onClose }: LogRecipeModalProps) {
  const [servings, setServings] = useState('1')
  const [logging, setLogging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const servingsRef = useRef<HTMLInputElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const servingsNum = Number.parseFloat(servings)
  const previewTotals =
    servings !== '' && Number.isFinite(servingsNum) && servingsNum > 0
      ? scaleRecipeToServings(recipe.batchTotals, recipe.defaultServings, servingsNum)
      : null

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    focusIfDesktop(servingsRef.current)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previousFocusRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (!Number.isFinite(servingsNum) || servingsNum <= 0) {
      setError('Servings must be greater than 0')
      return
    }

    setLogging(true)
    setError(null)
    try {
      await onLog(servingsNum)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log recipe')
    } finally {
      setLogging(false)
    }
  }

  return (
    <Modal titleId="log-recipe-title" onClose={onClose}>
      <h3
        id="log-recipe-title"
        style={{
          fontFamily: "'Space Grotesk','Inter',sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: '0 0 4px 0',
        }}
      >
        Add to Log
      </h3>
      <p style={{ fontSize: 13, color: '#71717a', margin: '0 0 24px 0' }}>
        Log <strong style={{ color: '#18181b' }}>{recipe.name}</strong> to today&apos;s food log.
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
        <label htmlFor="log-recipe-servings" style={labelBase}>
          How many servings did you have?
        </label>
        <input
          id="log-recipe-servings"
          ref={servingsRef}
          type="number"
          min="0.25"
          step="0.25"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          style={inputBase}
        />
        <p style={{ fontSize: 12, color: '#a1a1aa', margin: '6px 0 0 0' }}>
          Recipe makes {recipe.defaultServings} servings per batch ({recipe.perServingTotals.calories}{' '}
          kcal per serving)
        </p>
      </div>

      {previewTotals && (
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
          This will add {previewTotals.calories} kcal, {previewTotals.protein}g protein,{' '}
          {previewTotals.carbs}g carbs
          {previewTotals.fat > 0 ? `, ${previewTotals.fat}g fat` : ''}.
        </div>
      )}

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
          disabled={logging}
          style={{
            padding: '10px 20px',
            borderRadius: 9999,
            border: 'none',
            background: logging ? '#6b7280' : '#134e4b',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {logging ? 'Adding...' : 'Add to Log'}
        </button>
      </div>
    </Modal>
  )
}