import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import ClientTable from '../components/ClientTable'
import ClientModal from '../components/ClientModal'
import StatsBar from '../components/StatsBar'
import AlertBanner from '../components/AlertBanner'

export default function DashboardPage({ session }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editClient, setEditClient] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('renewal_date', { ascending: true })
    if (!error) setClients(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function openAdd() { setEditClient(null); setModalOpen(true) }
  function openEdit(c) { setEditClient(c); setModalOpen(true) }

  async function handleDelete(id) {
    if (!confirm('هل تريد حذف هذا العميل؟')) return
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  function getStatus(renewalDate) {
    if (!renewalDate) return 'ok'
    const diff = Math.ceil((new Date(renewalDate) - new Date()) / 86400000)
    if (diff < 0) return 'danger'
    if (diff <= 30) return 'warn'
    return 'ok'
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) || c.email?.toLowerCase().includes(q) ||
      c.owner?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || getStatus(c.renewal_date) === filterStatus
    return matchSearch && matchStatus
  })

  const expiringSoon = clients.filter(c => getStatus(c.renewal_date) === 'warn')
  const expired = clients.filter(c => getStatus(c.renewal_date) === 'danger')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
        padding: '0 1.5rem', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>إدارة العملاء والعقود</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.user.email}</span>
          <button onClick={handleLogout} style={{
            fontSize: 12, padding: '5px 12px', border: '0.5px solid var(--border)',
            borderRadius: 8, background: 'transparent', color: 'var(--text-muted)'
          }}>خروج</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Alert banners */}
        {expired.length > 0 && (
          <AlertBanner type="danger" clients={expired} label="عقود منتهية" />
        )}
        {expiringSoon.length > 0 && (
          <AlertBanner type="warn" clients={expiringSoon} label="تنتهي خلال 30 يوم" />
        )}

        {/* Stats */}
        <StatsBar clients={clients} getStatus={getStatus} />

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-hint)', fontSize: 15, pointerEvents: 'none'
            }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف أو البريد..."
              style={{
                width: '100%', padding: '8px 34px 8px 12px',
                border: '0.5px solid var(--border)', borderRadius: 8,
                fontSize: 13, background: 'var(--surface)',
                color: 'var(--text)', outline: 'none'
              }}
            />
          </div>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px', border: '0.5px solid var(--border)',
              borderRadius: 8, fontSize: 13, background: 'var(--surface)',
              color: 'var(--text)', outline: 'none'
            }}
          >
            <option value="">كل الحالات</option>
            <option value="ok">سارية</option>
            <option value="warn">قريبة التجديد</option>
            <option value="danger">منتهية</option>
          </select>
          <button onClick={openAdd} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', border: '0.5px solid var(--border)',
            borderRadius: 8, background: 'var(--text)', color: '#fff',
            fontSize: 13, fontWeight: 600
          }}>+ عميل جديد</button>
        </div>

        {/* Table */}
        <ClientTable
          clients={filtered}
          loading={loading}
          getStatus={getStatus}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal */}
      {modalOpen && (
        <ClientModal
          client={editClient}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchClients() }}
        />
      )}
    </div>
  )
}
