function initials(name = '') {
  return name.trim().split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase()
}

function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function StatusBadge({ status, renewalDate }) {
  const diff = renewalDate
    ? Math.ceil((new Date(renewalDate) - new Date()) / 86400000)
    : null

  const map = {
    ok:     { bg: 'var(--green-bg)',  color: 'var(--green-text)',  label: 'سارية' },
    warn:   { bg: 'var(--amber-bg)',  color: 'var(--amber-text)',  label: diff !== null ? `${diff} يوم` : 'قريبة' },
    danger: { bg: 'var(--red-bg)',    color: 'var(--red-text)',    label: 'منتهية' },
  }
  const s = map[status] || map.ok
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, background: s.bg, color: s.color
    }}>{s.label}</span>
  )
}

export default function ClientTable({ clients, loading, getStatus, onEdit, onDelete }) {
  if (loading) {
    return (
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 12, padding: '3rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: 14
      }}>جاري التحميل…</div>
    )
  }

  if (clients.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 12, padding: '3rem', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: 14
      }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
        لا توجد بيانات. أضف عميلاً للبدء أو غيّر فلتر البحث.
      </div>
    )
  }

  const cols = [
    { key: 'name',          label: 'العميل',        w: '22%' },
    { key: 'phone',         label: 'الهاتف',        w: '14%' },
    { key: 'email',         label: 'البريد',        w: '18%' },
    { key: 'contract_type', label: 'نوع العقد',     w: '11%' },
    { key: 'renewal_date',  label: 'تاريخ التجديد', w: '13%' },
    { key: 'status',        label: 'الحالة',        w: '10%' },
    { key: 'actions',       label: '',              w: '8%'  },
  ]

  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border)',
      borderRadius: 12, overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ background: '#fafaf8' }}>
              {cols.map(c => (
                <th key={c.key} style={{
                  width: c.w, padding: '9px 12px', textAlign: 'right',
                  fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                  borderBottom: '0.5px solid var(--border)', whiteSpace: 'nowrap'
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => {
              const status = getStatus(c.renewal_date)
              return (
                <tr key={c.id} style={{
                  borderBottom: i < clients.length - 1 ? '0.5px solid var(--border)' : 'none'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  {/* Name + avatar */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: 'var(--purple-bg)', color: 'var(--purple-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700
                      }}>{initials(c.name)}</div>
                      <span style={{
                        fontSize: 13, fontWeight: 600, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{c.phone || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 12 }}>
                    {c.email
                      ? <a href={`mailto:${c.email}`} style={{ color: 'var(--blue-text)', textDecoration: 'none' }}>{c.email}</a>
                      : '—'}
                  </td>
                  <td style={tdStyle}>{c.contract_type || '—'}</td>
                  <td style={tdStyle}>{formatDate(c.renewal_date)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={status} renewalDate={c.renewal_date} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => onEdit(c)} title="تعديل" style={actionBtn}>✏️</button>
                      <button onClick={() => onDelete(c.id)} title="حذف" style={actionBtn}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{
        padding: '8px 14px', fontSize: 12, color: 'var(--text-hint)',
        borderTop: '0.5px solid var(--border)'
      }}>
        {clients.length} عميل
      </div>
    </div>
  )
}

const tdStyle = {
  padding: '10px 12px', fontSize: 13, color: 'var(--text)',
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
}

const actionBtn = {
  background: 'none', border: '0.5px solid var(--border)', borderRadius: 6,
  width: 28, height: 28, cursor: 'pointer', fontSize: 13,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}
