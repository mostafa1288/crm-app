import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: 380
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--purple-bg)', color: 'var(--purple-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 12px'
          }}>👥</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>إدارة العملاء</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>سجّل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>البريد الإلكتروني</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@company.com"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>كلمة المرور</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          {error && (
            <div style={{
              background: 'var(--red-bg)', color: 'var(--red-text)',
              fontSize: 13, padding: '8px 12px', borderRadius: 'var(--radius-sm)'
            }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '10px', borderRadius: 'var(--radius-sm)',
            background: 'var(--text)', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '9px 12px', border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontSize: 13,
  background: '#fafaf8', color: 'var(--text)', width: '100%',
  outline: 'none'
}
