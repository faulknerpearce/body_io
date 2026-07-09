export type ZoneId = 'dashboard' | 'inputs' | 'outputs' | 'profile'

/** Brand blue — dashboard zone and center nav button. */
export const BRAND_BLUE = '#2b68e8'

/** Neutral zinc scale (shared chrome). */
export const neutrals = {
  textPrimary: '#18181b',
  textSecondary: '#3f3f46',
  textMuted: '#52525b',
  textSubtle: '#71717a',
  textFaint: '#a1a1aa',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  surface: '#ffffff',
  surfaceMuted: '#fafafa',
  surfaceHover: '#f4f4f5',
  pageBg: '#fafafa',
} as const

/** Semantic status colors (alerts, validation). */
export const status = {
  danger: {
    text: '#dc2626',
    textStrong: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  success: {
    text: '#059669',
    textStrong: '#065f46',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  warning: {
    text: '#d97706',
    textStrong: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  info: {
    text: '#1d4ed8',
    textStrong: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
} as const

/**
 * Radius scale (px).
 * Default card radius is `lg` (16).
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const

/** Shadow scale. */
export const shadow = {
  none: 'none',
  soft: '0 1px 3px rgba(0,0,0,0.05)',
  modal: '0 25px 50px -12px rgba(0,0,0,0.25)',
} as const

/**
 * Type scale (px) — keep titles on Space Grotesk via `var(--font-display)`.
 */
export const type = {
  eyebrow: 11,
  caption: 12,
  bodySm: 13,
  body: 14,
  titleSm: 20,
  titleMd: 22,
  titleLg: 28,
  titleXl: 32,
  display: 36,
} as const

export interface ZoneTokens {
  id: ZoneId
  accent: string
  accentMuted: string
  accentText: string
  bg: string
  cardBg: string
  cardBorder: string
  eyebrow: string
}

export const zoneTokens: Record<ZoneId, ZoneTokens> = {
  dashboard: {
    id: 'dashboard',
    accent: BRAND_BLUE,
    accentMuted: '#dbeafe',
    accentText: '#ffffff',
    bg: '#f0f4ff',
    cardBg: '#ffffff',
    cardBorder: '#bfdbfe',
    eyebrow: '#1e40af',
  },
  inputs: {
    id: 'inputs',
    accent: '#d97706',
    accentMuted: '#ffedd5',
    accentText: '#ffffff',
    bg: '#fffbf5',
    cardBg: '#ffffff',
    cardBorder: '#fed7aa',
    eyebrow: '#b45309',
  },
  outputs: {
    id: 'outputs',
    accent: '#0d9488',
    accentMuted: '#ccfbf1',
    accentText: '#ffffff',
    bg: '#f0fdfa',
    cardBg: '#ffffff',
    cardBorder: '#99f6e4',
    eyebrow: '#0f766e',
  },
  profile: {
    id: 'profile',
    accent: '#27272a',
    accentMuted: '#f4f4f5',
    accentText: '#ffffff',
    bg: '#fafafa',
    cardBg: '#ffffff',
    cardBorder: '#e4e4e7',
    eyebrow: '#52525b',
  },
}

export function zoneCssVars(zone: ZoneTokens): Record<string, string> {
  return {
    '--zone-accent': zone.accent,
    '--zone-accent-muted': zone.accentMuted,
    '--zone-accent-text': zone.accentText,
    '--zone-bg': zone.bg,
    '--zone-card-bg': zone.cardBg,
    '--zone-card-border': zone.cardBorder,
    '--zone-eyebrow': zone.eyebrow,
  }
}

/** Global CSS custom properties for neutrals, status, radius, shadow. */
export function globalCssVars(): Record<string, string> {
  return {
    '--color-text-primary': neutrals.textPrimary,
    '--color-text-secondary': neutrals.textSecondary,
    '--color-text-muted': neutrals.textMuted,
    '--color-text-subtle': neutrals.textSubtle,
    '--color-text-faint': neutrals.textFaint,
    '--color-border': neutrals.border,
    '--color-border-strong': neutrals.borderStrong,
    '--color-surface': neutrals.surface,
    '--color-surface-muted': neutrals.surfaceMuted,
    '--color-surface-hover': neutrals.surfaceHover,
    '--color-page-bg': neutrals.pageBg,
    '--color-danger': status.danger.text,
    '--color-danger-strong': status.danger.textStrong,
    '--color-danger-bg': status.danger.bg,
    '--color-danger-border': status.danger.border,
    '--color-success': status.success.text,
    '--color-success-strong': status.success.textStrong,
    '--color-success-bg': status.success.bg,
    '--color-success-border': status.success.border,
    '--color-warning': status.warning.text,
    '--color-warning-strong': status.warning.textStrong,
    '--color-warning-bg': status.warning.bg,
    '--color-warning-border': status.warning.border,
    '--color-info': status.info.text,
    '--color-info-strong': status.info.textStrong,
    '--color-info-bg': status.info.bg,
    '--color-info-border': status.info.border,
    '--radius-sm': `${radius.sm}px`,
    '--radius-md': `${radius.md}px`,
    '--radius-lg': `${radius.lg}px`,
    '--radius-xl': `${radius.xl}px`,
    '--radius-pill': `${radius.pill}px`,
    '--shadow-soft': shadow.soft,
    '--shadow-modal': shadow.modal,
  }
}
