import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function NotFound() {
  const { user } = useAuth()
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', flexDirection:'column', gap:'var(--space-4)', textAlign:'center', padding:'var(--space-8)' }}>
      <div style={{ fontSize:64 }}>🔍</div>
      <h1 style={{ fontSize:'var(--font-size-4xl)', fontWeight:800, color:'var(--color-text-primary)' }}>404</h1>
      <p style={{ fontSize:'var(--font-size-lg)', color:'var(--color-text-secondary)' }}>Page not found</p>
      <Link to={user ? (user.role === 'head' ? '/dashboard' : '/my-tasks') : '/login'} className="btn btn-primary btn-lg">
        Go home
      </Link>
    </div>
  )
}
