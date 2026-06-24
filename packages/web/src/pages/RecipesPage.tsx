import { useEffect, useMemo, useState } from 'react'
import type { RecipeSummary, RecipeWithIngredients } from '@nutrition-tracker/shared'
import CatalogRow from '../components/layout/CatalogRow'
import { PageLoading } from '../components/layout/PageState'
import ZoneButton from '../components/layout/ZoneButton'
import LogRecipeModal from '../components/LogRecipeModal'
import RecipeEditorModal from '../components/RecipeEditorModal'
import RecipeViewModal from '../components/RecipeViewModal'
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
import { inputBase } from '../lib/styles'

interface RecipesPageProps {
  createTick?: number
}

export default function RecipesPage({ createTick = 0 }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null | undefined>(
    undefined,
  )
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loggingRecipe, setLoggingRecipe] = useState<RecipeSummary | null>(null)
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null)
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

  useEffect(() => {
    if (createTick > 0) setEditingRecipe(null)
  }, [createTick])

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

  if (loading) return <PageLoading message="Loading recipes..." />

  return (
    <div>
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
        <div className="day-accordion" style={{ padding: 20, marginBottom: 20 }}>
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
                htmlFor="recipe-search"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#52525b',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
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
              <label
                htmlFor="recipe-sort"
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
              marginTop: 16,
            }}
          >
            <span>
              Showing {visibleRecipes.length} of {recipes.length}{' '}
              {recipes.length === 1 ? 'recipe' : 'recipes'}
            </span>
            {hasActiveFilters && (
              <ZoneButton
                onClick={() => {
                  setSearchQuery('')
                  setSortBy('name-asc')
                }}
              >
                Clear filters
              </ZoneButton>
            )}
          </div>
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="day-accordion" style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
          <p style={{ margin: 0 }}>No recipes yet. Create one to speed up logging.</p>
        </div>
      ) : visibleRecipes.length === 0 ? (
        <div className="day-accordion" style={{ padding: 32, textAlign: 'center', color: '#71717a' }}>
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
                color: 'var(--zone-accent)',
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
        <div className="catalog-list">
          {visibleRecipes.map((recipe) => (
            <CatalogRow
              key={recipe.id}
              icon={recipe.icon}
              iconBg={recipe.iconBg}
              iconColor={recipe.iconColor}
              title={recipe.name}
              subtitle={`${recipe.ingredientCount} ingredients · ${recipe.defaultServings} servings/batch · ${recipe.perServingTotals.calories} kcal/serving`}
              onView={() => setViewingRecipeId(recipe.id)}
              actions={
                <>
                  <ZoneButton
                    variant="primary"
                    onClick={() => {
                      setLogSuccess(null)
                      setLoggingRecipe(recipe)
                    }}
                  >
                    Add to Log
                  </ZoneButton>
                  <ZoneButton onClick={() => setViewingRecipeId(recipe.id)}>View</ZoneButton>
                  <ZoneButton onClick={() => openEdit(recipe.id)}>Edit</ZoneButton>
                  <ZoneButton
                    variant="danger"
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deletingId === recipe.id}
                  >
                    {deletingId === recipe.id ? 'Deleting...' : 'Delete'}
                  </ZoneButton>
                </>
              }
            />
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

      {viewingRecipeId && (
        <RecipeViewModal recipeId={viewingRecipeId} onClose={() => setViewingRecipeId(null)} />
      )}
    </div>
  )
}