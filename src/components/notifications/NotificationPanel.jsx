import { formatRelative } from '../../lib/dateUtils.js'
import styles from './NotificationPanel.module.css'

const NOTIF_ICONS = {
  task_assigned:      '📋',
  task_reassigned:    '🔄',
  priority_changed:   '🔺',
  deadline_changed:   '📅',
  blocker_reported:   '🚧',
  work_submitted:     '📤',
  review_decision:    '✅',
  extension_requested:'🕐',
  extension_decided:  '🕐',
  comment_added:      '💬',
  deadline_reminder:  '⏰',
  overdue_alert:      '🔴',
  review_overdue:     '⚠',
  task_cancelled:     '✕',
}

export default function NotificationPanel({ notifications, onClose, onMarkAllRead, onNotifClick }) {
  const unread = notifications.filter(n => !n.read_at).length

  return (
    <div className={styles.panel} role="dialog" aria-label="Notifications" aria-modal="false">
      <div className={styles.header}>
        <div>
          <span className={styles.title}>Notifications</span>
          {unread > 0 && <span className={styles.unreadBadge}>{unread} new</span>}
        </div>
        <div style={{ display:'flex', gap:'var(--space-2)' }}>
          {unread > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close notifications">✕</button>
        </div>
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize:32 }}>🔔</span>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              className={`${styles.item} ${!n.read_at ? styles.unread : ''}`}
              onClick={() => onNotifClick(n)}
            >
              <span className={styles.icon}>{NOTIF_ICONS[n.type] || '📌'}</span>
              <div className={styles.content}>
                <p className={styles.message}>{n.message}</p>
                <p className={styles.time}>{formatRelative(n.created_at)}</p>
              </div>
              {!n.read_at && <span className={styles.dot} aria-label="Unread" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
