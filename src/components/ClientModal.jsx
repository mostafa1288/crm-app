import { useState } from 'react'
import { supabase } from '../lib/supabase'

const CONTRACT_TYPES = ['صيانة', 'إيجار', 'خدمات', 'توريد', 'استشارات', 'أخرى']

export default function ClientModal({ client, onClose, onSaved }) {
  const isEdit = !!client
  const [form, setForm] = useState({
    name:           client?.name           || '',
    phone:          client?.phone          || '',
    phone2:         client?.phone2         || '',
    email:          client?.email          || '',
    contract_type:  client?.contract_type  || 'صيانة',
    start_date:     client?.start_date     || '',
    renewal_date:   client?.renewal_date   || '',
    contract_value: client?.contract_value || '',
    owner:          client?.owner          || '',
    notes:          client?.notes          || '',
    notify_email:   client?.notify_email   || '',
    notify_whatsapp:client?.notify_whatsapp|| '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('الاسم مطلوب'); return }
    setLoading(true); setError('')

    const payload = { ...form, contract_value: parseFloat(form.contract_value) || null }

    let err
    if (isEdit) {
      ({ error: err } = await supabase.from('clients').update(payload).eq('id', client.id))
    } else {
      ({ error: err } = await supabase.from('clients').insert([payload]))
    }

    if (err) { setError('حدث خطأ: ' + err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16,
        border: '0.5px solid var(--border)', padding: '1.5rem',
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            {isEdit ? '✏️ تعديل بيانات العميل' : '➕ إضافة عميل جديد'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SectionTitle>بيانات العميل</SectionTitle>
          <Row>
            <Field label="اسم العميل *" value={form.name} onChange={v => set('name', v)} placeholder="شركة / مؤسسة / فرد" />
            <Field label="نوع العقد" type="select" value={form.contract_type} onChange={v => set('contract_type', v)} options={CONTRACT_TYPES} />
          </Row>

          <SectionTitle>بيانات الاتصال</SectionTitle>
          <Row>
            <Field label="الهاتف الأساسي" value={form.phone} onChange={v => set('phone', v)} placeholder="01xxxxxxxxx" />
            <Field label="هاتف بديل" value={form.phone2} onChange={v => set('phone2', v)} placeholder="اختياري" />
          </Row>
          <Field label="البريد الإلكتروني" type="email" value={form.email} onChange={v => set('email', v)} placeholder="example@email.com" full />

          <SectionTitle>بيانات العقد</SectionTitle>
          <Row>
            <Field label="تاريخ البداية" type="date" value={form.start_date} onChange={v => set('start_date', v)} />
            <Field label="تاريخ التجديد" type="date" value={form.renewal_date} onChange={v => set('renewal_date', v)} />
          </Row>
          <Row>
            <Field label="قيمة العقد (جنيه)" type="number" value={form.contract_value} onChange={v => set('contract_value', v)} placeholder="0" />
            <Field label="المسؤول" value={form.owner} onChange={v => set('owner', v)} placeholder="اسم المسؤول" />
          </Row>

          <SectionTitle>إعدادات التنبيهات</SectionTitle>
          <Field label="إيميل استلام التنبيه" type="email" value={form.notify_email} onChange={v => set('notify_email', v)} placeholder="مختلف عن الاتصال — للمسؤول" full />
          <Field label="واتساب لإرسال تنبيه للعميل" value={form.notify_whatsapp} onChange={v => set('notify_whatsapp', v)} placeholder="رقم واتساب العميل (مع كود الدولة: 2010xxxxxxxx)" full />

          <Field label="ملاحظات" type="textarea" value={form.notes} onChange={v => set('notes', v)} placeholder="أي ملاحظات إضافية…" full />
        </div>

        {error && (
          <div style={{ marginTop: 12, background: 'var(--red-bg)', color: 'var(--red-text)', fontSize: 13, padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem' }}>
          <button onClick={handleSave} disabled={loading} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: 'var(--text)', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
          }}>
            {loading ? 'جاري الحفظ…' : 'حفظ'}
          </button>
          <button onClick={onClose} style={{
            padding: '9px 16px', borderRadius: 8, border: '0.5px solid var(--border)',
            background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer'
          }}>إلغاء</button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: 'var(--text-hint)',
      textTransform: 'uppercase', letterSpacing: '.05em',
      paddingTop: 4, marginBottom: -2
    }}>{children}</div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>{children}</div>
}

function Field({ label, value, onChange, type = 'text', placeholder = '', options = [], full = false }) {
  const style = {
    padding: '8px 10px', border: '0.5px solid var(--border)',
    borderRadius: 8, fontSize: 13, background: '#fafaf8',
    color: 'var(--text)', width: '100%', outline: 'none',
    fontFamily: 'var(--font)', direction: 'rtl'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: full ? '1 / -1' : undefined }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={style}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ ...style, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={style} />
      )}
    </div>
  )
}
