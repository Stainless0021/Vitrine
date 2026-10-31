import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './Auth'
import Setup from './Setup'
import Dashboard from './Dashboard'
import Shop from './Shop'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <p>Loading...</p>

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" /> : <Auth mode="login" />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/dashboard" /> : <Auth mode="signup" />}
      />
      <Route
        path="/setup"
        element={session ? <Setup session={session} /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard"
        element={session ? <Dashboard session={session} /> : <Navigate to="/login" />}
      />
      <Route path="/:slug" element={<Shop />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}