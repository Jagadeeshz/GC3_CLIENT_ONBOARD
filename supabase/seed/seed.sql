-- GC³ Portal Seed Data
-- Run this after all migrations to populate initial data

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
  ('company_name', '"GC³ Portal"', 'Company name', 'general'),
  ('currency', '"USD"', 'Default currency', 'billing'),
  ('timezone', '"America/New_York"', 'Default timezone', 'general'),
  ('max_upload_size', '52428800', 'Max file upload size in bytes (50MB)', 'storage'),
  ('allow_client_registration', 'true', 'Allow new client registrations', 'general'),
  ('require_email_verification', 'true', 'Require email verification for new accounts', 'auth'),
  ('default_hours_package', '40', 'Default hours package for new clients', 'billing'),
  ('invoice_due_days', '30', 'Default invoice due date in days', 'billing'),
  ('notification_email_enabled', 'true', 'Enable email notifications', 'notifications'),
  ('chat_enabled', 'true', 'Enable real-time chat', 'features');

-- Insert sample FAQs
INSERT INTO faq (question, answer, category, sort_order) VALUES
  ('How do I submit a request?', 'Navigate to the Requests section in your dashboard and click "New Request". Fill in the details and submit.', 'Getting Started', 1),
  ('How do I check my hours balance?', 'Go to Hours Wallet in your dashboard to see your total, used, and remaining hours.', 'Billing', 2),
  ('How do I upload documents?', 'Navigate to the Documents section and click "Upload". Select your file and choose the appropriate category.', 'Documents', 3),
  ('How do I contact my pod team?', 'Use the Chat feature or visit the Contacts page to find your pod team members.', 'Communication', 4),
  ('Can I request changes mid-project?', 'Yes, use the Change Request feature to submit modifications. Your pod manager will review and approve.', 'Projects', 5);

-- Insert sample projects (references will be valid after client/pod data exists)
-- These use DO blocks to safely insert only if clients/pods exist
DO $$
DECLARE
  v_client_id UUID;
  v_pod_id UUID;
  v_project_id UUID;
BEGIN
  -- Find first client
  SELECT id INTO v_client_id FROM clients LIMIT 1;
  -- Find first pod
  SELECT id INTO v_pod_id FROM pods LIMIT 1;

  IF v_client_id IS NOT NULL THEN
    -- Project 1: Website Redesign
    INSERT INTO projects (name, description, status, priority, client_id, pod_id, start_date, target_end_date, estimated_hours, budget, tags)
    VALUES (
      'Website Redesign',
      'Complete redesign of the corporate website with modern UI/UX and responsive design',
      'in_progress',
      'high',
      v_client_id,
      v_pod_id,
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE + INTERVAL '60 days',
      120,
      25000,
      ARRAY['web', 'design', 'ux']
    )
    RETURNING id INTO v_project_id;

    -- Project 2: Mobile App MVP
    INSERT INTO projects (name, description, status, priority, client_id, pod_id, start_date, target_end_date, estimated_hours, budget, tags)
    VALUES (
      'Mobile App MVP',
      'Build the first version of the iOS and Android mobile application',
      'pending',
      'medium',
      v_client_id,
      v_pod_id,
      CURRENT_DATE + INTERVAL '14 days',
      CURRENT_DATE + INTERVAL '120 days',
      200,
      45000,
      ARRAY['mobile', 'ios', 'android']
    );

    -- Project 3: Completed QA Audit
    INSERT INTO projects (name, description, status, priority, client_id, pod_id, start_date, target_end_date, actual_end_date, estimated_hours, budget, tags)
    VALUES (
      'QA Audit 2024',
      'Comprehensive quality assurance audit of existing systems',
      'completed',
      'low',
      v_client_id,
      v_pod_id,
      CURRENT_DATE - INTERVAL '90 days',
      CURRENT_DATE - INTERVAL '30 days',
      CURRENT_DATE - INTERVAL '35 days',
      40,
      8000,
      ARRAY['qa', 'audit']
    );

    -- Link existing requests to Project 1 if they match the client
    INSERT INTO request_projects (request_id, project_id, sort_order)
    SELECT r.id, v_project_id, 0
    FROM requests r
    WHERE r.client_id = v_client_id
    LIMIT 3
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
