import { useState } from 'react'
import { useStore } from '../../contexts/StoreContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getOpenTaskCount } from '../../lib/mockStore.js'
import { formatDate } from '../../lib/dateUtils.js'
import styles from './Employees.module.css'

export default function EmployeesPage() {
  const { users, departments, actions } = useStore()
  const { user } = useAuth()
  const employees = users.filter(u => u.role === 'employee')

  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name:'', email:'', department_id:'' })
  const [inviteError, setInviteError] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [deactivating, setDeactivating] = useState(null)

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.')
      return
    }
    setInviteLoading(true)
    const result = actions.inviteEmployee(inviteForm)
    setInviteLoading(false)
    if (result.error) { setInviteError(result.error); return }
    setInviteSuccess(true)
    setTimeout(() => { setShowInvite(false); setInviteSuccess(false); setInviteForm({ name:'', email:'', department_id:'' }) }, 2000)
  }

  const handleDeactivate = (empId) => {
    setDeactivating(empId)
    setTimeout(() => {
      actions.deactivateEmployee(empId)
      setDeactivating(null)
    }, 500)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle">{employees.filter(e=>e.is_active).length} active • {employees.filter(e=>!e.is_active).length} inactive</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
          + Invite Employee
        </button>
      </div>

      {/* Employee list */}
      <div className="card">
        <div className="table-wrapper">
          <table aria-label="Employees">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Department</th>
                <th>Open Tasks</th>
                <th>Joined</th>
                <th>Status</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const dept = departments.find(d => d.id === emp.department_id)
                const open = getOpenTaskCount(emp.id)
                return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'var(--space-3)' }}>
                        <div className="avatar avatar-md" style={{ background: emp.is_active ? emp.avatar_color : '#9CA3AF', opacity: emp.is_active ? 1 : 0.6 }}>
                          {emp.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'var(--font-size-sm)' }}>{emp.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)' }}>{emp.email}</td>
                    <td>
                      {dept ? (
                        <span className="badge" style={{ background:'var(--color-bg)', borderColor:'var(--color-border)', color:'var(--color-text-secondary)', fontSize:11 }}>
                          {dept.name}
                        </span>
                      ) : <span style={{ color:'var(--color-text-muted)', fontSize:'var(--font-size-xs)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontWeight:700, color: open>5?'var(--color-warning)':open>0?'var(--color-blue)':'var(--color-text-muted)' }}>
                        {open}
                      </span>
                    </td>
                    <td style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)' }}>
                      {formatDate(emp.joined_at)}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: emp.is_active ? 'var(--color-success-bg)' : 'var(--color-p4-bg)',
                        color: emp.is_active ? 'var(--color-success)' : 'var(--color-text-muted)',
                        borderColor: emp.is_active ? 'var(--color-success)' : 'var(--color-border)',
                        fontSize: 11,
                      }}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'var(--space-2)' }}>
                        {emp.is_active ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color:'var(--color-danger)', fontSize:'var(--font-size-xs)' }}
                            onClick={() => { if(window.confirm(`Deactivate ${emp.name}? They will lose access immediately.`)) handleDeactivate(emp.id) }}
                            disabled={deactivating === emp.id}
                          >
                            {deactivating === emp.id ? 'Deactivating…' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color:'var(--color-success)' }}
                            onClick={() => actions.reactivateEmployee(emp.id)}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-backdrop" onClick={() => setShowInvite(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="invite-title">
            <div className="modal-header">
              <h2 id="invite-title" className="modal-title">Invite Employee</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInvite(false)} aria-label="Close">✕</button>
            </div>
            {inviteSuccess ? (
              <div className="modal-body" style={{ alignItems:'center', textAlign:'center' }}>
                <div style={{ fontSize:48 }}>✉️</div>
                <h3 style={{ fontWeight:700 }}>Invite sent!</h3>
                <p style={{ color:'var(--color-text-secondary)', fontSize:'var(--font-size-sm)' }}>
                  {inviteForm.name} can log in with their email and temporary password: <strong>Welcome@1234</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleInvite} noValidate>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="inv-name" className="form-label">Full Name *</label>
                    <input id="inv-name" type="text" className="form-input"
                      value={inviteForm.name} onChange={e => setInviteForm(f => ({...f, name:e.target.value}))}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inv-email" className="form-label">Email Address *</label>
                    <input id="inv-email" type="email" className="form-input"
                      value={inviteForm.email} onChange={e => setInviteForm(f => ({...f, email:e.target.value}))}
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="inv-dept" className="form-label">Department <span className="form-label-optional">(optional)</span></label>
                    <select id="inv-dept" className="form-select"
                      value={inviteForm.department_id} onChange={e => setInviteForm(f => ({...f, department_id:e.target.value}))}>
                      <option value="">No department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  {inviteError && <div className="alert alert-danger"><span>⚠</span><span>{inviteError}</span></div>}
                  <div className="alert alert-info">
                    <span>ℹ</span>
                    <span>Temporary password will be <strong>Welcome@1234</strong>. Employee should change it after first login.</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={inviteLoading}>
                    {inviteLoading ? 'Inviting…' : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
