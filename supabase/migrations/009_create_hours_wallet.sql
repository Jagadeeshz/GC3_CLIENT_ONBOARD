-- GC³ Portal Database Schema
-- Migration 009: Create hours_wallet table

CREATE TABLE hours_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  total_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_hours NUMERIC(10,2) NOT NULL DEFAULT 0,
  remaining_hours NUMERIC(10,2) GENERATED ALWAYS AS (total_hours - used_hours) STORED,
  billing_period_start DATE,
  billing_period_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER hours_wallet_updated_at
  BEFORE UPDATE ON hours_wallet
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE hours_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES hours_wallet(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  hours NUMERIC(8,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hours_wallet_client_id ON hours_wallet(client_id);
CREATE INDEX idx_hours_transactions_wallet_id ON hours_transactions(wallet_id);
CREATE INDEX idx_hours_transactions_request_id ON hours_transactions(request_id);
