-- GC³ Portal Database Schema
-- Migration 021: Enable RLS and create policies

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- CLIENTS
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Clients can read their own record
CREATE POLICY "Clients can view own client record"
  ON clients FOR SELECT
  USING (profile_id = auth.uid());

-- Admins and pod managers can view all clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- Pod members can view clients assigned to their pods
CREATE POLICY "Pod members can view assigned clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_pods cp
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE cp.client_id = clients.id AND pm.profile_id = auth.uid()
    )
  );

-- Admins can insert clients
CREATE POLICY "Admins can create clients"
  ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Admins can update clients
CREATE POLICY "Admins can update clients"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- PODS
-- ============================================================
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;

-- Everyone can read pods
CREATE POLICY "Authenticated users can view pods"
  ON pods FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage pods
CREATE POLICY "Admins can manage pods"
  ON pods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- POD MEMBERS
-- ============================================================
ALTER TABLE pod_members ENABLE ROW LEVEL SECURITY;

-- Everyone can read pod members
CREATE POLICY "Authenticated users can view pod members"
  ON pod_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage pod members
CREATE POLICY "Admins can manage pod members"
  ON pod_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- CLIENT_PODS
-- ============================================================
ALTER TABLE client_pods ENABLE ROW LEVEL SECURITY;

-- Everyone can read client_pods
CREATE POLICY "Authenticated users can view client_pods"
  ON client_pods FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage client_pods
CREATE POLICY "Admins can manage client_pods"
  ON client_pods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- REQUESTS
-- ============================================================
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Clients can view their own requests
CREATE POLICY "Clients can view own requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = requests.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod members can view requests assigned to their pods
CREATE POLICY "Pod members can view pod requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = requests.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- Pod managers can view requests for pods they manage
CREATE POLICY "Pod managers can view managed pod requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pods
      WHERE pods.id = requests.pod_id AND pods.manager_id = auth.uid()
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
  ON requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Clients can create requests
CREATE POLICY "Clients can create requests"
  ON requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = requests.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Admins and pod managers can update requests
CREATE POLICY "Admins and managers can update requests"
  ON requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
    OR EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = requests.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DELIVERABLES
-- ============================================================
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Clients can view deliverables for their requests
CREATE POLICY "Clients can view own deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests r
      JOIN clients c ON c.id = r.client_id
      WHERE r.id = deliverables.request_id AND c.profile_id = auth.uid()
    )
  );

-- Pod members can view deliverables for their pods
CREATE POLICY "Pod members can view pod deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = deliverables.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- Admins can view all deliverables
CREATE POLICY "Admins can view all deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Pod members can manage deliverables
CREATE POLICY "Pod members can manage deliverables"
  ON deliverables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pod_members
      WHERE pod_members.pod_id = deliverables.pod_id AND pod_members.profile_id = auth.uid()
    )
  );

-- ============================================================
-- DELIVERABLE VERSIONS
-- ============================================================
ALTER TABLE deliverable_versions ENABLE ROW LEVEL SECURITY;

-- Follow same policy as deliverables
CREATE POLICY "Users can view deliverable versions"
  ON deliverable_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Pod members can manage deliverable versions"
  ON deliverable_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN pod_members pm ON pm.pod_id = d.pod_id
      WHERE d.id = deliverable_versions.deliverable_id AND pm.profile_id = auth.uid()
    )
  );

-- ============================================================
-- HOURS WALLET
-- ============================================================
ALTER TABLE hours_wallet ENABLE ROW LEVEL SECURITY;

-- Clients can view their own wallet
CREATE POLICY "Clients can view own wallet"
  ON hours_wallet FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = hours_wallet.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod members assigned to client can view wallet
CREATE POLICY "Pod members can view assigned client wallet"
  ON hours_wallet FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_pods cp
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE cp.client_id = hours_wallet.client_id AND pm.profile_id = auth.uid()
    )
  );

-- Admins can manage wallets
CREATE POLICY "Admins can manage wallets"
  ON hours_wallet FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- HOURS TRANSACTIONS
-- ============================================================
ALTER TABLE hours_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view hours transactions"
  ON hours_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage hours transactions"
  ON hours_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- ============================================================
-- DOCUMENTS
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Clients can view their own documents
CREATE POLICY "Clients can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = documents.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod members can view documents for their pods
CREATE POLICY "Pod members can view pod documents"
  ON documents FOR SELECT
  USING (
    documents.client_id IS NULL OR
    EXISTS (
      SELECT 1 FROM client_pods cp
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE cp.client_id = documents.client_id AND pm.profile_id = auth.uid()
    )
  );

-- Admins can manage documents
CREATE POLICY "Admins can manage documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- DOCUMENT VERSIONS
-- ============================================================
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage document versions"
  ON document_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- INVOICES
-- ============================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Clients can view their own invoices
CREATE POLICY "Clients can view own invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = invoices.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Admins can manage invoices
CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- INVOICE LINE ITEMS
-- ============================================================
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view invoice line items"
  ON invoice_line_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage invoice line items"
  ON invoice_line_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- PAYMENTS
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clients can view their own payments
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = payments.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Admins can manage payments
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- CONTACTS
-- ============================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Clients can view their own contacts
CREATE POLICY "Clients can view own contacts"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = contacts.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod members can view contacts for assigned clients
CREATE POLICY "Pod members can view assigned contacts"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_pods cp
      JOIN pod_members pm ON pm.pod_id = cp.pod_id
      WHERE cp.client_id = contacts.client_id AND pm.profile_id = auth.uid()
    )
  );

-- Admins can manage contacts
CREATE POLICY "Admins can manage contacts"
  ON contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- FAQ
-- ============================================================
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Everyone can read published FAQs
CREATE POLICY "Anyone can view published FAQs"
  ON faq FOR SELECT
  USING (is_published = true);

-- Admins can manage FAQs
CREATE POLICY "Admins can manage FAQs"
  ON faq FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CONVERSATIONS
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Members can view conversations they are part of
CREATE POLICY "Members can view own conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = conversations.id
      AND conversation_members.profile_id = auth.uid()
    )
  );

-- Authenticated users can create conversations
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CONVERSATION MEMBERS
-- ============================================================
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Members can view conversation members
CREATE POLICY "Members can view conversation members"
  ON conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id
      AND cm.profile_id = auth.uid()
    )
  );

-- Admins can manage conversation members
CREATE POLICY "Admins can manage conversation members"
  ON conversation_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Members can view messages in their conversations
CREATE POLICY "Members can view conversation messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.profile_id = auth.uid()
    )
  );

-- Members can send messages in their conversations
CREATE POLICY "Members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_members.conversation_id = messages.conversation_id
      AND conversation_members.profile_id = auth.uid()
    )
  );

-- Senders can update their own messages
CREATE POLICY "Senders can update own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

-- System can create activity logs
CREATE POLICY "System can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- CHANGE REQUESTS
-- ============================================================
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Clients can view their own change requests
CREATE POLICY "Clients can view own change requests"
  ON change_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = change_requests.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Clients can create change requests
CREATE POLICY "Clients can create change requests"
  ON change_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = change_requests.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Pod managers and admins can update change requests
CREATE POLICY "Managers and admins can update change requests"
  ON change_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership', 'pod_manager')
    )
  );

-- ============================================================
-- FEEDBACK
-- ============================================================
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Clients can view and create their own feedback
CREATE POLICY "Clients can view own feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = feedback.client_id AND clients.profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = feedback.client_id AND clients.profile_id = auth.uid()
    )
  );

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );

-- ============================================================
-- SETTINGS
-- ============================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('cpiu', 'leadership')
    )
  );
