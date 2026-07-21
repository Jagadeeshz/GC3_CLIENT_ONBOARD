-- GC³ Portal Database Schema
-- Migration 022: Create helper functions

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_name, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_entity_name, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type notification_type DEFAULT 'info',
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, link, metadata)
  VALUES (p_user_id, p_title, p_message, p_type, p_link, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update hours wallet after transaction
CREATE OR REPLACE FUNCTION public.update_wallet_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'credit' THEN
    UPDATE hours_wallet
    SET total_hours = total_hours + NEW.hours
    WHERE id = NEW.wallet_id;
  ELSIF NEW.type = 'debit' THEN
    UPDATE hours_wallet
    SET used_hours = used_hours + NEW.hours
    WHERE id = NEW.wallet_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_hours_transaction
  AFTER INSERT ON hours_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wallet_hours();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 5 FOR LENGTH(invoice_number) - 4) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM invoices;

  prefix := 'GC3-';
  NEW.invoice_number := prefix || LPAD(next_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION public.generate_invoice_number();

-- Function to update deliverable version on insert
CREATE OR REPLACE FUNCTION public.handle_deliverable_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.version = 1 THEN
    INSERT INTO deliverable_versions (deliverable_id, version, file_url, file_name, file_size, uploaded_by)
    VALUES (NEW.id, 1, NEW.file_url, NEW.file_name, NEW.file_size, NEW.assigned_to);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM profiles
  WHERE id = user_uuid;
  RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND role IN ('cpiu', 'leadership')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client's remaining hours
CREATE OR REPLACE FUNCTION public.get_client_remaining_hours(p_client_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  remaining NUMERIC;
BEGIN
  SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN hours ELSE -hours END), 0)
  INTO remaining
  FROM hours_transactions ht
  JOIN hours_wallet hw ON hw.id = ht.wallet_id
  WHERE hw.client_id = p_client_id;
  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
