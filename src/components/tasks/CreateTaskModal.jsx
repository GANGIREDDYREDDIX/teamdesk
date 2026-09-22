import { useState } from 'react'
import { useStore } from '../../contexts/StoreContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getOpenTaskCount } from '../../lib/mockStore.js'
import { format, addDays } from 'date-fns'
import styles from './Modal.module.css'

const DEFAULT_CHECKLIST = [{ text: '', is_required: false }]

export default function CreateTaskModal({ onClose }) {
  const { users, departments, actions } = useStore()
  const { user } = useAuth()
  const employees = users.filter(u => u.role === 'employee' && u.is_active)
  const today = format(new Date(), 'yyyy-MM-dd')

  const [form, setForm] = useState({
    title: '',
    instructions: '',
    assigned_to: [],
    priority: 'p3',
    deadline_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    deadline_time: '17:00',
    department_id: '',
    start_date: '',
    tags: '',
    estimated_hours: '',
    acceptance_criteria: '',
  })
  const [checklist, setChecklist] = useState([])
  const [showChecklist, setShowChecklist] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const toggleEmployee = (id) => {
    setForm(f => ({
      ...f,
      assigned_to: f.assigned_to.includes(id)
        ? f.assigned_to.filter(x => x !== id)
        : [...f.assigned_to, id]
    }))
  }

  const addChecklistItem = () => setChecklist(c => [...c, { text:'', is_required:false }])
  const removeChecklistItem = (i) => setChecklist(c => c.filter((_,idx) => idx !== i))
  const updateChecklistItem = (i, field, val) => setChecklist(c => c.map((item,idx) => idx===i ? {...item,[field]:val} : item))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required.'
    if (!form.instructions.trim()) e.instructions = 'Instructions are required.'
    if (form.assigned_to.length === 0) e.assigned_to = 'Select at least one employee.'
    if (!form.deadline_date) e.deadline_date = 'Deadline date is required.'
    if (form.deadline_date < today) e.deadline_date = 'Deadline cannot be in the past.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const taskData = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      checklist_items: checklist.filter(c => c.text.trim()),
    }
    actions.createTask(taskData, user.id)
    setLoading(false)
    setSuccess(true)
    setTimeout(onClose, 1200)
  }

  if (success) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Task created">
          <div className="modal-body" style={{ alignItems:'center', textAlign:'center', gap:'var(--space-4)' }}>
            <div style={{ fontSize:48 }}>✅</div>
            <h3 style={{ fontSize:'var(--font-size-xl)', fontWeight:700 }}>
              {form.assigned_to.length > 1 ? `${form.assigned_to.length} tasks created!` : 'Task created!'}
            </h3>
            <p style={{ color:'var(--color-text-secondary)', fontSize:'var(--font-size-sm)' }}>
              Employees have been notified.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="create-task-title">
        <div className="modal-header">
          <h2 id="create-task-title" className="modal-title">Assign Task</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* Title */}
            <div className="form-group">
              <label htmlFor="task-title" className="form-label">Title <span style={{color:'var(--color-danger)'}}>*</span></label>
              <input id="task-title" type="text" className={`form-input ${errors.title ? styles.inputError : ''}`}
                value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="Brief, clear task title"
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Instructions */}
            <div className="form-group">
              <label htmlFor="task-instructions" className="form-label">Instructions <span style={{color:'var(--color-danger)'}}>*</span></label>
              <textarea id="task-instructions" className={`form-textarea ${errors.instructions ? styles.inputError : ''}`}
                rows={4} value={form.instructions} onChange={e => set('instructions', e.target.value)}
                placeholder="Detailed instructions for the employee…"
              />
              {errors.instructions && <span className="form-error">{errors.instructions}</span>}
            </div>

            {/* Assign to */}
            <div className="form-group">
              <label className="form-label">
                Assign to <span style={{color:'var(--color-danger)'}}>*</span>
                {form.assigned_to.length > 1 && (
                  <span style={{ marginLeft:'var(--space-2)', color:'var(--color-blue)', fontWeight:400, fontSize:'var(--font-size-xs)' }}>
                    Bulk: {form.assigned_to.length} employees → {form.assigned_to.length} separate tasks
                  </span>
                )}
              </label>
              <div className={styles.employeeGrid}>
                {employees.map(emp => {
                  const selected = form.assigned_to.includes(emp.id)
                  const open = getOpenTaskCount(emp.id)
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      className={`${styles.employeeChip} ${selected ? styles.selected : ''}`}
                      onClick={() => toggleEmployee(emp.id)}
                      aria-pressed={selected}
                      aria-label={`${emp.name}, ${open} open tasks. ${selected ? 'Selected' : 'Click to select'}`}
                    >
                      <div className="avatar avatar-sm" style={{ background: emp.avatar_color }}>{emp.initials}</div>
                      <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
                        <div style={{ fontWeight:600, fontSize:'var(--font-size-sm)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.name}</div>
                        <div style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>{open} open task{open!==1?'s':''}</div>
                      </div>
                      {selected && <span style={{ color:'var(--color-blue)', fontSize:16 }}>✓</span>}
                    </button>
                  )
                })}
              </div>
              {errors.assigned_to && <span className="form-error">{errors.assigned_to}</span>}
            </div>

            {/* Priority + Deadline row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority" className="form-label">Priority</label>
                <select id="task-priority" className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="p1">P1 Critical</option>
                  <option value="p2">P2 High</option>
                  <option value="p3">P3 Medium (default)</option>
                  <option value="p4">P4 Low</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-dept" className="form-label">Department <span className="form-label-optional">(optional)</span></label>
                <select id="task-dept" className="form-select" value={form.department_id} onChange={e => set('department_id', e.target.value)}>
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-deadline-date" className="form-label">Deadline Date <span style={{color:'var(--color-danger)'}}>*</span></label>
                <input id="task-deadline-date" type="date" className={`form-input ${errors.deadline_date ? styles.inputError : ''}`}
                  value={form.deadline_date} min={today}
                  onChange={e => set('deadline_date', e.target.value)}
                />
                {errors.deadline_date && <span className="form-error">{errors.deadline_date}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="task-deadline-time" className="form-label">
                  Due Time <span className="form-label-optional">(default 5:00 PM)</span>
                </label>
                <input id="task-deadline-time" type="time" className="form-input"
                  value={form.deadline_time} onChange={e => set('deadline_time', e.target.value)}
                />
                <span className="form-hint">Organization timezone: America/New_York</span>
              </div>
            </div>

            {/* Optional fields toggle */}
            <details className={styles.optionalSection}>
              <summary className={styles.optionalToggle}>
                ⚙ Optional fields (start date, tags, hours, acceptance criteria)
              </summary>
              <div style={{ paddingTop:'var(--space-4)', display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="task-start" className="form-label">Start Date</label>
                    <input id="task-start" type="date" className="form-input"
                      value={form.start_date} onChange={e => set('start_date', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="task-hours" className="form-label">Estimated Hours</label>
                    <input id="task-hours" type="number" className="form-input" min="0.5" step="0.5"
                      value={form.estimated_hours} onChange={e => set('estimated_hours', e.target.value)}
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="task-tags" className="form-label">Tags</label>
                  <input id="task-tags" type="text" className="form-input"
                    value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="bug, frontend, urgent (comma-separated)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-criteria" className="form-label">Acceptance Criteria</label>
                  <textarea id="task-criteria" className="form-textarea" rows={3}
                    value={form.acceptance_criteria} onChange={e => set('acceptance_criteria', e.target.value)}
                    placeholder="What defines a satisfactory completion of this task?"
                  />
                </div>
              </div>
            </details>

            {/* Checklist */}
            <div className="form-group">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label className="form-label">Checklist <span className="form-label-optional">(optional)</span></label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addChecklistItem}>+ Add item</button>
              </div>
              {checklist.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'var(--space-2)', marginTop:'var(--space-2)' }}>
                  <input type="checkbox" checked={item.is_required}
                    onChange={e => updateChecklistItem(i, 'is_required', e.target.checked)}
                    title="Required item"
                    aria-label="Mark as required"
                    style={{ width:16, height:16, accentColor:'var(--color-blue)', flexShrink:0 }}
                  />
                  <input type="text" className="form-input" placeholder="Checklist item…"
                    value={item.text} onChange={e => updateChecklistItem(i, 'text', e.target.value)}
                    style={{ flex:1 }}
                  />
                  <span style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', flexShrink:0 }}>Required</span>
                  <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeChecklistItem(i)} aria-label="Remove item">✕</button>
                </div>
              ))}
              {checklist.length === 0 && (
                <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                  Tip: check the ☑ box to mark an item as required before submission.
                </p>
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:14,height:14}} /> Creating…</> : (
                form.assigned_to.length > 1
                  ? `Create ${form.assigned_to.length} Tasks`
                  : 'Assign Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
