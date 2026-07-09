import type { CSSProperties } from 'react'
import { neutrals, radius, shadow, status, type } from './design-tokens'

/**
 * Shared inline-style tokens built on design-tokens.
 * Prefer `components/ui/*` primitives for new UI; these remain for gradual migration.
 *
 * Primary actions use zone CSS vars (`var(--zone-accent)`) so they inherit the
 * active zone from ZoneThemeProvider (defaults to dashboard brand blue).
 */
export const cardSurface: CSSProperties = {
  background: neutrals.surface,
  border: `1px solid ${neutrals.border}`,
  borderRadius: radius.lg,
  boxShadow: shadow.soft,
}

export const subtleSurface: CSSProperties = {
  background: neutrals.surfaceMuted,
  border: `1px solid ${neutrals.border}`,
  borderRadius: radius.lg,
}

export const iconTileSm: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: radius.md,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export const iconTileMd: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: radius.lg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

export const sectionHeader: CSSProperties = {
  fontSize: type.eyebrow,
  fontWeight: 600,
  letterSpacing: '1.5px',
  color: 'var(--zone-eyebrow)',
  textTransform: 'uppercase',
  margin: '0 0 4px 0',
}

export const pageTitle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: type.display,
  margin: 0,
  fontWeight: 600,
  letterSpacing: '-0.03em',
  color: neutrals.textPrimary,
}

export const pill: CSSProperties = {
  padding: '8px 16px',
  borderRadius: radius.pill,
  fontSize: type.bodySm,
  fontWeight: 500,
  textDecoration: 'none',
}

export const primaryButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: 'var(--zone-accent)',
  color: 'var(--zone-accent-text)',
  border: '1px solid var(--zone-accent)',
  borderRadius: radius.md,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  flexShrink: 0,
}

export const inputBase: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${neutrals.border}`,
  borderRadius: radius.md,
  fontSize: type.body,
  outline: 'none',
  boxSizing: 'border-box',
}

export const labelBase: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: neutrals.textMuted,
  display: 'block',
  marginBottom: 6,
}

export const modalTitle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: type.titleMd,
  fontWeight: 600,
  margin: 0,
  letterSpacing: '-0.02em',
  color: neutrals.textPrimary,
}

export const modalSubtitle: CSSProperties = {
  fontSize: 12,
  color: neutrals.textSubtle,
  margin: '4px 0 0 0',
}

export const catalogItemCard: CSSProperties = {
  padding: '14px 16px',
  borderRadius: radius.lg,
  border: `1px solid ${neutrals.border}`,
  background: neutrals.surfaceMuted,
}

export const summaryPanel: CSSProperties = {
  padding: 16,
  borderRadius: radius.lg,
  background: status.success.bg,
  color: status.success.textStrong,
  fontSize: type.bodySm,
}

export const modalFooterButton: CSSProperties = {
  padding: '10px 20px',
  borderRadius: radius.md,
  border: `1px solid ${neutrals.border}`,
  background: neutrals.surface,
  fontSize: type.bodySm,
  fontWeight: 500,
  cursor: 'pointer',
  color: neutrals.textMuted,
}

export const modalPrimaryButton: CSSProperties = {
  padding: '10px 20px',
  borderRadius: radius.md,
  border: '1px solid var(--zone-accent)',
  background: 'var(--zone-accent)',
  color: 'var(--zone-accent-text)',
  fontSize: type.bodySm,
  fontWeight: 500,
  cursor: 'pointer',
}
