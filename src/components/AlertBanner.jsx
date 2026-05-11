import { useState } from 'react'

export default function AlertBanner({ type, clients, label }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const isDanger = type === 'danger'
  const bg    = isDanger ? 'var(--red-bg)'   : 'var(--amber-bg)'
  const color = isDanger ? 'var(--red-text)' : 'var(--amber-text)'
  const icon  = isDanger ? '🔴' : '🟡'

  return (
    <div style={{
      background: bg, border: `0.5px solid ${color}`,
      borderRadius: 10, padding: '10px 14px', marginBottom: 10,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 4 }}>
          {icon} {label} ({clients.length})
        </div>
        <div style={{ fontSize: 12, color, opacity: 0.85, lineHeight: 1.6 }}>
          {clients.slice(0, 5).map(c => {
            const diff = Math.ceil((new Date(c.renewal_date) - new Date()) / 86400000)
            return (
              <span key={c.id} style={{ marginInlineEnd: 16 }}>
                {c.name}
                {c.renewal_date && (
                  <span style={{ opacity: 0.7, marginRight: 4 }}>
                    ({diff < 0 ? `منذ ${Math.abs(diff)} يوم` : `بعد ${diff} يوم`})
                  </span>
                )}
              </span>
            )
          })}
          {clients.length > 5 && <span>و {clients.length - 5} آخرين…</span>}
        </div>
      </div>
      <button onClick={() => setDismissed(true)} style={{
        background: 'none', border: 'none', color, fontSize: 16,
        cursor: 'pointer', lineHeight: 1, flexShrink: 0, padding: 2
      }}>✕</button>
    </div>
  )
}
