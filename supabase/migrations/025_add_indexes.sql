-- GC³ Portal Database Schema
-- Migration 025: Add composite and covering indexes for performance

-- ============================================================
-- COMPOSITE INDEXES for common query patterns
-- ============================================================

-- Requests: client dashboard (my requests by status)
CREATE INDEX idx_requests_client_status ON requests(client_id, status);

-- Requests: pod workload (active requests per pod)
CREATE INDEX idx_requests_pod_status ON requests(pod_id, status);

-- Requests: due soon (client + due date + status)
CREATE INDEX idx_requests_client_due ON requests(client_id, due_date) WHERE due_date IS NOT NULL;

-- Requests: archived filtering
CREATE INDEX idx_requests_archived_created ON requests(is_archived, created_at DESC);

-- Requests: full-text search on title and description
CREATE INDEX idx_requests_search ON requests USING gin(to_tsvector('english', title || ' ' || description));

-- Projects: client dashboard
CREATE INDEX idx_projects_client_status ON projects(client_id, status);

-- Projects: pod workload
CREATE INDEX idx_projects_pod_status ON projects(pod_id, status);

-- Projects: active projects by end date (for deadline alerts)
CREATE INDEX idx_projects_active_deadlines ON projects(target_end_date, status)
  WHERE status IN ('in_progress', 'in_review') AND is_archived = false;

-- Projects: full-text search on name and description
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Deliverables: status within a request
CREATE INDEX idx_deliverables_request_status ON deliverables(request_id, status);

-- Documents: client + category (common filter)
CREATE INDEX idx_documents_client_category ON documents(client_id, category);

-- Messages: conversation pagination (conversation_id + created_at)
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Invoices: client + status (outstanding invoices)
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);

-- Payments: client + status
CREATE INDEX idx_payments_client_status ON payments(client_id, status);

-- Activity logs: entity lookup (entity_type + entity_id)
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Activity logs: user timeline
CREATE INDEX idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);

-- Notifications: unread count per user
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read) WHERE read = false;

-- Change requests: client + status (pending changes)
CREATE INDEX idx_change_requests_client_status ON change_requests(client_id, status);

-- Feedback: rating aggregation
CREATE INDEX idx_feedback_type_rating ON feedback(type, rating);

-- Conversations: full-text search on title
CREATE INDEX idx_conversations_search ON conversations USING gin(to_tsvector('english', COALESCE(title, '')));

-- Contacts: client + primary flag
CREATE INDEX idx_contacts_client_primary ON contacts(client_id, is_primary);

-- Pod members: lookup by profile (for "my pods" queries)
CREATE INDEX idx_pod_members_profile_pod ON pod_members(profile_id, pod_id);

-- Client pods: reverse lookup by pod (for "my clients" queries)
CREATE INDEX idx_client_pods_pod_client ON client_pods(pod_id, client_id);
