export default function StatsBar({ clients, getStatus }) {
  const total = clients.length
  const active = clients.filter(c => getStatus(c.renewal_date) === 'ok').length
  const warn   = clients.filter(c => getStatus(c.renewal_date) === 'warn').length
  const danger = clients.filter(c => getStatus(c.renewal_date) === 'danger').length
  const totalValue = clients.reduce((s, c) => s + (parseFloat(c.contract_value) || 0), 0)

  const stats = [
    { label: 'إجمالي العملاء', value: total, color: 'var(--text)' },
    { label: 'عقود سارية',     value: active, color: 'var(--green-text)' },
    { label: 'قريبة التجديد',  value: warn,   color: 'var(--amber-text)' },
    { label: 'منتهية',         value: danger,  color: 'var(--red-text)' },
    { label: 'إجمالي العقود',  value: totalValue.toLocaleString('ar-EG') + ' ج', color: 'var(--blue-text)', small: true },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: 10, marginBottom: '1.25rem'
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'var(--surface)', border: '0.5px solid var(--border)',
          borderRadius: 12, padding: '12px 14px'
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontSize: s.small ? 16 : 22, fontWeight: 700, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
