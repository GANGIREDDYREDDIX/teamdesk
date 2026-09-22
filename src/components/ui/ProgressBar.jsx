export default function ProgressBar({ value = 0, showLabel = true, size = 'sm' }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct === 100 ? 'var(--color-success)' : pct >= 70 ? 'var(--color-blue)' : pct >= 30 ? 'var(--color-warning)' : 'var(--color-p4)'
  const h = size === 'lg' ? 10 : size === 'md' ? 8 : 6

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div
        className="progress-bar"
        style={{ flex: 1, height: h }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${pct}%`}
      >
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', flexShrink: 0, fontWeight: 600, minWidth: 28 }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
