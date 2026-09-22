import { useState } from 'react'
import { useStore } from '../../contexts/StoreContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getOpenTaskCount } from '../../lib/mockStore.js'

function SimpleModal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Update Progress Modal ──────────────────────────────────────────────────────
export function UpdateProgressModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [progress, setProgress] = useState(task.progress)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = actions.updateProgress(task.id, user.id, progress, note)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    onClose()
  }

  return (
    <SimpleModal title="Update Progress" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="progress-slider" className="form-label">
              Progress: <strong>{progress}%</strong>
            </label>
            <input
              id="progress-slider"
              type="range" min={0} max={100} step={5}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              style={{ width:'100%', accentColor:'var(--color-blue)' }}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="progress-note" className="form-label">Note <span className="form-label-optional">(optional)</span></label>
            <textarea id="progress-note" className="form-textarea" rows={3}
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="What did you accomplish? Any blockers or notes for the head?"
            />
          </div>
          {progress === 100 && (
            <div className="alert alert-info">
              <span>ℹ</span>
              <span>Reaching 100% doesn't automatically complete the task. Use <strong>Submit for Review</strong> when ready.</span>
            </div>
          )}
          {error && <div className="alert alert-danger"><span>⚠</span><span>{error}</span></div>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Report Blocker Modal ───────────────────────────────────────────────────────
export function ReportBlockerModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) { setError('Please describe the blocker.'); return }
    setLoading(true)
    const result = actions.reportBlocker(task.id, user.id, reason)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    onClose()
  }

  return (
    <SimpleModal title="🚧 Report Blocker" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div className="alert alert-warning">
            <span>⚠</span>
            <span>Reporting a blocker will notify the department head immediately.</span>
          </div>
          <div className="form-group">
            <label htmlFor="blocker-reason" className="form-label">What is blocking you? <span style={{color:'var(--color-danger)'}}>*</span></label>
            <textarea id="blocker-reason" className="form-textarea" rows={4}
              value={reason} onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Describe the blocker clearly: what is missing, who needs to act, and any ticket references…"
              autoFocus
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Reporting…' : 'Report Blocker'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Submit for Review Modal ────────────────────────────────────────────────────
export function SubmitForReviewModal({ task, checklist, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requiredItems = checklist.filter(c => c.is_required)
  const incompleteRequired = requiredItems.filter(c => !c.is_completed)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!summary.trim()) { setError('Please provide a completion summary.'); return }
    if (incompleteRequired.length > 0) {
      setError(`Complete all required checklist items first (${incompleteRequired.length} remaining).`)
      return
    }
    setLoading(true)
    const result = actions.submitForReview(task.id, user.id, { summary })
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    onClose()
  }

  return (
    <SimpleModal title="📤 Submit for Review" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          {incompleteRequired.length > 0 && (
            <div className="alert alert-warning">
              <span>⚠</span>
              <div>
                <strong>{incompleteRequired.length} required checklist item{incompleteRequired.length!==1?'s':''} not completed:</strong>
                <ul style={{ marginTop:'var(--space-1)', paddingLeft:'var(--space-4)' }}>
                  {incompleteRequired.map(c => <li key={c.id} style={{ fontSize:'var(--font-size-xs)' }}>{c.text}</li>)}
                </ul>
              </div>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="review-summary" className="form-label">Completion Summary <span style={{color:'var(--color-danger)'}}>*</span></label>
            <textarea id="review-summary" className="form-textarea" rows={5}
              value={summary} onChange={e => { setSummary(e.target.value); setError('') }}
              placeholder="Describe what you completed, how you met the acceptance criteria, and where to find the deliverables…"
              autoFocus
            />
            {error && <span className="form-error">{error}</span>}
          </div>
          <div className="alert alert-info">
            <span>ℹ</span>
            <span>The department head will review your submission and either approve it or request changes.</span>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || incompleteRequired.length > 0}>
            {loading ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Review Task Modal (Head) ───────────────────────────────────────────────────
export function ReviewTaskModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [decision, setDecision] = useState('approved')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (decision === 'changes_requested' && !note.trim()) {
      setError('Please provide a reason for requesting changes.')
      return
    }
    setLoading(true)
    const result = actions.reviewTask(task.id, user.id, { decision, note })
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    onClose()
  }

  return (
    <SimpleModal title="Review Submission" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div style={{ display:'flex', gap:'var(--space-3)' }}>
            {[
              { value:'approved', label:'✅ Approve', desc:'Mark as Completed' },
              { value:'changes_requested', label:'🔄 Request Changes', desc:'Return to In Progress' },
            ].map(opt => (
              <label
                key={opt.value}
                style={{
                  flex:1, display:'flex', flexDirection:'column', gap:'var(--space-1)',
                  padding:'var(--space-4)', border:`2px solid ${decision===opt.value?'var(--color-blue)':'var(--color-border)'}`,
                  borderRadius:'var(--radius-md)', cursor:'pointer', background: decision===opt.value?'var(--color-blue-light)':'var(--color-bg)',
                  transition:'all var(--transition-fast)',
                }}
              >
                <input type="radio" name="decision" value={opt.value} checked={decision===opt.value}
                  onChange={() => { setDecision(opt.value); setError('') }}
                  style={{ position:'absolute', opacity:0, width:0 }}
                />
                <span style={{ fontWeight:700, fontSize:'var(--font-size-sm)' }}>{opt.label}</span>
                <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>{opt.desc}</span>
              </label>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="review-note" className="form-label">
              {decision === 'approved' ? 'Note (optional)' : 'Reason for changes *'}
            </label>
            <textarea id="review-note" className="form-textarea" rows={3}
              value={note} onChange={e => { setNote(e.target.value); setError('') }}
              placeholder={decision==='approved' ? 'Great work! Any feedback…' : 'Describe what needs to be changed…'}
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className={`btn ${decision==='approved' ? 'btn-primary' : 'btn-danger'}`} disabled={loading}>
            {loading ? 'Saving…' : decision==='approved' ? 'Approve Submission' : 'Request Changes'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Extension Request Modal (Employee) ────────────────────────────────────────
export function ExtensionRequestModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date) { setError('Please select a new deadline.'); return }
    if (date <= task.deadline_date) { setError('New deadline must be after the current deadline.'); return }
    if (!reason.trim()) { setError('Please provide a reason.'); return }
    setLoading(true)
    const result = actions.requestExtension(task.id, user.id, {
      requested_deadline: date + 'T17:00:00Z',
      reason,
    })
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    onClose()
  }

  return (
    <SimpleModal title="🕐 Request Extension" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div className="alert alert-info">
            <span>ℹ</span>
            <span>Current deadline: <strong>{task.deadline_date}</strong>. Your existing deadline stays active until the head approves.</span>
          </div>
          <div className="form-group">
            <label htmlFor="ext-date" className="form-label">Requested New Deadline <span style={{color:'var(--color-danger)'}}>*</span></label>
            <input id="ext-date" type="date" className="form-input"
              value={date} min={task.deadline_date}
              onChange={e => { setDate(e.target.value); setError('') }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="ext-reason" className="form-label">Reason <span style={{color:'var(--color-danger)'}}>*</span></label>
            <textarea id="ext-reason" className="form-textarea" rows={4}
              value={reason} onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Explain why you need more time and what you need to complete the task…"
            />
          </div>
          {error && <div className="alert alert-danger"><span>⚠</span><span>{error}</span></div>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Extension Decision Modal (Head) ───────────────────────────────────────────
export function ExtensionDecisionModal({ request, task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [decision, setDecision] = useState('approved')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    actions.decideExtension(request.id, user.id, { decision, note })
    setLoading(false)
    onClose()
  }

  return (
    <SimpleModal title="Extension Request" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div style={{ background:'var(--color-bg)', padding:'var(--space-4)', borderRadius:'var(--radius-md)', border:'1px solid var(--color-border)' }}>
            <p style={{ fontSize:'var(--font-size-sm)', fontWeight:600, marginBottom:'var(--space-2)' }}>Requested new deadline: {request.requested_deadline?.split('T')[0]}</p>
            <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)' }}>{request.reason}</p>
          </div>
          <div style={{ display:'flex', gap:'var(--space-3)' }}>
            {[['approved','✅ Approve'],['declined','❌ Decline']].map(([val, label]) => (
              <label key={val} style={{
                flex:1, padding:'var(--space-3)', border:`2px solid ${decision===val?'var(--color-blue)':'var(--color-border)'}`,
                borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'center', fontWeight:700,
                background: decision===val?'var(--color-blue-light)':'var(--color-bg)', fontSize:'var(--font-size-sm)',
                transition:'all var(--transition-fast)',
              }}>
                <input type="radio" name="ext-decision" value={val} checked={decision===val} onChange={() => setDecision(val)} style={{position:'absolute',opacity:0,width:0}} />
                {label}
              </label>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="ext-note" className="form-label">Note <span className="form-label-optional">(optional)</span></label>
            <textarea id="ext-note" className="form-textarea" rows={2}
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Any message for the employee…"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className={`btn ${decision==='approved'?'btn-primary':'btn-danger'}`} disabled={loading}>
            {loading ? 'Saving…' : decision==='approved' ? 'Approve Extension' : 'Decline Extension'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Reassign Modal (Head) ─────────────────────────────────────────────────────
export function ReassignModal({ task, onClose }) {
  const { users, actions } = useStore()
  const { user } = useAuth()
  const employees = users.filter(u => u.role === 'employee' && u.is_active && u.id !== task.assigned_to)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    actions.reassignTask(task.id, selected, user.id)
    setLoading(false)
    onClose()
  }

  return (
    <SimpleModal title="Reassign Task" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)' }}>
            Select the employee to reassign <strong>{task.title}</strong> to:
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
            {employees.map(emp => {
              const open = getOpenTaskCount(emp.id)
              return (
                <label key={emp.id} style={{
                  display:'flex', alignItems:'center', gap:'var(--space-3)',
                  padding:'var(--space-3)', border:`2px solid ${selected===emp.id?'var(--color-blue)':'var(--color-border)'}`,
                  borderRadius:'var(--radius-md)', cursor:'pointer', background: selected===emp.id?'var(--color-blue-light)':'var(--color-bg)',
                  transition:'all var(--transition-fast)',
                }}>
                  <input type="radio" name="reassign" value={emp.id} checked={selected===emp.id} onChange={() => setSelected(emp.id)} style={{position:'absolute',opacity:0,width:0}} />
                  <div className="avatar avatar-sm" style={{background:emp.avatar_color}}>{emp.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600, fontSize:'var(--font-size-sm)'}}>{emp.name}</div>
                    <div style={{fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)'}}>{open} open tasks</div>
                  </div>
                  {selected===emp.id && <span style={{color:'var(--color-blue)'}}>✓</span>}
                </label>
              )
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!selected || loading}>
            {loading ? 'Reassigning…' : 'Reassign Task'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Cancel Task Modal (Head) ──────────────────────────────────────────────────
export function CancelTaskModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    actions.cancelTask(task.id, user.id, reason)
    setLoading(false)
    onClose()
  }

  return (
    <SimpleModal title="Cancel Task" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div className="alert alert-danger">
            <span>⚠</span>
            <span>This will cancel <strong>{task.title}</strong>. The employee will be notified. This action can only be undone by the Head.</span>
          </div>
          <div className="form-group">
            <label htmlFor="cancel-reason" className="form-label">Reason <span className="form-label-optional">(optional)</span></label>
            <textarea id="cancel-reason" className="form-textarea" rows={3}
              value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Why is this task being cancelled?"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Keep Task</button>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Cancelling…' : 'Cancel Task'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}

// ── Change Deadline Modal (Head) ──────────────────────────────────────────────
export function ChangeDeadlineModal({ task, onClose }) {
  const { actions } = useStore()
  const { user } = useAuth()
  const [date, setDate] = useState(task.deadline_date)
  const [time, setTime] = useState(task.deadline_time || '17:00')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date) { setError('Please select a new deadline.'); return }
    if (!reason.trim()) { setError('A reason is required for deadline changes.'); return }
    setLoading(true)
    actions.changeDeadline(task.id, date, time, reason, user.id)
    setLoading(false)
    onClose()
  }

  return (
    <SimpleModal title="Change Deadline" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body">
          <div style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)', background:'var(--color-bg)', padding:'var(--space-3)', borderRadius:'var(--radius-md)' }}>
            Current deadline: <strong>{task.deadline_date}</strong> at <strong>{task.deadline_time || '17:00'}</strong>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="new-date" className="form-label">New Date <span style={{color:'var(--color-danger)'}}>*</span></label>
              <input id="new-date" type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="new-time" className="form-label">New Time</label>
              <input id="new-time" type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="deadline-reason" className="form-label">Reason <span style={{color:'var(--color-danger)'}}>*</span></label>
            <textarea id="deadline-reason" className="form-textarea" rows={3}
              value={reason} onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Why is the deadline being changed?"
            />
            {error && <span className="form-error">{error}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Update Deadline'}
          </button>
        </div>
      </form>
    </SimpleModal>
  )
}
