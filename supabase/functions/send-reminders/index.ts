// Supabase Edge Function: send-reminders
// يشتغل كل يوم الساعة 8 صباحاً (Cron: "0 6 * * *" UTC = 8am Cairo)
// يبعت إيميل لكل عقد هينتهي خلال 30 أو 7 أيام

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') || 'crm@yourdomain.com'
const ULTRAMSG_TOKEN = Deno.env.get('ULTRAMSG_TOKEN')   // واتساب (اختياري)
const ULTRAMSG_INSTANCE = Deno.env.get('ULTRAMSG_INSTANCE') // اختياري

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // جيب كل العقود اللي هتنتهي خلال 30 يوم (ولسه ما انتهتش)
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .gte('renewal_date', today.toISOString().split('T')[0])
    .lte('renewal_date', new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0])

  if (error) {
    console.error('DB error:', error)
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  const results = []

  for (const client of clients || []) {
    const renewDate = new Date(client.renewal_date)
    const daysLeft  = Math.ceil((renewDate - today) / 86400000)

    // بعت بس عند 30 يوم أو 7 أيام
    if (daysLeft !== 30 && daysLeft !== 7) continue

    const urgency = daysLeft <= 7 ? '🔴 عاجل' : '🟡 تنبيه'
    const subject = `${urgency} — عقد ${client.name} ينتهي خلال ${daysLeft} يوم`
    const body    = buildEmailBody(client, daysLeft)

    // ── إيميل (Resend) ──────────────────────────────────────
    const emailTo = client.notify_email || client.email
    if (emailTo && RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: emailTo,
            subject,
            html: body
          })
        })
        const json = await res.json()
        results.push({ client: client.name, type: 'email', status: res.ok ? 'sent' : 'failed', detail: json })
        console.log(`Email → ${emailTo}: ${res.ok ? 'OK' : 'FAIL'}`)
      } catch (e) {
        console.error('Email error:', e)
        results.push({ client: client.name, type: 'email', status: 'error', detail: e.message })
      }
    }

    // ── واتساب (Ultramsg) ───────────────────────────────────
    const waNumber = client.notify_whatsapp
    if (waNumber && ULTRAMSG_TOKEN && ULTRAMSG_INSTANCE) {
      const waMsg = buildWhatsAppMsg(client, daysLeft)
      try {
        const res = await fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: ULTRAMSG_TOKEN, to: waNumber, body: waMsg })
        })
        const json = await res.json()
        results.push({ client: client.name, type: 'whatsapp', status: res.ok ? 'sent' : 'failed', detail: json })
        console.log(`WhatsApp → ${waNumber}: ${res.ok ? 'OK' : 'FAIL'}`)
      } catch (e) {
        results.push({ client: client.name, type: 'whatsapp', status: 'error', detail: e.message })
      }
    }
  }

  return new Response(JSON.stringify({ processed: clients?.length, sent: results }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// ─── HTML Email Template ────────────────────────────────────────────────────
function buildEmailBody(c, daysLeft) {
  const formatDate = d => d ? new Date(d).toLocaleDateString('ar-EG') : '—'
  const urgent = daysLeft <= 7
  const color  = urgent ? '#a32d2d' : '#854f0b'
  const bgColor = urgent ? '#fcebeb' : '#faeeda'

  return `
<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f4f0;margin:0;padding:20px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:${bgColor};padding:20px 24px;border-bottom:1px solid ${color}30;">
      <h2 style="margin:0;color:${color};font-size:18px;">
        ${urgent ? '🔴 تنبيه عاجل' : '🟡 تذكير تجديد عقد'}
      </h2>
      <p style="margin:6px 0 0;color:${color};font-size:14px;opacity:.85;">
        العقد ينتهي خلال <strong>${daysLeft} يوم</strong>
      </p>
    </div>
    <div style="padding:20px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${row('العميل', c.name)}
        ${row('نوع العقد', c.contract_type || '—')}
        ${row('تاريخ التجديد', formatDate(c.renewal_date))}
        ${row('الهاتف', c.phone || '—')}
        ${row('البريد', c.email || '—')}
        ${row('المسؤول', c.owner || '—')}
        ${c.contract_value ? row('قيمة العقد', Number(c.contract_value).toLocaleString('ar-EG') + ' جنيه') : ''}
        ${c.notes ? row('ملاحظات', c.notes) : ''}
      </table>
    </div>
    <div style="padding:12px 24px;background:#fafaf8;border-top:1px solid #e0e0e0;font-size:12px;color:#9c9a92;text-align:center;">
      تم الإرسال تلقائياً من نظام إدارة العملاء
    </div>
  </div>
</body></html>`
}

function row(label, value) {
  return `<tr>
    <td style="padding:7px 0;color:#6b6b66;width:40%;border-bottom:1px solid #f0f0f0;">${label}</td>
    <td style="padding:7px 0;font-weight:600;border-bottom:1px solid #f0f0f0;">${value}</td>
  </tr>`
}

// ─── WhatsApp Message ───────────────────────────────────────────────────────
function buildWhatsAppMsg(c, daysLeft) {
  const urgent = daysLeft <= 7
  const formatDate = d => d ? new Date(d).toLocaleDateString('ar-EG') : '—'
  return `${urgent ? '🔴' : '🟡'} *تنبيه تجديد عقد*

مرحباً،

نود إعلامكم بأن عقد *${c.name}* ينتهي خلال *${daysLeft} يوم*.

📅 تاريخ التجديد: ${formatDate(c.renewal_date)}
📋 نوع العقد: ${c.contract_type || '—'}
${c.contract_value ? `💰 القيمة: ${Number(c.contract_value).toLocaleString('ar-EG')} جنيه\n` : ''}
يرجى التواصل للتجديد في أقرب وقت.

شكراً لتعاملكم معنا 🙏`
}
