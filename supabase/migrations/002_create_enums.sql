-- GC³ Portal Database Schema
-- Migration 002: Create custom types/enums

CREATE TYPE user_role AS ENUM (
  'client',
  'pod_member',
  'pod_manager',
  'cpiu',
  'leadership'
);

CREATE TYPE request_status AS ENUM (
  'pending',
  'in_review',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);

CREATE TYPE priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'pending',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE change_request_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'implemented'
);

CREATE TYPE notification_type AS ENUM (
  'info',
  'success',
  'warning',
  'error'
);

CREATE TYPE document_category AS ENUM (
  'contract',
  'proposal',
  'report',
  'design',
  'development',
  'other'
);

CREATE TYPE feedback_type AS ENUM (
  'deliverable',
  'service',
  'general'
);
