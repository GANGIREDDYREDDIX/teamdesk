import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import styles from './Auth.module.css'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    const result = await signIn(email, password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    navigate(result.user.role === 'head' ? '/dashboard' : '/my-tasks')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>TD</div>
          <div>
            <h1 className={styles.title}>TeamDesk</h1>
            <p className={styles.subtitle}>Internal Task Management</p>
          </div>
        </div>

        <div className={styles.divider} />

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div style={{ position:'relative' }}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', fontSize:16 }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'var(--space-3)', fontSize:'var(--font-size-md)' }}
              disabled={loading}
            >
              {loading ? <><span className="spinner" style={{width:16,height:16}} /> Signing in…</> : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div className={styles.demoBox}>
          <p style={{ fontWeight:600, marginBottom:'var(--space-2)', fontSize:'var(--font-size-xs)' }}>Demo Credentials</p>
          <div className={styles.demoGrid}>
            {[
              { label:'Head',    email:'head@teamdesk.demo',  pw:'Head@1234' },
              { label:'Alice',   email:'alice@teamdesk.demo', pw:'Alice@1234' },
              { label:'Bob',     email:'bob@teamdesk.demo',   pw:'Bob@1234' },
              { label:'Carol',   email:'carol@teamdesk.demo', pw:'Carol@1234' },
            ].map(cred => (
              <button
                key={cred.email}
                type="button"
                className={styles.demoBtn}
                onClick={() => { setEmail(cred.email); setPassword(cred.pw); setError('') }}
              >
                <span style={{ fontWeight:700 }}>{cred.label}</span>
                <span style={{ color:'var(--color-text-muted)' }}>{cred.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
