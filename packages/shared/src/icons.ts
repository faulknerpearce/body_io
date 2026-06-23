export interface IconOption {
  icon: string
  label: string
  bg: string
  color: string
}

export const DEFAULT_ICON = 'fa-utensils'
export const DEFAULT_ICON_BG = '#f4f4f5'
export const DEFAULT_ICON_COLOR = '#71717a'

// Icon set used by the Add/Edit Food Entry modal. All classes must exist in
// Font Awesome Free 6.5.1 (loaded via index.html). Entries are grouped loosely
// by category for readability — order does not affect rendering.
export const iconOptions: readonly IconOption[] = [
  // Default / generic
  { icon: 'fa-utensils', label: 'Meal', bg: '#f4f4f5', color: '#71717a' },
  { icon: 'fa-bowl-food', label: 'Bowl', bg: '#f4f4f5', color: '#52525b' },

  // Hot drinks
  { icon: 'fa-coffee', label: 'Coffee', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-mug-hot', label: 'Hot drink', bg: '#fee2e2', color: '#e11d48' },
  { icon: 'fa-mug-saucer', label: 'Tea', bg: '#ecfeff', color: '#0e7490' },
  { icon: 'fa-glass-water', label: 'Water', bg: '#e0f2fe', color: '#0284c7' },

  // Cold drinks / alcohol
  { icon: 'fa-wine-bottle', label: 'Bottle', bg: '#e0f2fe', color: '#0284c7' },
  { icon: 'fa-wine-glass', label: 'Wine', bg: '#fce7f3', color: '#be185d' },
  { icon: 'fa-beer-mug-empty', label: 'Beer', bg: '#fef3c7', color: '#b45309' },
  { icon: 'fa-martini-glass-citrus', label: 'Cocktail', bg: '#fef9c3', color: '#a16207' },
  { icon: 'fa-blender', label: 'Shake', bg: '#e0f2fe', color: '#0284c7' },

  // Fruits & vegetables
  { icon: 'fa-apple-alt', label: 'Fruit', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-lemon', label: 'Lemon', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-carrot', label: 'Carrot', bg: '#ffedd5', color: '#ea580c' },
  { icon: 'fa-pepper-hot', label: 'Pepper', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-mushroom', label: 'Mushroom', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-leaf', label: 'Plant', bg: '#dcfce7', color: '#16a34a' },

  // Proteins
  { icon: 'fa-drumstick-bite', label: 'Meat', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-bacon', label: 'Bacon', bg: '#fee2e2', color: '#b91c1c' },
  { icon: 'fa-fish', label: 'Fish', bg: '#dbeafe', color: '#2563eb' },
  { icon: 'fa-egg', label: 'Eggs', bg: '#fef9c3', color: '#ca8a04' },
  { icon: 'fa-cheese', label: 'Cheese', bg: '#fef3c7', color: '#d97706' },

  // Grains & bakery
  { icon: 'fa-bread-slice', label: 'Bread', bg: '#fef3c7', color: '#d97706' },
  { icon: 'fa-croissant', label: 'Croissant', bg: '#fef3c7', color: '#b45309' },
  { icon: 'fa-bowl-rice', label: 'Rice', bg: '#f5f5f4', color: '#78716c' },
  { icon: 'fa-burger', label: 'Burger', bg: '#fef3c7', color: '#92400e' },
  { icon: 'fa-pizza-slice', label: 'Pizza', bg: '#fee2e2', color: '#dc2626' },
  { icon: 'fa-hotdog', label: 'Hot dog', bg: '#fef3c7', color: '#b45309' },
  { icon: 'fa-taco', label: 'Taco', bg: '#fef3c7', color: '#b45309' },

  // Snacks & sweets
  { icon: 'fa-cookie', label: 'Cookie', bg: '#f5d0a9', color: '#92400e' },
  { icon: 'fa-cookie-bite', label: 'Snack', bg: '#f5d0a9', color: '#92400e' },
  { icon: 'fa-ice-cream', label: 'Ice cream', bg: '#fce7f3', color: '#be185d' },
  { icon: 'fa-candy-cane', label: 'Treat', bg: '#f3e8ff', color: '#9333ea' },
  { icon: 'fa-popcorn', label: 'Popcorn', bg: '#fef9c3', color: '#a16207' },

  // Energy / supplements
  { icon: 'fa-bolt', label: 'Energy', bg: '#fef9c3', color: '#ca8a04' },
]
