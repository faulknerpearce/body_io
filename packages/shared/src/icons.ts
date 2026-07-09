export interface IconOption {
  icon: string
  label: string
  bg: string
  color: string
}

export const DEFAULT_ICON = 'fa-utensils'
export const DEFAULT_ICON_BG = '#f4f4f5'
export const DEFAULT_ICON_COLOR = '#71717a'

/**
 * Soft, near-white tints — same hue family as before, much lower saturation
 * so tiles read as minimal UI chrome rather than candy stickers.
 * Glyph `color` values are kept so existing color identity stays intact.
 */
export const foodIconOptions: readonly IconOption[] = [
  { icon: 'fa-utensils', label: 'Meal', bg: '#f4f4f5', color: '#52525b' },
  { icon: 'fa-bowl-food', label: 'Bowl', bg: '#f4f4f5', color: '#71717a' },
  { icon: 'fa-plate-wheat', label: 'Plate', bg: '#fbf7ee', color: '#d97706' },
  { icon: 'fa-fire', label: 'Calories', bg: '#fbf1e8', color: '#ea580c' },
  { icon: 'fa-dumbbell', label: 'Protein', bg: '#eef7f2', color: '#059669' },
  { icon: 'fa-wheat-awn', label: 'Carbs', bg: '#fbf7ee', color: '#d97706' },
  { icon: 'fa-bacon', label: 'Fat', bg: '#faf0f5', color: '#db2777' },
  { icon: 'fa-seedling', label: 'Fiber', bg: '#f3f8eb', color: '#65a30d' },
  { icon: 'fa-mug-hot', label: 'Caffeine', bg: '#f3f0fa', color: '#7c3aed' },
  { icon: 'fa-glass-water', label: 'Water', bg: '#eef6fb', color: '#0284c7' },
  { icon: 'fa-blender', label: 'Smoothie', bg: '#eff9fa', color: '#0d9488' },
  { icon: 'fa-apple-whole', label: 'Fruit', bg: '#faf8eb', color: '#ca8a04' },
  { icon: 'fa-carrot', label: 'Vegetables', bg: '#faf1e8', color: '#ea580c' },
  { icon: 'fa-egg', label: 'Eggs', bg: '#faf8eb', color: '#ca8a04' },
  { icon: 'fa-fish', label: 'Fish', bg: '#eef3fb', color: '#2563eb' },
  { icon: 'fa-drumstick-bite', label: 'Poultry', bg: '#faeeee', color: '#dc2626' },
  { icon: 'fa-cheese', label: 'Dairy', bg: '#fbf7ee', color: '#d97706' },
  { icon: 'fa-bread-slice', label: 'Bread', bg: '#f8f4ec', color: '#b45309' },
  { icon: 'fa-bowl-rice', label: 'Grains', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-chart-pie', label: 'Macros', bg: '#edf7f5', color: '#134e4b' },
]

/** @deprecated Alias for foodIconOptions */
export const iconOptions = foodIconOptions

/** Icons for workout templates — aligned with activity outputs. */
export const workoutIconOptions: readonly IconOption[] = [
  { icon: 'fa-dumbbell', label: 'Strength', bg: '#f0f8f4', color: '#134e4b' },
  { icon: 'fa-heart-pulse', label: 'Cardio', bg: '#faeeee', color: '#dc2626' },
  { icon: 'fa-person-running', label: 'Run', bg: '#eef3fb', color: '#2563eb' },
  { icon: 'fa-person-biking', label: 'Cycle', bg: '#eef6fb', color: '#0284c7' },
  { icon: 'fa-person-swimming', label: 'Swim', bg: '#eff9fa', color: '#0d9488' },
  { icon: 'fa-person-walking', label: 'Walk', bg: '#f4f4f5', color: '#52525b' },
  { icon: 'fa-weight-hanging', label: 'Weights', bg: '#fbf7ee', color: '#d97706' },
  { icon: 'fa-fire', label: 'Burn', bg: '#fbf1e8', color: '#ea580c' },
  { icon: 'fa-bolt', label: 'HIIT', bg: '#faf8eb', color: '#ca8a04' },
  { icon: 'fa-stopwatch', label: 'Timed', bg: '#f3f0fa', color: '#7c3aed' },
  { icon: 'fa-shoe-prints', label: 'Steps', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-mountain', label: 'Hike', bg: '#eef8f0', color: '#16a34a' },
  { icon: 'fa-spa', label: 'Mobility', bg: '#f3f8eb', color: '#65a30d' },
  { icon: 'fa-clock', label: 'Duration', bg: '#edf7f5', color: '#134e4b' },
]

export const DEFAULT_WORKOUT_ICON_OPTION = workoutIconOptions[0]
