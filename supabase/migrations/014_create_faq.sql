-- GC³ Portal Database Schema
-- Migration 014: Create FAQ table

CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_faq_category ON faq(category);
CREATE INDEX idx_faq_sort_order ON faq(sort_order);
CREATE INDEX idx_faq_is_published ON faq(is_published);
