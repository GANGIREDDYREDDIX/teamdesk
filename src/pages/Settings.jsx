import { useState } from 'react'
import { useStore } from '../contexts/StoreContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Settings() {
  const { org, actions } = useStore()
  const { user, isHead, updateProfile } = useAuth()

  const [orgForm, setOrgForm] = useState({ name: org.name, timezone: org.timezone, digest_time: org.digest_time })
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [newPassword, setNewPassword] = useState('')
  const [orgSaved, setOrgSaved] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney',
    'Pacific/Auckland',
  ]

  const handleOrgSave = (e) => {
    e.preventDefault()
    actions.updateOrg(orgForm)
    setOrgSaved(true)
    setTimeout(() => setOrgSaved(false), 2000)
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    const updates = { name: profileForm.name }
    if (newPassword) updates.password = newPassword
    updateProfile(updates)
    setProfileSaved(true)
    setNewPassword('')
    setTimeout(() => setProfileSaved(false), 2000)
  }

  return (
    <div className="page-container" style={{ maxWidth:640 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your profile and organization settings</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom:'var(--space-6)' }}>
        <div className="card-header">
          <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>👤 My Profile</h3>
        </div>
        <form onSubmit={handleProfileSave}>
          <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-4)' }}>
              <div className="avatar avatar-xl" style={{ background: user?.avatar_color }}>{user?.initials}</div>
              <div>
                <p style={{ fontWeight:700 }}>{user?.name}</p>
                <p style={{ fontSize:'var(--font-size-sm)', color:'var(--color-text-secondary)' }}>{user?.email}</p>
                <p style={{ fontSize:'var(--font-size-xs)', color:'var(--color-text-muted)', marginTop:2 }}>
                  {isHead ? 'Department Head' : 'Employee'}
                </p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile-name" className="form-label">Display Name</label>
                <input id="profile-name" type="text" className="form-input"
                  value={profileForm.name} onChange={e => setProfileForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label htmlFor="profile-email" className="form-label">Email</label>
                <input id="profile-email" type="email" className="form-input" value={profileForm.email} disabled
                  style={{ opacity:0.6, cursor:'not-allowed' }} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">New Password <span className="form-label-optional">(leave blank to keep current)</span></label>
              <input id="new-password" type="password" className="form-input"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            {profileSaved && <div className="alert alert-success"><span>✓</span><span>Profile saved!</span></div>}
          </div>
          <div className="card-footer" style={{ justifyContent:'flex-end', display:'flex' }}>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>

      {/* Org settings (Head only) */}
      {isHead && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>🏢 Organization Settings</h3>
          </div>
          <form onSubmit={handleOrgSave}>
            <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="org-name" className="form-label">Organization Name</label>
                <input id="org-name" type="text" className="form-input"
                  value={orgForm.name} onChange={e => setOrgForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="org-tz" className="form-label">Timezone</label>
                  <select id="org-tz" className="form-select"
                    value={orgForm.timezone} onChange={e => setOrgForm(f => ({...f, timezone:e.target.value}))}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                  <span className="form-hint">Used for deadline display and daily digest time.</span>
                </div>
                <div className="form-group">
                  <label htmlFor="org-digest" className="form-label">Daily Digest Time</label>
                  <input id="org-digest" type="time" className="form-input"
                    value={orgForm.digest_time} onChange={e => setOrgForm(f => ({...f, digest_time:e.target.value}))} />
                  <span className="form-hint">Morning summary sent to Head at this time.</span>
                </div>
              </div>
              {orgSaved && <div className="alert alert-success"><span>✓</span><span>Organization settings saved!</span></div>}
            </div>
            <div className="card-footer" style={{ justifyContent:'flex-end', display:'flex' }}>
              <button type="submit" className="btn btn-primary">Save Settings</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
