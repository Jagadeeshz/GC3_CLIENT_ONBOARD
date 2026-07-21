-- GC³ Portal Database Schema
-- Migration 023: Create projects table and request_projects junction

-- ============================================================
-- PROJECTS
-- Represents high-level client engagements that group related requests
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  priority priority_level NOT NULL DEFAULT 'medium',
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,
  estimated_hours NUMERIC(10,2),
  budget NUMERIC(12,2),
  tags TEXT[] DEFAULT '{}',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  clickup_project_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indexes for projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_pod_id ON projects(pod_id);
CREATE INDEX idx_projects_lead_id ON projects(lead_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_target_end_date ON projects(target_end_date);
CREATE INDEX idx_projects_clickup_project_id ON projects(clickup_project_id);

-- ============================================================
-- REQUEST_PROJECTS
-- Junction table linking requests to projects (many-to-many)
-- A request can belong to multiple projects across phases
-- ============================================================
CREATE TABLE request_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, project_id)
);

CREATE INDEX idx_request_projects_request_id ON request_projects(request_id);
CREATE INDEX idx_request_projects_project_id ON request_projects(project_id);

-- ============================================================
-- Add project_id to requests (optional direct FK for quick lookups)
-- ============================================================
ALTER TABLE requests ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_requests_project_id ON requests(project_id);
