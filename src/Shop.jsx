import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabase'

// wa.me needs digits only, with country code. Cameroon = 237.
function cleanNumber(raw) {
  let digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 9) digits = '237' + digits
  return digits
}

export default function Shop() {
  const { slug } = useParams()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase
        .from('sellers')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      setSeller(s)

      if (s) {
        const { data: p } = await supabase
          .from('products')
          .select('*')
          .eq('shop_id', s.id)
          .order('created_at', { ascending: false })
        setProducts(p || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <p style={{ padding: 16 }}>Loading...</p>
  if (!seller) return <p style={{ padding: 16 }}>Shop not found.</p>

  function orderLink(p) {
    const message =
      `Bonjour, je voudrais commander : ${p.name} ` +
      `(${p.price.toLocaleString('fr-FR')} XAF).\n` +
      `${window.location.href}`
    return `https://wa.me/${cleanNumber(seller.whatsapp_number)}?text=${encodeURIComponent(message)}`
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1>{seller.shop_name}</h1>

      {products.length === 0 && <p>No products yet.</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              overflow: 'hidden',
              opacity: p.available ? 1 : 0.5,
            }}
          >
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                style={{ width: '100%', height: 160, objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: 8 }}>
              <strong>{p.name}</strong>
              <div>{p.price.toLocaleString('fr-FR')} XAF</div>
              {p.description && <small>{p.description}</small>}

              {p.available ? (
                <a
                  href={orderLink(p)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    padding: 8,
                    textAlign: 'center',
                    background: '#25D366',
                    color: 'white',
                    borderRadius: 6,
                    textDecoration: 'none',
                  }}
                >
                  Order on WhatsApp
                </a>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <small>Out of stock</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}