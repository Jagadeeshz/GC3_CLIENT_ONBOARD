-- GC³ Portal Database Schema
-- Migration 008: Create deliverables table

CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  feedback_id UUID,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_deliverables_request_id ON deliverables(request_id);
CREATE INDEX idx_deliverables_pod_id ON deliverables(pod_id);
CREATE INDEX idx_deliverables_assigned_to ON deliverables(assigned_to);
CREATE INDEX idx_deliverables_status ON deliverables(status);

-- Deliverable version history
CREATE TABLE deliverable_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  change_notes TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deliverable_id, version)
);

CREATE INDEX idx_deliverable_versions_deliverable_id ON deliverable_versions(deliverable_id);
