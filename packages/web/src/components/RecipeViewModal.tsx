import { useEffect, useState } from 'react'
import type { RecipeWithIngredients } from '@nutrition-tracker/shared'
import { fetchRecipe } from '../lib/recipes'
import { iconTileMd, labelBase, subtleSurface } from '../lib/styles'
import Modal from './Modal'

interface RecipeViewModalProps {
  recipeId: string
  onClose: () => void
  mode?: 'owned' | 'shared'
  ownerDisplayName?: string
  savedCopyId?: string | null
  savingCopy?: boolean
  onShare?: (recipe: RecipeWithIngredients) => void
  onSaveCopy?: () => void
}

function formatMacro(value: number, unit: string): string {
  return `${value}${unit}`
}

export default function RecipeViewModal({
  recipeId,
  onClose,
  mode = 'owned',
  ownerDisplayName,
  savedCopyId,
  savingCopy = false,
  onShare,
  onSaveCopy,
}: RecipeViewModalProps) {
  const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)

    fetchRecipe(recipeId)
      .then((data) => {
        setRecipe(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load recipe')
        setLoading(false)
      })

    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

  return (
    <Modal titleId="recipe-view-title" onClose={onClose} size="wide">
      {loading ? (
        <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Loading recipe...</p>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : recipe ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ ...iconTileMd, background: recipe.iconBg }}>
              <i
                className={`fa-solid ${recipe.icon}`}
                style={{ color: recipe.iconColor, fontSize: 20 }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                id="recipe-view-title"
                style={{
                  fontFamily: "'Space Grotesk','Inter',sans-serif",
                  fontSize: 22,
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                }}
              >
                {recipe.name}
              </h3>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>
                {mode === 'shared' && ownerDisplayName
                  ? `Shared by ${ownerDisplayName} · `
                  : ''}
                {recipe.defaultServings} servings per batch · {recipe.ingredients.length} ingredients
              </p>
            </div>
          </div>

          {recipe.description && (
            <p style={{ fontSize: 13, color: '#52525b', margin: '0 0 20px 0' }}>{recipe.description}</p>
          )}

          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              background: '#ecfdf5',
              color: '#065f46',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Per serving</div>
            {recipe.perServingTotals.calories} kcal · {recipe.perServingTotals.protein}g protein ·{' '}
            {recipe.perServingTotals.carbs}g carbs
            {recipe.perServingTotals.fat > 0 && ` · ${recipe.perServingTotals.fat}g fat`}
            {recipe.perServingTotals.fiber > 0 && ` · ${recipe.perServingTotals.fiber}g fiber`}
            {recipe.perServingTotals.caffeine > 0 && ` · ${recipe.perServingTotals.caffeine}mg caffeine`}
            <div style={{ marginTop: 10, color: '#047857' }}>
              Full batch: {recipe.batchTotals.calories} kcal · {recipe.batchTotals.protein}g protein ·{' '}
              {recipe.batchTotals.carbs}g carbs
            </div>
          </div>

          <p style={{ ...labelBase, marginBottom: 10 }}>Ingredients</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                style={{
                  ...subtleSurface,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: '#18181b' }}>{ingredient.name}</div>
                {ingredient.amount && (
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>{ingredient.amount}</div>
                )}
                <div style={{ fontSize: 12, color: '#52525b', marginTop: 8 }}>
                  {formatMacro(ingredient.calories, ' kcal')} · {formatMacro(ingredient.protein, 'g protein')} ·{' '}
                  {formatMacro(ingredient.carbs, 'g carbs')}
                  {ingredient.fat > 0 && ` · ${ingredient.fat}g fat`}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        {mode === 'owned' && recipe && onShare && (
          <button
            type="button"
            onClick={() => onShare(recipe)}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: '1px solid #e4e4e7',
              background: 'white',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#134e4b',
            }}
          >
            Share
          </button>
        )}
        {mode === 'shared' && onSaveCopy && (
          <button
            type="button"
            onClick={onSaveCopy}
            disabled={!!savedCopyId || savingCopy}
            style={{
              padding: '10px 20px',
              borderRadius: 9999,
              border: 'none',
              background: savedCopyId ? '#e4e4e7' : '#134e4b',
              fontSize: 13,
              fontWeight: 500,
              cursor: savedCopyId ? 'default' : 'pointer',
              color: savedCopyId ? '#71717a' : 'white',
            }}
          >
            {savedCopyId ? 'Already saved' : savingCopy ? 'Saving...' : 'Save to my library'}
          </button>
        )}
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
          Close
        </button>
      </div>
    </Modal>
  )
}