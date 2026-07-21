-- GC³ Portal Database Schema
-- Migration 026: Harden RLS policies
-- Replaces overly permissive `auth.role() = 'authenticated'` policies
-- with proper role-based access control

-- ============================================================
-- PROJECTS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Clients can view their own projects
CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = projects.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod members can view projects assigned to their pods
CREATE POLICY "Pod members can view pod projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = projects.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- Pod managers can view projects for pods they manage
CREATE POLICY "Pod managers can view managed projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pods
      WHERE pods.id = projects.pod_id AND pods.manager_id = auth.uid()
    )
  );

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Clients can create projects
CREATE POLICY "Clients can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = projects.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Admins, pod managers, and assigned leads can update projects
CREATE POLICY "Admins and managers can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
    OR lead_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = projects.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- Admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- REQUEST_PROJECTS
-- ============================================================
ALTER TABLE request_projects ENABLE ROW LEVEL SECURITY;

-- Follow same visibility as projects (via project join)
CREATE POLICY "Users can view request_projects for visible projects"
  ON request_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = request_projects.project_id
        AND (
          EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = p.client_id AND clients.profile_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM pod_members
            WHERE pod_members.pod_id = p.pod_id AND pod_members.profile_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM pods
            WHERE pods.id = p.pod_id AND pods.manager_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
          )
        )
    )
  );

-- Admins and pod members can manage request_projects
CREATE POLICY "Admins and managers can manage request_projects"
  ON request_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- ============================================================
-- Harden existing policies: Replace auth.role() = 'authenticated'
-- ============================================================

-- PODS: Replace blanket authenticated SELECT with role-scoped
DROP POLICY IF EXISTS "Authenticated users can view pods" ON pods;
CREATE POLICY "Staff can view pods"
  ON pods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('pod_member', 'pod_manager', 'cpiu', 'leadership')
    )
  );

-- POD_MEMBERS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can view pod members" ON pod_members;
CREATE POLICY "Staff can view pod members"
  ON pod_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('pod_member', 'pod_manager', 'cpiu', 'leadership')
    )
  );

-- CLIENT_PODS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can view client_pods" ON client_pods;
CREATE POLICY "Staff can view client_pods"
  ON client_pods FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('pod_member', 'pod_manager', 'cpiu', 'leadership')
    )
  );

-- DELIVERABLE_VERSIONS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Users can view deliverable versions" ON deliverable_versions;
CREATE POLICY "Users can view deliverable versions for own deliverables"
  ON deliverable_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN requests r ON r.id = d.request_id
      JOIN clients c ON c.id = r.client_id
      WHERE d.id = deliverable_versions.deliverable_id AND c.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM deliverables d
      JOIN pod_members pm ON pm.pod_id = d.pod_id
      WHERE d.id = deliverable_versions.deliverable_id AND pm.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- DOCUMENT_VERSIONS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
CREATE POLICY "Users can view document versions for accessible documents"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents doc
      JOIN clients c ON c.id = doc.client_id
      WHERE doc.id = document_versions.document_id AND c.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM documents doc
      JOIN client_pods cp ON cp.client_id = doc.client_id
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE doc.id = document_versions.document_id AND pm.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- INVOICE_LINE_ITEMS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can view invoice line items" ON invoice_line_items;
CREATE POLICY "Users can view invoice line items for own invoices"
  ON invoice_line_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices inv
      JOIN clients c ON c.id = inv.client_id
      WHERE inv.id = invoice_line_items.invoice_id AND c.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- HOURS_TRANSACTIONS: Replace blanket authenticated SELECT
DROP POLICY IF EXISTS "Authenticated users can view hours transactions" ON hours_transactions;
CREATE POLICY "Users can view hours transactions for own wallet"
  ON hours_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hours_wallet hw
      JOIN clients c ON c.id = hw.client_id
      WHERE hw.id = hours_transactions.wallet_id AND c.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM hours_wallet hw
      JOIN client_pods cp ON cp.client_id = hw.client_id
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE hw.id = hours_transactions.wallet_id AND pm.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- NOTIFICATIONS: Tighten INSERT policy (only system functions should create)
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "Only system functions can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = current_setting('request.jwt.claims', true)::json->>'role'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- ACTIVITY_LOGS: Tighten INSERT policy
DROP POLICY IF EXISTS "System can create activity logs" ON activity_logs;
CREATE POLICY "Only system functions can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- CONVERSATIONS: Tighten INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
CREATE POLICY "Staff can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('pod_member', 'pod_manager', 'cpiu', 'leadership', 'client')
    )
  );

-- SETTINGS: Tighten SELECT for sensitive settings
DROP POLICY IF EXISTS "Authenticated users can view settings" ON settings;
CREATE POLICY "Anyone can view public settings"
  ON settings FOR SELECT
  USING (
    category NOT IN ('auth', 'security')
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );
