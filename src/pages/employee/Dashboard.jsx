import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../contexts/StoreContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getDeadlineInfo, isTaskOverdue, isTaskDueToday, formatRelative } from '../../lib/dateUtils.js'
import { getChecklistItems } from '../../lib/mockStore.js'
import PriorityBadge from '../../components/ui/PriorityBadge.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import ProgressBar from '../../components/ui/ProgressBar.jsx'
import { UpdateProgressModal, ReportBlockerModal, SubmitForReviewModal, ExtensionRequestModal } from '../../components/tasks/TaskModals.jsx'
import styles from './EmployeeDashboard.module.css'

const TABS = [
  { id:'all',     label:'All Tasks' },
  { id:'due_today', label:'Due Today' },
  { id:'upcoming',  label:'Upcoming' },
  { id:'overdue',   label:'Overdue' },
  { id:'blocked',   label:'Blocked' },
  { id:'review',    label:'Awaiting Review' },
]

export default function EmployeeDashboard() {
  const { tasks, users, actions } = useStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('all')
  const [activeModal, setActiveModal] = useState(null) // { type, task }

  const myTasks = tasks.filter(t => t.assigned_to === user.id)

  const filtered = myTasks.filter(t => {
    if (activeTab === 'all') return !['cancelled'].includes(t.status)
    if (activeTab === 'due_today') return isTaskDueToday(t) && !['completed','cancelled'].includes(t.status)
    if (activeTab === 'upcoming') {
      const dt = new Date(t.deadline_date + 'T' + (t.deadline_time||'17:00'))
      const now = new Date()
      const diff = (dt - now) / 86400000
      return diff > 0 && diff <= 7 && !['completed','cancelled'].includes(t.status)
    }
    if (activeTab === 'overdue') return isTaskOverdue(t)
    if (activeTab === 'blocked') return t.status === 'blocked'
    if (activeTab === 'review') return t.status === 'awaiting_review'
    return true
  }).sort((a,b) => {
    if (isTaskOverdue(a) && !isTaskOverdue(b)) return -1
    if (!isTaskOverdue(a) && isTaskOverdue(b)) return 1
    if (isTaskDueToday(a) && !isTaskDueToday(b)) return -1
    if (!isTaskDueToday(a) && isTaskDueToday(b)) return 1
    return new Date(a.deadline_date) - new Date(b.deadline_date)
  })

  const tabCounts = {
    all:       myTasks.filter(t => !['cancelled'].includes(t.status)).length,
    due_today: myTasks.filter(t => isTaskDueToday(t) && !['completed','cancelled'].includes(t.status)).length,
    upcoming:  myTasks.filter(t => { const dt = new Date(t.deadline_date+'T'+(t.deadline_time||'17:00')); const diff=(dt-new Date())/86400000; return diff>0&&diff<=7&&!['completed','cancelled'].includes(t.status) }).length,
    overdue:   myTasks.filter(t => isTaskOverdue(t)).length,
    blocked:   myTasks.filter(t => t.status==='blocked').length,
    review:    myTasks.filter(t => t.status==='awaiting_review').length,
  }

  const openModal = (type, task) => setActiveModal({ type, task })
  const closeModal = () => setActiveModal(null)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Tasks</h2>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:'var(--space-5)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tabCounts[tab.id] > 0 && <span className="tab-count">{tabCounts[tab.id]}</span>}
          </button>
        ))}
      </div>

      {/* Task cards */}
      {filtered.length === 0 ? (
        <div className="empty-state card" style={{ padding:'var(--space-16)' }}>
          <div className="empty-state-icon">✓</div>
          <h3 className="empty-state-title">
            {activeTab === 'all' ? 'No tasks assigned yet' : 'Nothing here!'}
          </h3>
          <p className="empty-state-desc">
            {activeTab === 'all' ? 'The department head will assign tasks to you.' : `No tasks in the "${TABS.find(t=>t.id===activeTab)?.label}" category.`}
          </p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.map(task => {
            const di = getDeadlineInfo(task.deadline_date, task.deadline_time, task.status)
            const checklist = getChecklistItems(task.id)
            const requiredDone = checklist.filter(c=>c.is_required&&c.is_completed).length
            const requiredTotal = checklist.filter(c=>c.is_required).length

            return (
              <div key={task.id} className={`${styles.taskCard} card ${di.isOverdue ? styles.overdueCard : ''}`}>
                {/* Card header */}
                <div className={styles.cardHeader}>
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', flexWrap:'wrap' }}>
                    <PriorityBadge priority={task.priority} />
                    <StatusChip status={task.status} />
                    {di.isOverdue && <span className="overdue-label">⏰ Overdue</span>}
                    {di.isDueToday && !di.isOverdue && <span className="due-today-label">📅 Due Today</span>}
                  </div>
                  <code style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', fontFamily:'monospace' }}>
                    {task.reference}
                  </code>
                </div>

                {/* Title */}
                <div className={styles.cardBody}>
                  <h3 className={styles.taskTitle}>{task.title}</h3>

                  {/* Deadline */}
                  <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginTop:'var(--space-2)' }}>
                    <span aria-hidden="true">📅</span>
                    <span style={{ fontSize:'var(--font-size-xs)', fontWeight:600, color: di.color }}>{di.label}</span>
                  </div>

                  {/* Blocker */}
                  {task.status === 'blocked' && task.blocker_reason && (
                    <div className="alert alert-danger" style={{ marginTop:'var(--space-3)', padding:'var(--space-2) var(--space-3)' }}>
                      <span>🚧</span>
                      <p style={{ fontSize:'var(--font-size-xs)' }}>
                        <strong>Blocker:</strong> {task.blocker_reason}
                      </p>
                    </div>
                  )}

                  {/* Progress */}
                  {!['todo','cancelled'].includes(task.status) && (
                    <div style={{ marginTop:'var(--space-3)' }}>
                      <ProgressBar value={task.progress} size="sm" />
                    </div>
                  )}

                  {/* Checklist summary */}
                  {checklist.length > 0 && (
                    <div style={{ marginTop:'var(--space-2)', fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                      {checklist.filter(c=>c.is_completed).length}/{checklist.length} checklist items
                      {requiredTotal > 0 && ` • ${requiredDone}/${requiredTotal} required`}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    View Details →
                  </button>

                  <div style={{ display:'flex', gap:'var(--space-2)', flexWrap:'wrap' }}>
                    {task.status === 'todo' && !task.acknowledged_at && (
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => actions.acknowledgeTask(task.id, user.id)}>
                        Acknowledge
                      </button>
                    )}
                    {task.status === 'todo' && task.acknowledged_at && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => actions.startWork(task.id, user.id)}>
                        Start Work
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => openModal('progress', task)}>
                          Update Progress
                        </button>
                        <button className="btn btn-primary btn-sm"
                          onClick={() => openModal('submit', task)}>
                          Submit for Review
                        </button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button className="btn btn-ghost btn-sm" style={{ color:'var(--color-danger)' }}
                        onClick={() => openModal('blocker', task)}>
                        Report Blocker
                      </button>
                    )}
                    {task.status === 'blocked' && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => actions.resumeWork(task.id, user.id)}>
                        Resume Work
                      </button>
                    )}
                    {['in_progress','blocked'].includes(task.status) && (
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => openModal('extension', task)}>
                        Request Extension
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {activeModal?.type === 'progress' && (
        <UpdateProgressModal task={activeModal.task} onClose={closeModal} />
      )}
      {activeModal?.type === 'blocker' && (
        <ReportBlockerModal task={activeModal.task} onClose={closeModal} />
      )}
      {activeModal?.type === 'submit' && (
        <SubmitForReviewModal
          task={activeModal.task}
          checklist={getChecklistItems(activeModal.task.id)}
          onClose={closeModal}
        />
      )}
      {activeModal?.type === 'extension' && (
        <ExtensionRequestModal task={activeModal.task} onClose={closeModal} />
      )}
    </div>
  )
}
