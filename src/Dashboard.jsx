   import { useEffect, useState } from 'react'
   import { useNavigate } from 'react-router-dom'
   import { supabase } from './supabase'

   export default function Dashboard({ session }) {
     const [seller, setSeller] = useState(null)
     const [loading, setLoading] = useState(true)
     const navigate = useNavigate()

     useEffect(() => {
       supabase
         .from('sellers')
         .select('*')
         .eq('id', session.user.id)
         .maybeSingle()
         .then(({ data }) => {
           if (!data) navigate('/setup')
           else setSeller(data)
           setLoading(false)
         })
     }, [])

     if (loading || !seller) return <p>Loading...</p>

     return (
       <div style={{ maxWidth: 500, margin: '40px auto', padding: 16 }}>
         <h1>{seller.shop_name}</h1>
         <p>Your shop link: {window.location.origin}/{seller.slug}</p>
         <p>WhatsApp: {seller.whatsapp_number}</p>
         <button onClick={() => supabase.auth.signOut()}>Log out</button>
       </div>
     )
   }