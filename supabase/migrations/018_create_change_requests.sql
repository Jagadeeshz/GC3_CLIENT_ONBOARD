-- GC³ Portal Database Schema
-- Migration 018: Create change_requests table (Mid-Project Change Request Workflow)

CREATE TABLE change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status change_request_status NOT NULL DEFAULT 'draft',
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  estimated_hours NUMERIC(8,2),
  estimated_cost NUMERIC(12,2),
  reason TEXT,
  pod_manager_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  addon_invoice_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER change_requests_updated_at
  BEFORE UPDATE ON change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_change_requests_client_id ON change_requests(client_id);
CREATE INDEX idx_change_requests_request_id ON change_requests(request_id);
CREATE INDEX idx_change_requests_status ON change_requests(status);
CREATE INDEX idx_change_requests_created_at ON change_requests(created_at DESC);
