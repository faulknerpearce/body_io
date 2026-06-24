import { useEffect, useMemo, useState } from 'react'
import type { RecipeSummary, RecipeWithIngredients } from '@nutrition-tracker/shared'
import LogRecipeModal from '../components/LogRecipeModal'
import RecipeEditorModal from '../components/RecipeEditorModal'
import {
  filterAndSortRecipes,
  RECIPE_SORT_OPTIONS,
  type RecipeSortOption,
} from '../lib/recipeFilters'
import {
  deleteRecipe,
  fetchRecipe,
  fetchRecipeSummaries,
  logRecipe,
  saveRecipe,
} from '../lib/recipes'
import { cardSurface, iconTileMd, inputBase, pageTitle, sectionHeader } from '../lib/styles'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null | undefined>(
    undefined,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loggingRecipe, setLoggingRecipe] = useState<RecipeSummary | null>(null)
  const [logSuccess, setLogSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<RecipeSortOption>('name-asc')

  const visibleRecipes = useMemo(
    () => filterAndSortRecipes(recipes, searchQuery, sortBy),
    [recipes, searchQuery, sortBy],
  )
  const hasActiveFilters = searchQuery.trim() !== '' || sortBy !== 'name-asc'

  const loadRecipes = async () => {
    const data = await fetchRecipeSummaries()
    setRecipes(data)
  }

  useEffect(() => {
    fetchRecipeSummaries()
      .then((data) => {
        setRecipes(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load recipes')
        setLoading(false)
      })
  }, [])

  const openCreate = () => setEditingRecipe(null)

  const openEdit = async (id: string) => {
    try {
      setEditingRecipe(await fetchRecipe(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    }
  }

  const handleLogRecipe = async (servings: number) => {
    if (!loggingRecipe) return
    await logRecipe({ recipeId: loggingRecipe.id, servings })
    setLogSuccess(`Added ${loggingRecipe.name} to today's food log.`)
    setLoggingRecipe(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      await deleteRecipe(id)
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
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
        Loading recipes...
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
            Recipes
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', margin: '8px 0 0 0' }}>
            Save meals with ingredients, then quick-log them from the food log.
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
          New Recipe
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

      {recipes.length > 0 && (
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
              <label htmlFor="recipe-search" style={{ fontSize: 12, fontWeight: 500, color: '#52525b', display: 'block', marginBottom: 6 }}>
                Search recipes
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
                  id="recipe-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  style={{ ...inputBase, paddingLeft: 38 }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="recipe-sort" style={{ fontSize: 12, fontWeight: 500, color: '#52525b', display: 'block', marginBottom: 6 }}>
                Sort by
              </label>
              <select
                id="recipe-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as RecipeSortOption)}
                style={{ ...inputBase, paddingRight: 12 }}
              >
                {RECIPE_SORT_OPTIONS.map((option) => (
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
              Showing {visibleRecipes.length} of {recipes.length}{' '}
              {recipes.length === 1 ? 'recipe' : 'recipes'}
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

      {recipes.length === 0 ? (
        <div style={{ ...cardSurface, padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: 0 }}>No recipes yet. Create one to speed up logging.</p>
        </div>
      ) : visibleRecipes.length === 0 ? (
        <div style={{ ...cardSurface, padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#52525b' }}>No matching recipes</p>
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
          {visibleRecipes.map((recipe) => (
            <div
              key={recipe.id}
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
                <div style={{ ...iconTileMd, background: recipe.iconBg }}>
                  <i
                    className={`fa-solid ${recipe.icon}`}
                    style={{ color: recipe.iconColor, fontSize: 18 }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#18181b' }}>{recipe.name}</div>
                  <div style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>
                    {recipe.ingredientCount} ingredients · {recipe.defaultServings} servings/batch ·{' '}
                    {recipe.perServingTotals.calories} kcal/serving
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLogSuccess(null)
                    setLoggingRecipe(recipe)
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
                  onClick={() => openEdit(recipe.id)}
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
                  onClick={() => handleDelete(recipe.id)}
                  disabled={deletingId === recipe.id}
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
                  {deletingId === recipe.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRecipe !== undefined && (
        <RecipeEditorModal
          recipe={editingRecipe ?? undefined}
          onClose={() => setEditingRecipe(undefined)}
          onSave={async (input) => {
            await saveRecipe(input, editingRecipe?.id)
            await loadRecipes()
          }}
        />
      )}

      {loggingRecipe && (
        <LogRecipeModal
          recipe={loggingRecipe}
          onLog={handleLogRecipe}
          onClose={() => setLoggingRecipe(null)}
        />
      )}
    </div>
  )
}