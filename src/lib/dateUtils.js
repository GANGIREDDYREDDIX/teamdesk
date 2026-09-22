import { format, isToday, isTomorrow, isYesterday, differenceInDays, parseISO, isPast, isWithinInterval, addDays } from 'date-fns'

/**
 * Returns a human-readable deadline label and whether it's overdue.
 */
export function getDeadlineInfo(deadlineDate, deadlineTime, status) {
  if (!deadlineDate) return { label: 'No deadline', isOverdue: false, isDueToday: false, color: 'var(--color-text-muted)' }

  const isDone = ['completed', 'cancelled'].includes(status)
  const dt = new Date(deadlineDate + 'T' + (deadlineTime || '17:00') + ':00')
  const now = new Date()
  const isOverdue = !isDone && isPast(dt)
  const isDueToday = !isDone && isToday(dt)
  const isDueTomorrow = !isDone && isTomorrow(dt)
  const diffDays = differenceInDays(dt, now)

  let label = format(dt, 'MMM d, yyyy')
  if (isDueToday) label = `Due Today at ${format(dt, 'h:mm a')}`
  else if (isDueTomorrow) label = `Due Tomorrow`
  else if (isOverdue) {
    const daysAgo = Math.abs(diffDays)
    label = `${daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo + ' days ago'} (${format(dt, 'MMM d')})`
  }
  else if (diffDays <= 7) label = `${format(dt, 'EEE, MMM d')}`

  const color = isOverdue
    ? 'var(--color-danger)'
    : isDueToday
    ? 'var(--color-warning)'
    : 'var(--color-text-secondary)'

  return { label, isOverdue, isDueToday, color, dt, diffDays }
}

export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), fmt) } catch { return dateStr }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), 'MMM d, yyyy h:mm a') } catch { return dateStr }
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = parseISO(dateStr)
    const now = new Date()
    const diff = differenceInDays(now, d)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 7)  return `${diff} days ago`
    return format(d, 'MMM d, yyyy')
  } catch { return dateStr }
}

export function isTaskOverdue(task) {
  if (!task?.deadline_date) return false
  if (['completed','cancelled'].includes(task.status)) return false
  const dt = new Date(task.deadline_date + 'T' + (task.deadline_time || '17:00') + ':00')
  return isPast(dt)
}

export function isTaskDueToday(task) {
  if (!task?.deadline_date) return false
  if (['completed','cancelled'].includes(task.status)) return false
  const dt = new Date(task.deadline_date + 'T' + (task.deadline_time || '17:00') + ':00')
  return isToday(dt)
}

export function isTaskDueSoon(task, days = 3) {
  if (!task?.deadline_date) return false
  const dt = new Date(task.deadline_date + 'T' + (task.deadline_time || '17:00') + ':00')
  const now = new Date()
  return isWithinInterval(dt, { start: now, end: addDays(now, days) })
}
