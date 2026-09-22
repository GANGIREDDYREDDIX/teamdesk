import { Link } from 'react-router-dom'

export default function InitialSetup() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'var(--space-4)' }}>
      <div style={{ maxWidth:480, textAlign:'center' }}>
        <h1 style={{ fontSize:'var(--font-size-2xl)', fontWeight:800, marginBottom:'var(--space-4)' }}>Initial Setup</h1>
        <p style={{ color:'var(--color-text-secondary)', marginBottom:'var(--space-6)' }}>
          The demo organization is pre-configured. Use the login page to access TeamDesk with the demo credentials.
        </p>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    </div>
  )
}
