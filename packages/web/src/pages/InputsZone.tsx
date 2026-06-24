import { useState } from 'react'
import type { AppRoute } from '../lib/routing'
import PageHeader from '../components/layout/PageHeader'
import PageShell from '../components/layout/PageShell'
import ZoneButton from '../components/layout/ZoneButton'
import ZoneSubNav from '../components/layout/ZoneSubNav'
import InputsPage from './InputsPage'
import RecipesPage from './RecipesPage'

interface InputsZoneProps {
  route: Extract<AppRoute, 'inputs' | 'inputs/recipes'>
}

export default function InputsZone({ route }: InputsZoneProps) {
  const isRecipes = route === 'inputs/recipes'
  const [createRecipeTick, setCreateRecipeTick] = useState(0)

  return (
    <PageShell zone="inputs">
      <PageHeader
        eyebrow={isRecipes ? 'Inputs › Recipes' : 'Inputs'}
        title={isRecipes ? 'Recipes' : 'Food Log'}
        description={
          isRecipes
            ? 'Saved meal templates for quick logging.'
            : 'Expand a day to view, add, or edit food entries.'
        }
        actions={
          isRecipes ? (
            <ZoneButton variant="primary" onClick={() => setCreateRecipeTick((t) => t + 1)}>
              <i className="fa-solid fa-plus" aria-hidden="true" /> New Recipe
            </ZoneButton>
          ) : undefined
        }
      />
      <ZoneSubNav
        active={route}
        items={[
          { route: 'inputs', label: 'Log' },
          { route: 'inputs/recipes', label: 'Recipes' },
        ]}
      />
      {isRecipes ? <RecipesPage createTick={createRecipeTick} /> : <InputsPage />}
    </PageShell>
  )
}