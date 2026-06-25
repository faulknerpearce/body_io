import type { RecipeInput, RecipeWithIngredients } from './recipe.js'
import type { WorkoutInput, WorkoutWithExercises } from './workout.js'

export interface ShareUserResult {
  id: string
  displayName: string
  emailHint: string
}

export interface RecipeShareRecord {
  id: string
  recipeId: string
  ownerId: string
  sharedWithUserId: string
  ownerDisplayName: string
  sharedWithDisplayName: string
  savedCopyId: string | null
  createdAt: string
}

export interface WorkoutShareRecord {
  id: string
  workoutId: string
  ownerId: string
  sharedWithUserId: string
  ownerDisplayName: string
  sharedWithDisplayName: string
  savedCopyId: string | null
  createdAt: string
}

export function mapShareUserRow(row: {
  id: string
  display_name: string
  email_hint: string
}): ShareUserResult {
  return {
    id: row.id,
    displayName: row.display_name,
    emailHint: row.email_hint,
  }
}

export function mapRecipeShareRow(row: {
  id: string
  recipe_id: string
  owner_id: string
  shared_with_user_id: string
  owner_display_name: string
  shared_with_display_name: string
  saved_copy_id: string | null
  created_at: string
}): RecipeShareRecord {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    ownerId: row.owner_id,
    sharedWithUserId: row.shared_with_user_id,
    ownerDisplayName: row.owner_display_name,
    sharedWithDisplayName: row.shared_with_display_name,
    savedCopyId: row.saved_copy_id,
    createdAt: row.created_at,
  }
}

export function mapWorkoutShareRow(row: {
  id: string
  workout_id: string
  owner_id: string
  shared_with_user_id: string
  owner_display_name: string
  shared_with_display_name: string
  saved_copy_id: string | null
  created_at: string
}): WorkoutShareRecord {
  return {
    id: row.id,
    workoutId: row.workout_id,
    ownerId: row.owner_id,
    sharedWithUserId: row.shared_with_user_id,
    ownerDisplayName: row.owner_display_name,
    sharedWithDisplayName: row.shared_with_display_name,
    savedCopyId: row.saved_copy_id,
    createdAt: row.created_at,
  }
}

export function buildForkRecipeInput(source: RecipeWithIngredients): RecipeInput {
  return {
    name: source.name,
    description: source.description,
    icon: source.icon,
    iconBg: source.iconBg,
    iconColor: source.iconColor,
    defaultServings: source.defaultServings,
    ingredients: source.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: ingredient.amount,
      sortOrder: ingredient.sortOrder,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
      fat: ingredient.fat,
      fiber: ingredient.fiber,
      caffeine: ingredient.caffeine,
    })),
  }
}

export function buildForkWorkoutInput(source: WorkoutWithExercises): WorkoutInput {
  return {
    name: source.name,
    description: source.description,
    icon: source.icon,
    iconBg: source.iconBg,
    iconColor: source.iconColor,
    defaultDurationMinutes: source.defaultDurationMinutes,
    defaultCalories: source.defaultCalories,
    exercises: source.exercises.map((exercise) => ({
      name: exercise.name,
      sortOrder: exercise.sortOrder,
      targetReps: exercise.targetReps,
    })),
  }
}