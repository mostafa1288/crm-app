# دليل إعداد نظام إدارة العملاء
## Supabase + Vercel + تنبيهات تلقائية

---

## الخطوة 1 — إنشاء قاعدة البيانات (Supabase)

1. افتح [supabase.com](https://supabase.com) وأنشئ حساب مجاني
2. اضغط **New Project** — اختار اسماً وكلمة مرور قوية
3. بعد ما يخلص الإعداد (دقيقتين)، افتح **SQL Editor**
4. انسخ كل محتوى ملف `supabase/schema.sql` والصقه واضغط **Run**

---

## الخطوة 2 — إضافة أعضاء الفريق

1. في Supabase → **Authentication** → **Users**
2. اضغط **Invite User** وادخل إيميل كل عضو
3. كل واحد هياخد إيميل ويعمل كلمة مرور

---

## الخطوة 3 — رفع الموقع على Vercel

1. افتح [vercel.com](https://vercel.com) وأنشئ حساب مجاني
2. ارفع مجلد المشروع على GitHub (مجاني) أو استخدم Vercel CLI:
   ```bash
   npm i -g vercel
   cd crm-app
   vercel
   ```
3. في Vercel → **Settings** → **Environment Variables** أضف:
   - `VITE_SUPABASE_URL` ← من Supabase → Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY` ← من Supabase → Settings → API → anon public

4. اضغط **Redeploy** — موقعك هيكون جاهز على رابط مثل `https://crm-yourname.vercel.app`

---

## الخطوة 4 — تفعيل التنبيهات بالإيميل (مجاني)

### أ) أنشئ حساب Resend
1. افتح [resend.com](https://resend.com) — مجاني لـ 3000 إيميل/شهر
2. أنشئ **API Key** واحفظه
3. أضف دومينك أو استخدم `onboarding@resend.dev` للاختبار

### ب) نشر الـ Edge Function
```bash
# ثبّت Supabase CLI
npm install -g supabase

# سجّل دخول
supabase login

# اربط بالمشروع (اوجد Project Reference من Settings → General)
supabase link --project-ref YOUR_PROJECT_REF

# أضف المتغيرات السرية
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set FROM_EMAIL=noreply@yourdomain.com

# ارفع الـ Function
supabase functions deploy send-reminders
```

### ج) فعّل الـ Cron Job
في Supabase → **Database** → **Cron Jobs** → **New Job**:
- Name: `daily-reminders`
- Schedule: `0 6 * * *` (كل يوم 8 صباحاً بتوقيت القاهرة)
- Function: `send-reminders`

---

## الخطوة 5 — تفعيل واتساب (اختياري)

1. افتح [ultramsg.com](https://ultramsg.com) — ~$15/شهر
2. اربط حساب WhatsApp Business بتاعك
3. احفظ الـ Token وInstance ID
4. أضفهم للـ Supabase:
   ```bash
   supabase secrets set ULTRAMSG_TOKEN=xxxx
   supabase secrets set ULTRAMSG_INSTANCE=instance12345
   ```
5. في كل عميل في النظام، أضف رقم واتساپه في حقل **"واتساب لإرسال تنبيه للعميل"**

---

## جدول التنبيهات

| متى | نوع التنبيه | المستقبل |
|-----|-------------|----------|
| قبل 30 يوم | 🟡 إيميل | المسؤول عن العميل |
| قبل 7 أيام | 🔴 إيميل عاجل | المسؤول عن العميل |
| قبل 30 يوم | 🟡 واتساب | العميل مباشرة |
| قبل 7 أيام | 🔴 واتساب عاجل | العميل مباشرة |

---

## ملاحظات مهمة

- **الأمان:** ملف `.env.local` لا يُرفع على GitHub أبداً (محمي بـ .gitignore)
- **الصلاحيات:** كل أعضاء الفريق المسجلين يقدروا يشوفوا ويعدلوا كل العملاء
- **البيانات:** محفوظة في Supabase (PostgreSQL) — مش في المتصفح
- **الحجم المجاني:** Supabase مجاني لـ 50,000 صف و 500MB — يكفي لسنين

---

## في حالة أي مشكلة

- Supabase Logs: Dashboard → **Logs** → **Edge Functions**
- إيميل مش بييجي: تأكد من API Key وإن الدومين متحقق في Resend
- خطأ في تسجيل الدخول: تأكد إن المستخدم موجود في Authentication → Users
