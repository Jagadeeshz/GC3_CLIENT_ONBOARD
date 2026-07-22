-- Migration 029: Create workspace_members table
-- Allows client owners to invite and manage team members within their workspace

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'project_manager', 'marketing', 'finance', 'reviewer', 'viewer')),
  department TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, client_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_profile_id ON workspace_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_client_id ON workspace_members(client_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON workspace_members(status);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: workspace members can read members in their own client workspace
CREATE POLICY "workspace_members_select_own"
  ON workspace_members FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM workspace_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
    OR client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Client owners can manage workspace members
CREATE POLICY "workspace_members_manage_owner"
  ON workspace_members FOR ALL
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Admin roles can manage all workspace members
CREATE POLICY "workspace_members_manage_admin"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('cpiu', 'leadership')
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_workspace_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workspace_members_updated_at
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION update_workspace_members_updated_at();
