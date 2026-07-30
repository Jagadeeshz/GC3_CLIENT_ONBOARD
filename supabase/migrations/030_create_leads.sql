-- Migration: create leads table
-- File: supabase/migrations/030_create_leads.sql

-- DROP TABLE IF EXISTS public.leads;

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text,
  company_size text,
  service text,
  preferred_demo_date date,
  preferred_demo_time time,
  message text,
  status text DEFAULT 'new',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_leads_status ON public.leads(status);
