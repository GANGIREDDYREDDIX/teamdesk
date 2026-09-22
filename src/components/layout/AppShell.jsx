import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import styles from './AppShell.module.css'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => { if (mq.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main id="main-content" className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
