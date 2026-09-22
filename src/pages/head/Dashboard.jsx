import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../contexts/StoreContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getDeadlineInfo, formatRelative, isTaskOverdue, isTaskDueToday, isTaskDueSoon } from '../../lib/dateUtils.js'
import { getDashboardStats, getOpenTaskCount } from '../../lib/mockStore.js'
import PriorityBadge from '../../components/ui/PriorityBadge.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import CreateTaskModal from '../../components/tasks/CreateTaskModal.jsx'
import styles from './Dashboard.module.css'
import { format, isToday, addDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

export default function HeadDashboard() {
  const { tasks, users, departments, extension_requests } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterOverdue, setFilterOverdue] = useState(false)
  const [agendaTab, setAgendaTab] = useState('today')
  const [sortField, setSortField] = useState('deadline')
  const [sortDir, setSortDir] = useState('asc')

  const employees = users.filter(u => u.role === 'employee')
  const stats = getDashboardStats()

  const pendingExtensions = extension_requests.filter(e => e.status === 'pending')

  // ── Filtered + sorted task table ──────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let list = [...tasks].filter(t => t.status !== 'cancelled' || filterStatus === 'cancelled')

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        users.find(u => u.id === t.assigned_to)?.name.toLowerCase().includes(q)
      )
    }
    if (filterEmployee) list = list.filter(t => t.assigned_to === filterEmployee)
    if (filterDept) list = list.filter(t => t.department_id === filterDept)
    if (filterPriority) list = list.filter(t => t.priority === filterPriority)
    if (filterStatus) list = list.filter(t => t.status === filterStatus)
    if (filterOverdue) list = list.filter(t => isTaskOverdue(t))

    // Default sort: overdue first → earliest deadline → priority
    list.sort((a, b) => {
      const aOver = isTaskOverdue(a)
      const bOver = isTaskOverdue(b)
      if (sortField === 'deadline') {
        if (aOver && !bOver) return -1
        if (!aOver && bOver) return 1
        const aDt = new Date(a.deadline_date + 'T' + (a.deadline_time || '17:00'))
        const bDt = new Date(b.deadline_date + 'T' + (b.deadline_time || '17:00'))
        return sortDir === 'asc' ? aDt - bDt : bDt - aDt
      }
      if (sortField === 'priority') {
        const pOrder = { p1:1, p2:2, p3:3, p4:4 }
        return sortDir === 'asc' ? pOrder[a.priority] - pOrder[b.priority] : pOrder[b.priority] - pOrder[a.priority]
      }
      if (sortField === 'progress') return sortDir === 'asc' ? a.progress - b.progress : b.progress - a.progress
      if (sortField === 'reference') return sortDir === 'asc' ? a.reference.localeCompare(b.reference) : b.reference.localeCompare(a.reference)
      return 0
    })

    return list
  }, [tasks, users, search, filterEmployee, filterDept, filterPriority, filterStatus, filterOverdue, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortArrow = ({ field }) => sortField === field
    ? <span aria-hidden="true" style={{ marginLeft:4, opacity:0.7 }}>{sortDir==='asc'?'↑':'↓'}</span>
    : <span aria-hidden="true" style={{ marginLeft:4, opacity:0.2 }}>↕</span>

  // ── Needs Attention ────────────────────────────────────────────────────────
  const needsAttention = useMemo(() => {
    const items = []
    tasks.filter(t => t.status === 'blocked').forEach(t =>
      items.push({ type:'blocker', task:t, label:`Blocked: ${t.title}`, sub: t.blocker_reason })
    )
    tasks.filter(t => isTaskOverdue(t) && t.status !== 'awaiting_review').forEach(t =>
      items.push({ type:'overdue', task:t, label:`Overdue: ${t.title}`, sub: users.find(u=>u.id===t.assigned_to)?.name })
    )
    tasks.filter(t => t.status === 'awaiting_review').forEach(t =>
      items.push({ type:'review', task:t, label:`Pending Review: ${t.title}`, sub: users.find(u=>u.id===t.assigned_to)?.name })
    )
    pendingExtensions.forEach(e => {
      const t = tasks.find(t => t.id === e.task_id)
      const req = users.find(u => u.id === e.requested_by)
      if (t) items.push({ type:'extension', task:t, ext:e, label:`Extension Request: ${t.title}`, sub: req?.name })
    })
    return items
  }, [tasks, users, pendingExtensions])

  // ── Agenda ────────────────────────────────────────────────────────────────
  const agendaTasks = useMemo(() => {
    const now = new Date()
    const today = { start: startOfDay(now), end: endOfDay(now) }
    const next3 = { start: startOfDay(now), end: endOfDay(addDays(now, 3)) }
    const thisWeek = { start: startOfDay(now), end: endOfDay(addDays(now, 7)) }

    const range = agendaTab === 'today' ? today : agendaTab === 'next3' ? next3 : thisWeek

    return tasks
      .filter(t => {
        if (['completed','cancelled'].includes(t.status)) return false
        const dt = new Date(t.deadline_date + 'T' + (t.deadline_time || '17:00') + ':00')
        return isWithinInterval(dt, range)
      })
      .sort((a,b) => new Date(a.deadline_date) - new Date(b.deadline_date))
  }, [tasks, agendaTab])

  // ── Summary card click → filter ───────────────────────────────────────────
  const handleCardClick = (statusFilter, overdueFilter = false) => {
    setFilterStatus(statusFilter)
    setFilterOverdue(overdueFilter)
    setSearch('')
    setFilterEmployee('')
    setFilterDept('')
    setFilterPriority('')
  }

  const SUMMARY_CARDS = [
    { label:'Open Tasks',        value:stats.open,             color:'#2563EB', bg:'#EFF6FF', icon:'📋', onClick:()=>handleCardClick('') },
    { label:'Due Today',         value:stats.dueToday,         color:'#D97706', bg:'#FFFBEB', icon:'📅', onClick:()=>{ setFilterOverdue(false); setFilterStatus(''); } },
    { label:'Overdue',           value:stats.overdue,          color:'#DC2626', bg:'#FEF2F2', icon:'🔴', onClick:()=>handleCardClick('', true) },
    { label:'Blocked',           value:stats.blocked,          color:'#7C3AED', bg:'#F5F3FF', icon:'🚧', onClick:()=>handleCardClick('blocked') },
    { label:'Awaiting Review',   value:stats.awaitingReview,   color:'#D97706', bg:'#FFFBEB', icon:'📤', onClick:()=>handleCardClick('awaiting_review') },
    { label:'Completed This Week',value:stats.completedThisWeek,color:'#16A34A',bg:'#F0FDF4', icon:'✅', onClick:()=>handleCardClick('completed') },
  ]

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of all tasks • {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button
          id="assign-task-btn"
          className="btn btn-primary btn-lg"
          onClick={() => setShowCreate(true)}
        >
          <span aria-hidden="true">+</span> Assign Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        {SUMMARY_CARDS.map(c => (
          <button
            key={c.label}
            className={styles.summaryCard}
            onClick={c.onClick}
            style={{ '--card-color': c.color, '--card-bg': c.bg }}
            aria-label={`${c.label}: ${c.value}. Click to filter.`}
          >
            <div className={styles.summaryIcon}>{c.icon}</div>
            <div className={styles.summaryValue}>{c.value}</div>
            <div className={styles.summaryLabel}>{c.label}</div>
          </button>
        ))}
      </div>

      {/* Main grid: table + panels */}
      <div className={styles.mainGrid}>

        {/* Left: Task Table */}
        <div style={{ minWidth: 0 }}>

          {/* Filters */}
          <div className={`card ${styles.filterBar}`}>
            <div className={`${styles.searchWrap} search-input-wrapper`}>
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="form-input search-input"
                placeholder="Search tasks, references, employees…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search tasks"
              />
            </div>
            <div className={styles.filterRow}>
              <select className="form-select" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} aria-label="Filter by employee">
                <option value="">All Employees</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <select className="form-select" value={filterDept} onChange={e => setFilterDept(e.target.value)} aria-label="Filter by department">
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="form-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} aria-label="Filter by priority">
                <option value="">All Priorities</option>
                <option value="p1">P1 Critical</option>
                <option value="p2">P2 High</option>
                <option value="p3">P3 Medium</option>
                <option value="p4">P4 Low</option>
              </select>
              <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="awaiting_review">Awaiting Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <label className="checkbox-wrapper" style={{ flexShrink:0 }}>
                <input type="checkbox" checked={filterOverdue} onChange={e => setFilterOverdue(e.target.checked)} />
                <span style={{ fontSize:'var(--font-size-sm)', fontWeight:500 }}>Overdue only</span>
              </label>
              {(search || filterEmployee || filterDept || filterPriority || filterStatus || filterOverdue) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterEmployee(''); setFilterDept(''); setFilterPriority(''); setFilterStatus(''); setFilterOverdue(false) }}>
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ marginTop:'var(--space-4)' }}>
            <div className="table-wrapper">
              <table aria-label="Tasks">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('reference')} style={{width:96}}>Ref <SortArrow field="reference" /></th>
                    <th>Title</th>
                    <th>Employee</th>
                    <th onClick={() => handleSort('priority')} style={{width:120}}>Priority <SortArrow field="priority" /></th>
                    <th style={{width:140}}>Status</th>
                    <th onClick={() => handleSort('deadline')} style={{width:160}}>Deadline <SortArrow field="deadline" /></th>
                    <th onClick={() => handleSort('progress')} style={{width:120}}>Progress <SortArrow field="progress" /></th>
                    <th style={{width:96}}>Updated</th>
                    <th style={{width:60}} aria-label="Actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-state" style={{ padding:'var(--space-10)' }}>
                          <div className="empty-state-icon">📋</div>
                          <p className="empty-state-title">No tasks found</p>
                          <p className="empty-state-desc">Try adjusting your filters or search query.</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTasks.map(task => {
                    const emp = users.find(u => u.id === task.assigned_to)
                    const di = getDeadlineInfo(task.deadline_date, task.deadline_time, task.status)
                    return (
                      <tr
                        key={task.id}
                        style={{ cursor:'pointer' }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        onKeyDown={e => e.key==='Enter' && navigate(`/tasks/${task.id}`)}
                        tabIndex={0}
                        role="row"
                        aria-label={`Task ${task.reference}: ${task.title}`}
                      >
                        <td>
                          <code style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', fontFamily:'monospace', background:'var(--color-bg)', padding:'2px 6px', borderRadius:'var(--radius-sm)' }}>
                            {task.reference}
                          </code>
                        </td>
                        <td>
                          <div className={styles.taskTitleCell}>
                            <span style={{ fontWeight:600, fontSize:'var(--font-size-sm)' }}>{task.title}</span>
                            {task.assignment_group_id && (
                              <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', background:'var(--color-bg)', padding:'1px 5px', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)' }}>
                                Bulk
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
                            <div className="avatar avatar-sm" style={{ background: emp?.avatar_color }}>{emp?.initials}</div>
                            <span style={{ fontSize:'var(--font-size-sm)', fontWeight:500 }}>{emp?.name || '—'}</span>
                          </div>
                        </td>
                        <td><PriorityBadge priority={task.priority} size="xs" /></td>
                        <td>
                          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                            <StatusChip status={task.status} />
                            {task.status === 'blocked' && (
                              <span style={{ fontSize:10, color:'var(--color-danger)', fontWeight:600 }}>🚧 Blocked</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                            <span style={{ fontSize:'var(--font-size-xs)', fontWeight:600, color: di.color }}>{di.label}</span>
                            {di.isOverdue && <span className="overdue-label">⏰ Overdue</span>}
                          </div>
                        </td>
                        <td style={{ minWidth:100 }}>
                          <ProgressBar value={task.progress} size="sm" />
                        </td>
                        <td>
                          <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                            {formatRelative(task.updated_at)}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            aria-label={`View task ${task.reference}`}
                          >
                            →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} shown
              </span>
            </div>
          </div>
        </div>

        {/* Right panels */}
        <div className={styles.rightPanel}>

          {/* Needs Attention */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700, display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
                <span aria-hidden="true">⚠</span> Needs Attention
                {needsAttention.length > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--color-danger)', color:'white', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:'var(--radius-full)' }}>
                    {needsAttention.length}
                  </span>
                )}
              </h3>
            </div>
            <div style={{ maxHeight:300, overflowY:'auto' }}>
              {needsAttention.length === 0 ? (
                <div className="empty-state" style={{ padding:'var(--space-8)' }}>
                  <span style={{ fontSize:28 }}>✓</span>
                  <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-muted)' }}>All clear!</p>
                </div>
              ) : needsAttention.map((item, i) => {
                const typeColors = { blocker:'var(--color-danger)', overdue:'var(--color-warning)', review:'var(--color-blue)', extension:'var(--color-p2)' }
                const typeIcons = { blocker:'🚧', overdue:'🔴', review:'📤', extension:'🕐' }
                return (
                  <button
                    key={i}
                    className={styles.attentionItem}
                    onClick={() => navigate(`/tasks/${item.task.id}`)}
                    style={{ '--type-color': typeColors[item.type] }}
                  >
                    <span style={{ fontSize:16 }}>{typeIcons[item.type]}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'var(--font-size-xs)', fontWeight:700, color: typeColors[item.type], textTransform:'uppercase', letterSpacing:'0.05em' }}>
                        {item.type === 'blocker' ? 'Blocker' : item.type === 'overdue' ? 'Overdue' : item.type === 'review' ? 'Pending Review' : 'Extension Request'}
                      </p>
                      <p style={{ fontSize:'var(--font-size-sm)', fontWeight:600, color:'var(--color-text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {item.task.title}
                      </p>
                      {item.sub && (
                        <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {item.sub}
                        </p>
                      )}
                    </div>
                    <span aria-hidden="true" style={{ color:'var(--color-text-muted)', flexShrink:0 }}>→</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Agenda */}
          <div className="card" style={{ marginTop:'var(--space-4)' }}>
            <div className="card-header" style={{ paddingBottom:'var(--space-3)' }}>
              <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>📅 Agenda</h3>
            </div>
            <div style={{ padding:'0 var(--space-4)' }}>
              <div className="tabs" style={{ borderBottom:'2px solid var(--color-border-light)' }}>
                {[['today','Today'],['next3','Next 3 Days'],['week','This Week']].map(([key, label]) => (
                  <button
                    key={key}
                    className={`tab-btn ${agendaTab === key ? 'active' : ''}`}
                    onClick={() => setAgendaTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ maxHeight:280, overflowY:'auto' }}>
              {agendaTasks.length === 0 ? (
                <div className="empty-state" style={{ padding:'var(--space-8)' }}>
                  <span style={{ fontSize:28 }}>🗓</span>
                  <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-muted)' }}>No tasks due in this window</p>
                </div>
              ) : agendaTasks.map(t => {
                const emp = users.find(u => u.id === t.assigned_to)
                const di = getDeadlineInfo(t.deadline_date, t.deadline_time, t.status)
                return (
                  <button
                    key={t.id}
                    className={styles.agendaItem}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                  >
                    <div className={styles.agendaDot} style={{ background: di.isOverdue ? 'var(--color-danger)' : di.isDueToday ? 'var(--color-warning)' : 'var(--color-blue)' }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'var(--font-size-sm)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</p>
                      <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>{emp?.name} • {di.label}</p>
                    </div>
                    <PriorityBadge priority={t.priority} size="xs" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Workload summary */}
          <div className="card" style={{ marginTop:'var(--space-4)' }}>
            <div className="card-header">
              <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>👥 Workload</h3>
            </div>
            <div style={{ padding:'var(--space-4)', display:'flex', flexDirection:'column', gap:'var(--space-3)' }}>
              {employees.filter(e => e.is_active).map(emp => {
                const count = getOpenTaskCount(emp.id)
                const max = 8
                return (
                  <div key={emp.id} style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
                    <div className="avatar avatar-sm" style={{ background: emp.avatar_color }}>{emp.initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:'var(--font-size-sm)', fontWeight:600 }}>{emp.name}</span>
                        <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-secondary)' }}>{count} open</span>
                      </div>
                      <ProgressBar value={Math.min(100, (count / max) * 100)} showLabel={false} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
