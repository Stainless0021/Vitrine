import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function ProductList({ shopId, refreshKey }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [shopId, refreshKey])

  async function toggleAvailable(p) {
    await supabase
      .from('products')
      .update({ available: !p.available })
      .eq('id', p.id)
    load()
  }

  async function remove(p) {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', p.id)
    load()
  }

  if (loading) return <p>Loading products...</p>
  if (products.length === 0) return <p>No products yet.</p>

  return (
    <div style={{ display: 'grid', gap: 12, margin: '16px 0' }}>
      <h3>Your products</h3>
      {products.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 8,
            opacity: p.available ? 1 : 0.5,
          }}
        >
          {p.image_url && (
            <img
              src={p.image_url}
              alt={p.name}
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }}
            />
          )}
          <div style={{ flex: 1 }}>
            <strong>{p.name}</strong>
            <div>{p.price.toLocaleString('fr-FR')} XAF</div>
            {!p.available && <small>Out of stock</small>}
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <button onClick={() => toggleAvailable(p)}>
              {p.available ? 'Out of stock' : 'In stock'}
            </button>
            <button onClick={() => remove(p)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}