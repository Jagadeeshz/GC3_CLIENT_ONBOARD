-- GC³ Portal Database Schema
-- Migration 007: Create requests table

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT,
  due_date DATE,
  estimated_hours NUMERIC(8,2),
  actual_hours NUMERIC(8,2) DEFAULT 0,
  clickup_task_id TEXT,
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_pod_id ON requests(pod_id);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_clickup_task_id ON requests(clickup_task_id);
