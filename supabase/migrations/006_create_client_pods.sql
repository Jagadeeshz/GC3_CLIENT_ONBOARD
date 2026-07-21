-- GC³ Portal Database Schema
-- Migration 006: Create client_pod assignments table

CREATE TABLE client_pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, pod_id)
);

CREATE TRIGGER client_pods_updated_at
  BEFORE UPDATE ON client_pods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_client_pods_client_id ON client_pods(client_id);
CREATE INDEX idx_client_pods_pod_id ON client_pods(pod_id);
