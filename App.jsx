import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>جاري التحميل…</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/*" element={session ? <DashboardPage session={session} /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
