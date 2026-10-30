   import { useState } from 'react'
   import { Link } from 'react-router-dom'
   import { supabase } from './supabase'

   export default function Auth({ mode }) {
     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [error, setError] = useState('')
     const [loading, setLoading] = useState(false)
     const isSignup = mode === 'signup'

     async function handleSubmit(e) {
       e.preventDefault()
       setLoading(true)
       setError('')
       const credentials = { email, password }
       const { error } = isSignup
         ? await supabase.auth.signUp(credentials)
         : await supabase.auth.signInWithPassword(credentials)
       if (error) setError(error.message)
       setLoading(false)
     }

     return (
       <div style={{ maxWidth: 400, margin: '40px auto', padding: 16 }}>
         <h1>{isSignup ? 'Create your shop' : 'Log in'}</h1>
         <form onSubmit={handleSubmit}>
           <input
             type="email"
             placeholder="Email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             style={{ display: 'block', width: '100%', marginBottom: 12 }}
           />
           <input
             type="password"
             placeholder="Password (6+ characters)"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             minLength={6}
             style={{ display: 'block', width: '100%', marginBottom: 12 }}
           />
           {error && <p style={{ color: 'red' }}>{error}</p>}
           <button disabled={loading}>
             {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
           </button>
         </form>
         <p>
           {isSignup ? (
             <>Already have an account? <Link to="/login">Log in</Link></>
           ) : (
             <>No account yet? <Link to="/signup">Sign up</Link></>
           )}
         </p>
       </div>
     )
   }