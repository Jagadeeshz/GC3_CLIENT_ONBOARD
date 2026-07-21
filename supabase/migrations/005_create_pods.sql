-- GC³ Portal Database Schema
-- Migration 005: Create pods and pod_members tables

CREATE TABLE pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER pods_updated_at
  BEFORE UPDATE ON pods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE pod_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pod_id, profile_id)
);

CREATE TRIGGER pod_members_updated_at
  BEFORE UPDATE ON pod_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_pods_manager_id ON pods(manager_id);
CREATE INDEX idx_pod_members_pod_id ON pod_members(pod_id);
CREATE INDEX idx_pod_members_profile_id ON pod_members(profile_id);
