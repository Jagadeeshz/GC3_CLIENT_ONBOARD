-- GC³ Portal Database Schema
-- Migration 019: Create feedback table

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE SET NULL,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  type feedback_type NOT NULL DEFAULT 'general',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_feedback_client_id ON feedback(client_id);
CREATE INDEX idx_feedback_deliverable_id ON feedback(deliverable_id);
CREATE INDEX idx_feedback_request_id ON feedback(request_id);
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_rating ON feedback(rating);
