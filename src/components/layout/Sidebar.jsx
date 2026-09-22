import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import styles from './Sidebar.module.css'

const NAV_HEAD = [
  { to: '/dashboard',   icon: '⊞', label: 'Dashboard' },
  { to: '/employees',   icon: '👥', label: 'Employees' },
  { to: '/departments', icon: '🏢', label: 'Departments' },
  { to: '/settings',    icon: '⚙', label: 'Settings' },
]

const NAV_EMPLOYEE = [
  { to: '/my-tasks', icon: '✓', label: 'My Tasks' },
  { to: '/settings', icon: '⚙', label: 'Settings' },
]

export default function Sidebar({ open, onClose }) {
  const { user, isHead, signOut } = useAuth()
  const navigate = useNavigate()
  const navItems = isHead ? NAV_HEAD : NAV_EMPLOYEE

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <nav
      className={`${styles.sidebar} ${open ? styles.open : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo + Brand */}
      <div className={styles.brand}>
        <div className={styles.logo} aria-hidden="true">TD</div>
        <div>
          <div className={styles.brandName}>TeamDesk</div>
          <div className={styles.brandRole}>{isHead ? 'Head Dashboard' : 'My Workspace'}</div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close navigation"
        >
          ✕
        </button>
      </div>

      {/* Nav Links */}
      <div className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            onClick={onClose}
          >
            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Bottom: User + Logout */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div
            className="avatar avatar-sm"
            style={{ background: user?.avatar_color || 'var(--color-navy)' }}
            aria-hidden="true"
          >
            {user?.initials}
          </div>
          <div className={styles.userText}>
            <div className={styles.userName}>{user?.name}</div>
            <div className={styles.userRole}>{isHead ? 'Department Head' : 'Employee'}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className={styles.signOutBtn}
          aria-label="Sign out"
        >
          <span aria-hidden="true">⏏</span>
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  )
}
