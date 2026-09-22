import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNotifications } from '../../contexts/StoreContext.jsx'
import { useStore } from '../../contexts/StoreContext.jsx'
import NotificationPanel from '../notifications/NotificationPanel.jsx'
import styles from './Topbar.module.css'

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/my-tasks':    'My Tasks',
  '/employees':   'Employees',
  '/departments': 'Departments',
  '/settings':    'Settings',
}

export default function Topbar({ onMenuClick }) {
  const { user, isHead } = useAuth()
  const { actions } = useStore()
  const notifications = useNotifications(user?.id || '')
  const unread = notifications.filter(n => !n.read_at).length
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const pageTitle = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/tasks/') ? 'Task Details' : 'TeamDesk')

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const handleNotifOpen = () => {
    setNotifOpen(o => !o)
  }

  return (
    <header className={styles.topbar}>
      {/* Left: hamburger + title */}
      <div className={styles.left}>
        <button
          className={`btn btn-ghost btn-icon ${styles.menuBtn}`}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span className={styles.hamburger} aria-hidden="true">☰</span>
        </button>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      </div>

      {/* Right: notifications + user */}
      <div className={styles.right}>
        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className={`btn btn-ghost btn-icon ${styles.bellBtn}`}
            onClick={handleNotifOpen}
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            aria-expanded={notifOpen}
          >
            <span aria-hidden="true">🔔</span>
            {unread > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
              onMarkAllRead={() => {
                actions.markAllNotificationsRead(user.id)
                setNotifOpen(false)
              }}
              onNotifClick={(notif) => {
                actions.markNotificationRead(notif.id)
                if (notif.task_id) navigate(`/tasks/${notif.task_id}`)
                setNotifOpen(false)
              }}
            />
          )}
        </div>

        {/* User avatar */}
        <div className={styles.userChip}>
          <div
            className="avatar avatar-sm"
            style={{ background: user?.avatar_color }}
            aria-hidden="true"
          >
            {user?.initials}
          </div>
          <span className={styles.userName}>{user?.name}</span>
        </div>
      </div>
    </header>
  )
}
