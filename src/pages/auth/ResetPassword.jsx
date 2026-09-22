import { useState } from 'react'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>TD</div>
          <div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>We'll send you a reset link</p>
          </div>
        </div>
        <div className={styles.divider} />
        {sent ? (
          <div className="alert alert-success">
            <span>✓</span>
            <span>If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="reset-email" className="form-label">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <a href="/login" className="btn btn-ghost" style={{ justifyContent:'center' }}>← Back to login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
