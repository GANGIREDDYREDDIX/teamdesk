import { useState } from 'react'
import { useStore } from '../../contexts/StoreContext.jsx'

export default function DepartmentsPage() {
  const { departments, actions } = useStore()
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null) // { id, name }
  const [error, setError] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newName.trim()) { setError('Department name is required.'); return }
    actions.createDepartment(newName.trim())
    setNewName('')
    setError('')
  }

  const handleEdit = (e) => {
    e.preventDefault()
    if (!editing.name.trim()) return
    actions.updateDepartment(editing.id, editing.name.trim())
    setEditing(null)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete department "${name}"? Tasks will not be deleted.`)) {
      actions.deleteDepartment(id)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth:640 }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Departments</h2>
          <p className="page-subtitle">Manage team departments and categories</p>
        </div>
      </div>

      {/* Create */}
      <div className="card" style={{ marginBottom:'var(--space-5)' }}>
        <div className="card-header">
          <h3 style={{ fontSize:'var(--font-size-md)', fontWeight:700 }}>Add Department</h3>
        </div>
        <form onSubmit={handleCreate}>
          <div className="card-body">
            <div style={{ display:'flex', gap:'var(--space-3)' }}>
              <input
                type="text"
                className="form-input"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError('') }}
                placeholder="Department name"
                style={{ flex:1 }}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="card">
        {departments.length === 0 ? (
          <div className="empty-state" style={{ padding:'var(--space-12)' }}>
            <div className="empty-state-icon">🏢</div>
            <p className="empty-state-title">No departments yet</p>
          </div>
        ) : (
          <div>
            {departments.map((dept, i) => (
              <div key={dept.id} style={{
                display:'flex', alignItems:'center', gap:'var(--space-4)',
                padding:'var(--space-4) var(--space-5)',
                borderBottom: i < departments.length-1 ? '1px solid var(--color-border-light)' : 'none',
              }}>
                {editing?.id === dept.id ? (
                  <form onSubmit={handleEdit} style={{ flex:1, display:'flex', gap:'var(--space-2)' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={editing.name}
                      onChange={e => setEditing(prev => ({...prev, name:e.target.value}))}
                      style={{ flex:1 }}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <span style={{ flex:1, fontWeight:600, fontSize:'var(--font-size-sm)' }}>🏢 {dept.name}</span>
                    <div style={{ display:'flex', gap:'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ id:dept.id, name:dept.name })}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color:'var(--color-danger)' }} onClick={() => handleDelete(dept.id, dept.name)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
