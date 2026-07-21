-- GC³ Portal Database Schema
-- Migration 024: Fix missing FK constraints and add CHECK constraints

-- ============================================================
-- FIX MISSING FOREIGN KEYS
-- ============================================================

-- invoices.change_request_id -> change_requests(id)
ALTER TABLE invoices
  ADD CONSTRAINT fk_invoices_change_request
  FOREIGN KEY (change_request_id) REFERENCES change_requests(id) ON DELETE SET NULL;

-- change_requests.addon_invoice_id -> invoices(id)
ALTER TABLE change_requests
  ADD CONSTRAINT fk_change_requests_addon_invoice
  FOREIGN KEY (addon_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- ============================================================
-- CHECK CONSTRAINTS: Numeric integrity
-- ============================================================

-- hours_wallet: total and used hours must be non-negative
ALTER TABLE hours_wallet
  ADD CONSTRAINT chk_hours_wallet_total_non_negative
  CHECK (total_hours >= 0);

ALTER TABLE hours_wallet
  ADD CONSTRAINT chk_hours_wallet_used_non_negative
  CHECK (used_hours >= 0);

-- hours_transactions: hours must be positive
ALTER TABLE hours_transactions
  ADD CONSTRAINT chk_hours_transactions_positive
  CHECK (hours > 0);

-- invoices: amount must be positive
ALTER TABLE invoices
  ADD CONSTRAINT chk_invoices_amount_positive
  CHECK (amount > 0);

-- invoice_line_items: quantity and price integrity
ALTER TABLE invoice_line_items
  ADD CONSTRAINT chk_invoice_line_items_quantity_positive
  CHECK (quantity > 0);

ALTER TABLE invoice_line_items
  ADD CONSTRAINT chk_invoice_line_items_unit_price_non_negative
  CHECK (unit_price >= 0);

-- payments: amount must be positive
ALTER TABLE payments
  ADD CONSTRAINT chk_payments_amount_positive
  CHECK (amount > 0);

-- projects: budget must be non-negative when set
ALTER TABLE projects
  ADD CONSTRAINT chk_projects_budget_non_negative
  CHECK (budget IS NULL OR budget >= 0);

-- projects: estimated hours must be positive when set
ALTER TABLE projects
  ADD CONSTRAINT chk_projects_estimated_hours_positive
  CHECK (estimated_hours IS NULL OR estimated_hours > 0);

-- requests: estimated hours must be positive when set
ALTER TABLE requests
  ADD CONSTRAINT chk_requests_estimated_hours_positive
  CHECK (estimated_hours IS NULL OR estimated_hours > 0);

-- change_requests: estimated hours and cost must be positive when set
ALTER TABLE change_requests
  ADD CONSTRAINT chk_change_requests_estimated_hours_positive
  CHECK (estimated_hours IS NULL OR estimated_hours > 0);

ALTER TABLE change_requests
  ADD CONSTRAINT chk_change_requests_estimated_cost_positive
  CHECK (estimated_cost IS NULL OR estimated_cost >= 0);

-- ============================================================
-- CHECK CONSTRAINTS: Date integrity
-- ============================================================

-- projects: target_end_date should be after start_date
ALTER TABLE projects
  ADD CONSTRAINT chk_projects_dates_order
  CHECK (start_date IS NULL OR target_end_date IS NULL OR target_end_date >= start_date);

-- projects: actual_end_date should be on or after start_date
ALTER TABLE projects
  ADD CONSTRAINT chk_projects_actual_end_after_start
  CHECK (start_date IS NULL OR actual_end_date IS NULL OR actual_end_date >= start_date);

-- hours_wallet: billing period end should be after start
ALTER TABLE hours_wallet
  ADD CONSTRAINT chk_hours_wallet_billing_period_order
  CHECK (billing_period_start IS NULL OR billing_period_end IS NULL OR billing_period_end >= billing_period_start);

-- ============================================================
-- CASCADE DELETE for messages when conversation is deleted
-- (Already handled in 016 via ON DELETE CASCADE, confirmed)
-- ============================================================

-- ============================================================
-- Auto-generate project_id on requests when not specified
-- (Optional: link request to project based on client match)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_request_project_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    -- Find the most recent active project for this client
    UPDATE requests
    SET project_id = (
      SELECT p.id FROM projects p
      WHERE p.client_id = NEW.client_id
        AND p.is_archived = false
        AND p.status NOT IN ('completed', 'cancelled')
      ORDER BY p.created_at DESC
      LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only fires when project_id is not explicitly set
CREATE TRIGGER auto_set_request_project
  AFTER INSERT ON requests
  FOR EACH ROW
  WHEN (NEW.project_id IS NULL)
  EXECUTE FUNCTION public.set_request_project_on_insert();
