interface CatalogListTabsProps {
  activeTab: 'mine' | 'shared'
  onChange: (tab: 'mine' | 'shared') => void
  mineLabel: string
  sharedLabel: string
  sharedCount?: number
}

export default function CatalogListTabs({
  activeTab,
  onChange,
  mineLabel,
  sharedLabel,
  sharedCount,
}: CatalogListTabsProps) {
  const sharedText =
    sharedCount !== undefined && sharedCount > 0 ? `${sharedLabel} (${sharedCount})` : sharedLabel

  return (
    <div className="zone-subnav" style={{ marginBottom: 20 }}>
      <button
        type="button"
        className="zone-subnav-item"
        aria-current={activeTab === 'mine' ? 'page' : undefined}
        onClick={() => onChange('mine')}
        style={
          activeTab === 'mine'
            ? {
                background: 'var(--zone-accent)',
                color: 'var(--zone-accent-text)',
              }
            : undefined
        }
      >
        {mineLabel}
      </button>
      <button
        type="button"
        className="zone-subnav-item"
        aria-current={activeTab === 'shared' ? 'page' : undefined}
        onClick={() => onChange('shared')}
        style={
          activeTab === 'shared'
            ? {
                background: 'var(--zone-accent)',
                color: 'var(--zone-accent-text)',
              }
            : undefined
        }
      >
        {sharedText}
      </button>
    </div>
  )
}