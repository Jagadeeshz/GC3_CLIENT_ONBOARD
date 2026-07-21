export * from "./database";

export type UserRole = "client" | "pod_member" | "pod_manager" | "cpiu" | "leadership" | "operations_team";

export type RequestStatus = "pending" | "in_review" | "in_progress" | "completed" | "cancelled" | "on_hold";

export type Priority = "low" | "medium" | "high" | "urgent";

export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type ChangeRequestStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "implemented";

export type NotificationType = "info" | "success" | "warning" | "error";

export type DocumentCategory = "contract" | "proposal" | "report" | "design" | "development" | "other";

export type FeedbackType = "deliverable" | "service" | "general";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  company: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  client_id: string;
  pod_id: string | null;
  assigned_to: string | null;
  category: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  clickup_task_id: string | null;
  tags: string[];
  is_archived: boolean;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: RequestStatus;
  priority: Priority;
  client_id: string;
  pod_id: string | null;
  lead_id: string | null;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  estimated_hours: number | null;
  budget: number | null;
  tags: string[];
  is_archived: boolean;
  clickup_project_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pod {
  id: string;
  name: string;
  description: string | null;
  manager_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  request_id: string;
  pod_id: string;
  assigned_to: string | null;
  version: number;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  feedback_id: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string | null;
  notes: string | null;
  due_date: string;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  is_addon: boolean;
  change_request_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  reply_to: string | null;
  read_at: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: ChangeRequestStatus;
  client_id: string;
  request_id: string;
  pod_id: string | null;
  estimated_hours: number | null;
  estimated_cost: number | null;
  reason: string | null;
  pod_manager_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  addon_invoice_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  client_id: string;
  deliverable_id: string | null;
  request_id: string | null;
  type: FeedbackType;
  rating: number | null;
  comment: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  profile_id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  tax_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  department: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HoursWallet {
  id: string;
  client_id: string;
  total_hours: number;
  used_hours: number;
  remaining_hours: number;
  billing_period_start: string | null;
  billing_period_end: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  category: DocumentCategory;
  file_url: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  client_id: string | null;
  request_id: string | null;
  uploaded_by: string | null;
  folder: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface HoursTransaction {
  id: string;
  wallet_id: string;
  request_id: string | null;
  hours: number;
  type: "credit" | "debit";
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  stripe_payment_id: string | null;
  stripe_receipt_url: string | null;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type WorkspaceMemberRole =
  | "owner"
  | "project_manager"
  | "marketing"
  | "finance"
  | "reviewer"
  | "viewer";

export type WorkspaceMemberStatus = "active" | "suspended" | "pending";

export interface WorkspaceMember {
  id: string;
  profile_id: string;
  client_id: string;
  role: WorkspaceMemberRole;
  department: string | null;
  phone: string | null;
  status: WorkspaceMemberStatus;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  inviter?: UserProfile;
}
