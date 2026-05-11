-- ============================================================
-- شغّل هذا الكود في Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. جدول العملاء
CREATE TABLE IF NOT EXISTS public.clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),

  -- بيانات العميل
  name             TEXT NOT NULL,
  phone            TEXT,
  phone2           TEXT,
  email            TEXT,

  -- بيانات العقد
  contract_type    TEXT DEFAULT 'خدمات',
  start_date       DATE,
  renewal_date     DATE,
  contract_value   NUMERIC(12,2),
  owner            TEXT,
  notes            TEXT,

  -- إعدادات التنبيهات
  notify_email     TEXT,   -- إيميل استلام التنبيه (للمسؤول)
  notify_whatsapp  TEXT    -- رقم واتساب العميل لإرسال تنبيه له
);

-- 2. Row Level Security — كل أعضاء الفريق المسجلين يقدروا يشوفوا ويعدلوا
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can do everything"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Index على تاريخ التجديد للأداء
CREATE INDEX IF NOT EXISTS idx_clients_renewal_date ON public.clients(renewal_date);

-- 4. Trigger: تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
