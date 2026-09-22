const PRIORITY_CONFIG = {
  p1: { label: 'P1 Critical', color: 'var(--color-p1)', bg: 'var(--color-p1-bg)', border: 'var(--color-p1-border)', dot: '🔴' },
  p2: { label: 'P2 High',     color: 'var(--color-p2)', bg: 'var(--color-p2-bg)', border: 'var(--color-p2-border)', dot: '🟠' },
  p3: { label: 'P3 Medium',   color: 'var(--color-p3)', bg: 'var(--color-p3-bg)', border: 'var(--color-p3-border)', dot: '🔵' },
  p4: { label: 'P4 Low',      color: 'var(--color-p4)', bg: 'var(--color-p4-bg)', border: 'var(--color-p4-border)', dot: '⚪' },
}

export default function PriorityBadge({ priority, size = 'sm' }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.p3
  const fz = size === 'xs' ? '10px' : size === 'lg' ? '13px' : '11px'

  return (
    <span
      className="badge"
      style={{
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.border,
        fontSize: fz,
      }}
      aria-label={cfg.label}
    >
      <span aria-hidden="true" style={{ fontSize: '8px', lineHeight: 1 }}>●</span>
      {cfg.label}
    </span>
  )
}

export { PRIORITY_CONFIG }
