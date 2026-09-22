const STATUS_CONFIG = {
  todo:            { label: 'To Do',           color: 'var(--color-status-todo)',       bg: 'var(--color-status-todo-bg)' },
  in_progress:     { label: 'In Progress',     color: 'var(--color-status-inprogress)', bg: 'var(--color-status-inprogress-bg)' },
  blocked:         { label: 'Blocked',         color: 'var(--color-status-blocked)',    bg: 'var(--color-status-blocked-bg)' },
  awaiting_review: { label: 'Awaiting Review', color: 'var(--color-status-review)',     bg: 'var(--color-status-review-bg)' },
  completed:       { label: 'Completed',       color: 'var(--color-status-completed)',  bg: 'var(--color-status-completed-bg)' },
  cancelled:       { label: 'Cancelled',       color: 'var(--color-status-cancelled)',  bg: 'var(--color-status-cancelled-bg)' },
}

export default function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo
  return (
    <span
      className="badge"
      style={{
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.color + '33',
        fontSize: '11px',
      }}
      aria-label={`Status: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  )
}

export { STATUS_CONFIG }
