   import { useState } from 'react'
   import { useNavigate } from 'react-router-dom'
   import { supabase } from './supabase'

   function makeSlug(name) {
     return name
       .toLowerCase()
       .normalize('NFD')
       .replace(/[\u0300-\u036f]/g, '')
       .replace(/[^a-z0-9]+/g, '-')
       .replace(/^-|-$/g, '')
   }

   export default function Setup({ session }) {
     const [shopName, setShopName] = useState('')
     const [whatsapp, setWhatsapp] = useState('+237')
     const [error, setError] = useState('')
     const [loading, setLoading] = useState(false)
     const navigate = useNavigate()

     async function handleSubmit(e) {
       e.preventDefault()
       setLoading(true)
       setError('')
       const { error } = await supabase.from('sellers').insert({
         id: session.user.id,
         shop_name: shopName.trim(),
         whatsapp_number: whatsapp.replace(/\s/g, ''),
         slug: makeSlug(shopName),
       })
       if (error) {
         setError(
           error.code === '23505'
             ? 'This shop name is already taken. Try another one.'
             : error.message
         )
         setLoading(false)
       } else {
         navigate('/dashboard')
       }
     }

     return (
       <div style={{ maxWidth: 400, margin: '40px auto', padding: 16 }}>
         <h1>Set up your shop</h1>
         <form onSubmit={handleSubmit}>
           <input
             placeholder="Shop name"
             value={shopName}
             onChange={(e) => setShopName(e.target.value)}
             required
             style={{ display: 'block', width: '100%', marginBottom: 12 }}
           />
           <input
             placeholder="WhatsApp number"
             value={whatsapp}
             onChange={(e) => setWhatsapp(e.target.value)}
             required
             style={{ display: 'block', width: '100%', marginBottom: 12 }}
           />
           {shopName && (
             <p>
               Your link will be: <b>/{makeSlug(shopName)}</b>
             </p>
           )}
           {error && <p style={{ color: 'red' }}>{error}</p>}
           <button disabled={loading}>
             {loading ? 'Saving...' : 'Create my shop'}
           </button>
         </form>
       </div>
     )
   }