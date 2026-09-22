import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, useTask } from '../contexts/StoreContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  getChecklistItems, getComments, getUpdates, getSubmissions,
  getExtensionRequests, getActivity
} from '../lib/mockStore.js'
import { getDeadlineInfo, formatDateTime, formatRelative } from '../lib/dateUtils.js'
import PriorityBadge from '../components/ui/PriorityBadge.jsx'
import StatusChip from '../components/ui/StatusChip.jsx'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import {
  UpdateProgressModal, ReportBlockerModal, SubmitForReviewModal,
  ReviewTaskModal, ExtensionRequestModal, ExtensionDecisionModal,
  ReassignModal, CancelTaskModal, ChangeDeadlineModal
} from '../components/tasks/TaskModals.jsx'
import styles from './TaskDetail.module.css'

const FIELD_LABELS = {
  status: 'Status', progress: 'Progress', priority: 'Priority',
  assigned_to: 'Assigned to', deadline: 'Deadline', deadline_reason: 'Deadline change reason',
  blocker_reason: 'Blocker', acknowledged: 'Acknowledged', cancel_reason: 'Cancellation reason',
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { users, actions } = useStore()
  const { user, isHead } = useAuth()
  const task = useTask(id)

  const [activeModal, setActiveModal] = useState(null)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  if (!task) {
    return (
      <div className="page-container">
        <div className="empty-state card" style={{ padding:'var(--space-16)' }}>
          <div className="empty-state-icon">🔍</div>
          <h2 className="empty-state-title">Task not found</h2>
          <p className="empty-state-desc">This task doesn't exist or you don't have access to it.</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    )
  }

  // Access control: employee can only view their own tasks
  if (!isHead && task.assigned_to !== user.id) {
    return (
      <div className="page-container">
        <div className="empty-state card" style={{ padding:'var(--space-16)' }}>
          <div className="empty-state-icon">🔒</div>
          <h2 className="empty-state-title">Access Denied</h2>
          <p className="empty-state-desc">You don't have permission to view this task.</p>
          <button className="btn btn-primary" onClick={() => navigate('/my-tasks')}>My Tasks</button>
        </div>
      </div>
    )
  }

  const assignee = users.find(u => u.id === task.assigned_to)
  const assigner = users.find(u => u.id === task.assigned_by)
  const di = getDeadlineInfo(task.deadline_date, task.deadline_time, task.status)
  const checklist = getChecklistItems(task.id)
  const comments = getComments(task.id)
  const updates = getUpdates(task.id)
  const submissions = getSubmissions(task.id)
  const extensions = getExtensionRequests(task.id)
  const activity = getActivity(task.id)

  const latestSubmission = submissions[submissions.length - 1]
  const pendingExtension = extensions.find(e => e.status === 'pending')
  const isMyTask = task.assigned_to === user.id
  const canAct = isMyTask && !['completed','cancelled'].includes(task.status)

  const openModal = (type) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setSubmittingComment(true)
    await new Promise(r => setTimeout(r, 200))
    actions.addComment(task.id, comment.trim(), user.id)
    setComment('')
    setSubmittingComment(false)
  }

  const handleToggleChecklist = (itemId) => {
    if (!isMyTask && !isHead) return
    actions.toggleChecklistItem(itemId, user.id)
  }

  return (
    <div className="page-container" style={{ maxWidth:900 }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom:'var(--space-4)' }}>
        ← Back
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom:'var(--space-5)' }}>
        <div className={styles.taskHeader}>
          <div className={styles.taskMeta}>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)', flexWrap:'wrap' }}>
              <code style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-muted)', fontFamily:'monospace', background:'var(--color-bg)', padding:'2px 8px', borderRadius:'var(--radius-sm)', border:'1px solid var(--color-border)' }}>
                {task.reference}
              </code>
              <PriorityBadge priority={task.priority} size="sm" />
              <StatusChip status={task.status} />
              {di.isOverdue && <span className="overdue-label">⏰ Overdue</span>}
              {task.status === 'awaiting_review' && di.isOverdue && (
                <span style={{ fontSize:'var(--font-size-xs)', fontWeight:600, color:'var(--color-warning)' }}>⚠ Review Overdue</span>
              )}
              {task.assignment_group_id && (
                <span className="badge" style={{ background:'var(--color-bg)', color:'var(--color-text-secondary)', borderColor:'var(--color-border)' }}>
                  Bulk Assignment
                </span>
              )}
            </div>
            <h1 style={{ fontSize:'var(--font-size-2xl)', fontWeight:800, marginTop:'var(--space-3)', lineHeight:1.25 }}>
              {task.title}
            </h1>
          </div>

          {/* Action buttons (top-right) */}
          <div className={styles.taskActions}>
            {/* Employee actions */}
            {canAct && task.status === 'todo' && !task.acknowledged_at && (
              <button className="btn btn-secondary" onClick={() => actions.acknowledgeTask(task.id, user.id)}>
                ✓ Acknowledge
              </button>
            )}
            {canAct && task.status === 'todo' && task.acknowledged_at && (
              <button className="btn btn-primary" onClick={() => actions.startWork(task.id, user.id)}>
                ▶ Start Work
              </button>
            )}
            {canAct && task.status === 'in_progress' && (
              <>
                <button className="btn btn-secondary" onClick={() => openModal('progress')}>Update Progress</button>
                <button className="btn btn-secondary" style={{color:'var(--color-danger)'}} onClick={() => openModal('blocker')}>🚧 Report Blocker</button>
                <button className="btn btn-secondary" onClick={() => openModal('extension')}>🕐 Request Extension</button>
                <button className="btn btn-primary" onClick={() => openModal('submit')}>📤 Submit for Review</button>
              </>
            )}
            {canAct && task.status === 'blocked' && (
              <>
                <button className="btn btn-primary" onClick={() => actions.resumeWork(task.id, user.id)}>Resume Work</button>
                <button className="btn btn-secondary" onClick={() => openModal('extension')}>Request Extension</button>
              </>
            )}

            {/* Head actions */}
            {isHead && task.status === 'awaiting_review' && (
              <button className="btn btn-primary" onClick={() => openModal('review')}>Review Submission</button>
            )}
            {isHead && !['completed','cancelled'].includes(task.status) && (
              <>
                <button className="btn btn-secondary" onClick={() => openModal('reassign')}>Reassign</button>
                <button className="btn btn-secondary" onClick={() => openModal('deadline')}>Change Deadline</button>
                <button className="btn btn-ghost btn-sm" style={{color:'var(--color-danger)'}} onClick={() => openModal('cancel')}>Cancel Task</button>
              </>
            )}
            {isHead && pendingExtension && (
              <button className="btn btn-secondary" style={{borderColor:'var(--color-warning)',color:'var(--color-warning)'}} onClick={() => openModal('extension_decision')}>
                🕐 Review Extension Request
              </button>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assigned to</span>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
              <div className="avatar avatar-sm" style={{ background: assignee?.avatar_color }}>{assignee?.initials}</div>
              <span style={{ fontWeight:600, fontSize:'var(--font-size-sm)' }}>{assignee?.name || '—'}</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assigned by</span>
            <span style={{ fontWeight:600, fontSize:'var(--font-size-sm)' }}>{assigner?.name || '—'}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Deadline</span>
            <span style={{ fontWeight:600, fontSize:'var(--font-size-sm)', color: di.color }}>{di.label}</span>
            {task.original_deadline !== task.current_deadline && (
              <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                Original: {task.original_deadline?.split('T')[0]}
              </span>
            )}
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Progress</span>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)' }}>
              <span style={{ fontWeight:700, fontSize:'var(--font-size-lg)', color:'var(--color-blue)' }}>{task.progress}%</span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created</span>
            <span style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)' }}>{formatRelative(task.created_at)}</span>
          </div>
          {task.acknowledged_at && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Acknowledged</span>
              <span style={{ fontSize:'var(--font-size-sm)', color:'var(--color-success)' }}>✓ {formatRelative(task.acknowledged_at)}</span>
            </div>
          )}
        </div>

        {task.tags?.length > 0 && (
          <div style={{ padding:'0 var(--space-6) var(--space-4)', display:'flex', gap:'var(--space-2)', flexWrap:'wrap' }}>
            {task.tags.map(tag => (
              <span key={tag} style={{ fontSize:'var(--font-size-xs)', padding:'2px 8px', background:'var(--color-bg)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-full)', color:'var(--color-text-secondary)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className={styles.contentGrid}>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>

          {/* Instructions */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>📋 Instructions</h2>
            </div>
            <div className="card-body">
              <p style={{ fontSize:'var(--font-size-sm)', lineHeight:1.7, whiteSpace:'pre-wrap', color:'var(--color-text-primary)' }}>
                {task.instructions}
              </p>
            </div>
          </div>

          {/* Acceptance Criteria */}
          {task.acceptance_criteria && (
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>✅ Acceptance Criteria</h2>
              </div>
              <div className="card-body">
                <p style={{ fontSize:'var(--font-size-sm)', lineHeight:1.7, whiteSpace:'pre-wrap', color:'var(--color-text-primary)' }}>
                  {task.acceptance_criteria}
                </p>
              </div>
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>
                    ☑ Checklist
                  </h2>
                  <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                    {checklist.filter(c=>c.is_completed).length}/{checklist.length} done
                    {checklist.filter(c=>c.is_required).length > 0 && ` • ${checklist.filter(c=>c.is_required&&c.is_completed).length}/${checklist.filter(c=>c.is_required).length} required`}
                  </span>
                </div>
                <ProgressBar value={(checklist.filter(c=>c.is_completed).length/checklist.length)*100} showLabel={false} style={{ marginTop:'var(--space-2)' }} />
              </div>
              <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
                {checklist.map(item => (
                  <label key={item.id} className="checkbox-wrapper" style={{ padding:'var(--space-2) var(--space-3)', background: item.is_completed?'var(--color-success-bg)':'var(--color-bg)', borderRadius:'var(--radius-md)', border:`1px solid ${item.is_completed?'var(--color-border)':'var(--color-border)'}` }}>
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      disabled={!isMyTask && !isHead}
                    />
                    <span style={{ flex:1, fontSize:'var(--font-size-sm)', textDecoration: item.is_completed?'line-through':'none', color: item.is_completed?'var(--color-text-muted)':'var(--color-text-primary)' }}>
                      {item.text}
                    </span>
                    {item.is_required && (
                      <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-danger)', fontWeight:600, flexShrink:0 }}>Required</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>
                💬 Comments <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', fontWeight:400 }}>({comments.length})</span>
              </h2>
            </div>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              {comments.length === 0 && (
                <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-muted)' }}>No comments yet.</p>
              )}
              {comments.map(c => {
                const author = users.find(u => u.id === c.author_id)
                const isMe = c.author_id === user.id
                return (
                  <div key={c.id} style={{ display:'flex', gap:'var(--space-3)', flexDirection: isMe?'row-reverse':'row' }}>
                    <div className="avatar avatar-sm" style={{ background: author?.avatar_color, flexShrink:0 }}>{author?.initials}</div>
                    <div style={{ maxWidth:'75%' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', flexDirection: isMe?'row-reverse':'row', marginBottom:'var(--space-1)' }}>
                        <span style={{ fontSize:'var(--font-size-xs)', fontWeight:700 }}>{author?.name}</span>
                        <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>{formatRelative(c.created_at)}</span>
                      </div>
                      <div style={{
                        padding:'var(--space-3) var(--space-4)',
                        background: isMe?'var(--color-blue)':'var(--color-bg)',
                        color: isMe?'white':'var(--color-text-primary)',
                        borderRadius: isMe?'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)':'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                        fontSize:'var(--font-size-sm)',
                        lineHeight:1.6,
                        border: isMe?'none':'1px solid var(--color-border)',
                      }}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              {/* Comment input */}
              {!['cancelled'].includes(task.status) && (
                <div style={{ display:'flex', gap:'var(--space-3)', marginTop:'var(--space-2)' }}>
                  <div className="avatar avatar-sm" style={{ background: user.avatar_color, flexShrink:0 }}>{user.initials}</div>
                  <div style={{ flex:1, display:'flex', gap:'var(--space-2)' }}>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment…"
                      style={{ flex:1, minHeight:0 }}
                      onKeyDown={e => {
                        if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() }
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleAddComment}
                      disabled={!comment.trim() || submittingComment}
                      style={{ alignSelf:'flex-end' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>

          {/* Progress updates */}
          {updates.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>📊 Progress Updates</h2>
              </div>
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                {[...updates].reverse().map(u => {
                  const author = users.find(usr => usr.id === u.created_by)
                  return (
                    <div key={u.id} style={{ padding:'var(--space-3) var(--space-5)', borderBottom:'1px solid var(--color-border-light)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'var(--space-1)' }}>
                        <span style={{ fontSize:'var(--font-size-xs)', fontWeight:700, color:'var(--color-blue)' }}>{u.progress}%</span>
                        <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>{formatRelative(u.created_at)}</span>
                      </div>
                      {u.note && <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-secondary)', lineHeight:1.6 }}>{u.note}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Submissions */}
          {submissions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>📤 Submissions</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {submissions.map((sub, i) => {
                  const reviewer = users.find(u => u.id === sub.review_decision ? task.assigned_by : null)
                  return (
                    <div key={sub.id} style={{ padding:'var(--space-4) var(--space-5)', borderBottom: i<submissions.length-1?'1px solid var(--color-border-light)':'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginBottom:'var(--space-2)' }}>
                        <span style={{ fontSize:'var(--font-size-xs)', fontWeight:700, color:'var(--color-text-muted)' }}>
                          Submission #{i+1}
                        </span>
                        {sub.on_time
                          ? <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-success)', fontWeight:600 }}>✓ On time</span>
                          : <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-danger)', fontWeight:600 }}>⏰ Late</span>
                        }
                        {sub.review_decision && (
                          <span className="badge" style={{
                            fontSize:10,
                            color: sub.review_decision==='approved'?'var(--color-success)':'var(--color-warning)',
                            background: sub.review_decision==='approved'?'var(--color-success-bg)':'var(--color-warning-bg)',
                            borderColor: sub.review_decision==='approved'?'var(--color-success)':'var(--color-warning)',
                          }}>
                            {sub.review_decision==='approved'?'Approved':'Changes requested'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-primary)', lineHeight:1.6 }}>{sub.summary}</p>
                      <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', marginTop:'var(--space-1)' }}>
                        Submitted {formatDateTime(sub.submitted_at)}
                      </p>
                      {sub.reviewer_note && (
                        <div className={`alert ${sub.review_decision==='approved'?'alert-success':'alert-warning'}`} style={{ marginTop:'var(--space-3)', fontSize:'var(--font-size-xs)' }}>
                          <span>{sub.review_decision==='approved'?'✓':'🔄'}</span>
                          <span><strong>Head feedback:</strong> {sub.reviewer_note}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Extension Requests */}
          {extensions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>🕐 Extension Requests</h2>
              </div>
              <div>
                {extensions.map((ext, i) => (
                  <div key={ext.id} style={{ padding:'var(--space-4) var(--space-5)', borderBottom: i<extensions.length-1?'1px solid var(--color-border-light)':'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'var(--space-2)' }}>
                      <span style={{ fontSize:'var(--font-size-xs)', fontWeight:700 }}>New deadline requested: {ext.requested_deadline?.split('T')[0]}</span>
                      <span className="badge" style={{
                        fontSize:10,
                        color: ext.status==='pending'?'var(--color-warning)':ext.status==='approved'?'var(--color-success)':'var(--color-danger)',
                        background: ext.status==='pending'?'var(--color-warning-bg)':ext.status==='approved'?'var(--color-success-bg)':'var(--color-danger-bg)',
                        borderColor: 'transparent',
                      }}>
                        {ext.status}
                      </span>
                    </div>
                    <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-secondary)' }}>{ext.reason}</p>
                    {ext.decision_note && (
                      <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', marginTop:'var(--space-1)', fontStyle:'italic' }}>
                        Head: {ext.decision_note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity History */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>📜 Activity History</h2>
            </div>
            <div style={{ maxHeight:400, overflowY:'auto' }}>
              {[...activity].reverse().map((a, i) => {
                const actor = users.find(u => u.id === a.actor_id)
                const fieldLabel = FIELD_LABELS[a.field] || a.field
                return (
                  <div key={a.id} style={{ display:'flex', gap:'var(--space-3)', padding:'var(--space-3) var(--space-5)', borderBottom:'1px solid var(--color-border-light)' }}>
                    <div style={{ width:6, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--color-border)', flexShrink:0, marginTop:5 }} />
                      {i < activity.length-1 && <div style={{ width:1, flex:1, background:'var(--color-border-light)', margin:'4px 0' }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-primary)', lineHeight:1.5 }}>
                        <strong>{actor?.name || 'System'}</strong>{' '}
                        {a.field === 'status'
                          ? `changed status from "${a.old_value||'—'}" to "${a.new_value}"`
                          : a.field === 'acknowledged'
                          ? 'acknowledged the task'
                          : a.field === 'progress'
                          ? `updated progress from ${a.old_value}% to ${a.new_value}%`
                          : `changed ${fieldLabel}${a.old_value?` from "${a.old_value}"`:''}${a.new_value?` to "${a.new_value}"`:''}` }
                      </p>
                      <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', marginTop:2 }}>{formatRelative(a.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'progress' && <UpdateProgressModal task={task} onClose={closeModal} />}
      {activeModal === 'blocker' && <ReportBlockerModal task={task} onClose={closeModal} />}
      {activeModal === 'submit' && <SubmitForReviewModal task={task} checklist={checklist} onClose={closeModal} />}
      {activeModal === 'review' && <ReviewTaskModal task={task} onClose={closeModal} />}
      {activeModal === 'extension' && <ExtensionRequestModal task={task} onClose={closeModal} />}
      {activeModal === 'extension_decision' && pendingExtension && (
        <ExtensionDecisionModal request={pendingExtension} task={task} onClose={closeModal} />
      )}
      {activeModal === 'reassign' && <ReassignModal task={task} onClose={closeModal} />}
      {activeModal === 'cancel' && <CancelTaskModal task={task} onClose={closeModal} />}
      {activeModal === 'deadline' && <ChangeDeadlineModal task={task} onClose={closeModal} />}
    </div>
  )
}
