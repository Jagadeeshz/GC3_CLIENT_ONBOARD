import type { UserRole } from "@/types";

export type Resource =
  | "profile"
  | "client"
  | "pod"
  | "pod_member"
  | "request"
  | "deliverable"
  | "document"
  | "invoice"
  | "payment"
  | "hours_wallet"
  | "hours_transaction"
  | "contact"
  | "faq"
  | "notification"
  | "conversation"
  | "message"
  | "activity_log"
  | "change_request"
  | "feedback"
  | "setting"
  | "report"
  | "dashboard"
  | "workspace_member";

export type Action =
  | "create"
  | "read"
  | "read_own"
  | "read_assigned"
  | "update"
  | "update_own"
  | "delete"
  | "manage"
  | "export"
  | "approve"
  | "assign";

export type Permission = `${Resource}:${Action}`;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  client: [
    "profile:read_own",
    "profile:update_own",
    "client:read_own",
    "request:create",
    "request:read_own",
    "deliverable:read_own",
    "document:read_own",
    "document:create",
    "invoice:read_own",
    "payment:read_own",
    "hours_wallet:read_own",
    "hours_transaction:read_own",
    "contact:read_own",
    "faq:read",
    "notification:read_own",
    "conversation:create",
    "conversation:read_own",
    "message:create",
    "message:read_own",
    "change_request:create",
    "change_request:read_own",
    "feedback:create",
    "feedback:read_own",
    "dashboard:read_own",
    "workspace_member:manage",
    "workspace_member:read_own",
  ],
  pod_member: [
    "profile:read_own",
    "profile:update_own",
    "client:read_assigned",
    "request:read_assigned",
    "request:update",
    "deliverable:read_assigned",
    "deliverable:create",
    "deliverable:update",
    "document:read_assigned",
    "document:create",
    "contact:read_assigned",
    "faq:read",
    "notification:read_own",
    "conversation:create",
    "conversation:read_own",
    "message:create",
    "message:read_own",
    "activity_log:read_own",
    "dashboard:read_own",
  ],
  pod_manager: [
    "profile:read_own",
    "profile:update_own",
    "client:read_assigned",
    "pod:read_own",
    "pod:update",
    "pod_member:read",
    "pod_member:manage",
    "request:read_assigned",
    "request:update",
    "request:assign",
    "deliverable:read_assigned",
    "deliverable:create",
    "deliverable:update",
    "deliverable:approve",
    "document:read_assigned",
    "document:create",
    "document:update",
    "contact:read_assigned",
    "contact:create",
    "contact:update",
    "faq:read",
    "notification:read_own",
    "conversation:create",
    "conversation:read_own",
    "message:create",
    "message:read_own",
    "change_request:read_assigned",
    "change_request:approve",
    "feedback:read_assigned",
    "activity_log:read_own",
    "dashboard:read_assigned",
    "report:read_assigned",
  ],
  operations_team: [
    "profile:read_own",
    "profile:update_own",
    "client:read_assigned",
    "pod:read_own",
    "pod_member:read",
    "request:read_assigned",
    "request:update",
    "request:assign",
    "deliverable:read_assigned",
    "deliverable:create",
    "deliverable:update",
    "document:read_assigned",
    "document:create",
    "document:update",
    "contact:read_assigned",
    "contact:create",
    "contact:update",
    "invoice:read_assigned",
    "hours_wallet:read_assigned",
    "hours_transaction:read_assigned",
    "faq:read",
    "notification:read_own",
    "conversation:create",
    "conversation:read_own",
    "message:create",
    "message:read_own",
    "change_request:read_assigned",
    "feedback:read_assigned",
    "activity_log:read_own",
    "dashboard:read_assigned",
    "report:read_assigned",
  ],
  cpiu: [
    "profile:read",
    "profile:update",
    "client:manage",
    "pod:manage",
    "pod_member:manage",
    "request:manage",
    "deliverable:manage",
    "document:manage",
    "invoice:manage",
    "payment:manage",
    "hours_wallet:manage",
    "hours_transaction:manage",
    "contact:manage",
    "faq:manage",
    "notification:manage",
    "conversation:manage",
    "message:manage",
    "activity_log:read",
    "change_request:manage",
    "feedback:read",
    "setting:manage",
    "dashboard:read",
    "report:read",
    "report:export",
    "workspace_member:manage",
    "workspace_member:read_own",
  ],
  leadership: [
    "profile:read",
    "profile:update",
    "client:manage",
    "pod:manage",
    "pod_member:manage",
    "request:manage",
    "deliverable:manage",
    "document:manage",
    "invoice:manage",
    "payment:manage",
    "hours_wallet:manage",
    "hours_transaction:manage",
    "contact:manage",
    "faq:manage",
    "notification:manage",
    "conversation:manage",
    "message:manage",
    "activity_log:read",
    "change_request:manage",
    "feedback:read",
    "setting:manage",
    "dashboard:read",
    "report:read",
    "report:export",
    "workspace_member:manage",
    "workspace_member:read_own",
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  client: "Client",
  pod_member: "Pod Member",
  pod_manager: "Pod Manager",
  cpiu: "CPIU",
  leadership: "Leadership",
  operations_team: "Operations",
};

export type WorkspaceMemberRole =
  | "owner"
  | "project_manager"
  | "marketing"
  | "finance"
  | "reviewer"
  | "viewer";

export const WORKSPACE_MEMBER_ROLE_LABELS: Record<WorkspaceMemberRole, string> = {
  owner: "Owner",
  project_manager: "Project Manager",
  marketing: "Marketing",
  finance: "Finance",
  reviewer: "Reviewer",
  viewer: "Viewer",
};

export const WORKSPACE_MEMBER_PERMISSIONS: Record<WorkspaceMemberRole, string[]> = {
  owner: [
    "dashboard", "projects", "deliverables", "documents", "comments",
    "discussions", "downloads", "uploads", "reports", "billing",
    "approvals", "workspace_members", "company_settings",
  ],
  project_manager: [
    "dashboard", "projects", "deliverables", "documents", "comments",
    "discussions", "downloads", "uploads", "reports", "approvals",
  ],
  marketing: [
    "dashboard", "projects", "deliverables", "documents", "comments",
    "discussions", "downloads", "uploads",
  ],
  finance: [
    "dashboard", "billing", "reports", "documents", "downloads",
    "comments", "discussions",
  ],
  reviewer: [
    "dashboard", "projects", "deliverables", "documents", "comments",
    "discussions", "downloads",
  ],
  viewer: [
    "dashboard", "projects", "documents", "comments", "discussions", "downloads",
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  client: "Can submit requests, view deliverables, manage invoices, and communicate with assigned pods.",
  pod_member: "Can work on assigned requests, upload deliverables, and communicate with clients.",
  pod_manager: "Can manage pod members, assign tasks, review deliverables, and oversee client work.",
  cpiu: "Full platform access. Can manage all clients, pods, invoices, settings, and reports.",
  leadership: "Full platform access with oversight. Can view all data, reports, and manage the entire system.",
  operations_team: "Manages operational workflows, supports client and internal operations, handles tickets and resource allocation.",
};

export function getRoleNavigation(role: UserRole) {
  const common = [
    { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Notifications", href: "/notifications", icon: "Bell" },
    { title: "Settings", href: "/settings", icon: "Settings" },
    { title: "FAQ", href: "/faq", icon: "HelpCircle" },
  ];

  const roleSpecific: Record<UserRole, Array<{ title: string; href: string; icon: string }>> = {
    client: [
      { title: "My Requests", href: "/requests", icon: "FileText" },
      { title: "Deliverables", href: "/deliverables", icon: "Package" },
      { title: "Documents", href: "/documents", icon: "FolderOpen" },
      { title: "Invoices", href: "/invoices", icon: "Receipt" },
      { title: "Hours Wallet", href: "/hours-wallet", icon: "Clock" },
      { title: "Contacts", href: "/contacts", icon: "Users" },
      { title: "Chat", href: "/chat", icon: "MessageSquare" },
      { title: "Feedback", href: "/feedback", icon: "Star" },
    ],
    pod_member: [
      { title: "My Tasks", href: "/requests", icon: "FileText" },
      { title: "Deliverables", href: "/deliverables", icon: "Package" },
      { title: "Documents", href: "/documents", icon: "FolderOpen" },
      { title: "Chat", href: "/chat", icon: "MessageSquare" },
      { title: "My Pod", href: "/my-pod", icon: "Users" },
    ],
    pod_manager: [
      { title: "Requests", href: "/requests", icon: "FileText" },
      { title: "Deliverables", href: "/deliverables", icon: "Package" },
      { title: "Documents", href: "/documents", icon: "FolderOpen" },
      { title: "My Pod", href: "/my-pod", icon: "Users" },
      { title: "Change Requests", href: "/change-requests", icon: "GitBranch" },
      { title: "Chat", href: "/chat", icon: "MessageSquare" },
      { title: "Reports", href: "/reports", icon: "BarChart3" },
    ],
    cpiu: [
      { title: "Clients", href: "/clients", icon: "Building2" },
      { title: "Pods", href: "/pods", icon: "Users" },
      { title: "Requests", href: "/requests", icon: "FileText" },
      { title: "Deliverables", href: "/deliverables", icon: "Package" },
      { title: "Documents", href: "/documents", icon: "FolderOpen" },
      { title: "Invoices", href: "/invoices", icon: "Receipt" },
      { title: "Payments", href: "/payments", icon: "CreditCard" },
      { title: "Hours Wallet", href: "/hours-wallet", icon: "Clock" },
      { title: "Contacts", href: "/contacts", icon: "Contacts" },
      { title: "Change Requests", href: "/change-requests", icon: "GitBranch" },
      { title: "Chat", href: "/chat", icon: "MessageSquare" },
      { title: "Reports", href: "/reports", icon: "BarChart3" },
      { title: "Activity", href: "/activity", icon: "Clock" },
      { title: "Admin", href: "/admin", icon: "Shield" },
    ],
    leadership: [
      { title: "Clients", href: "/clients", icon: "Building2" },
      { title: "Pods", href: "/pods", icon: "Users" },
      { title: "Requests", href: "/requests", icon: "FileText" },
      { title: "Deliverables", href: "/deliverables", icon: "Package" },
      { title: "Documents", href: "/documents", icon: "FolderOpen" },
      { title: "Invoices", href: "/invoices", icon: "Receipt" },
      { title: "Payments", href: "/payments", icon: "CreditCard" },
      { title: "Hours Wallet", href: "/hours-wallet", icon: "Clock" },
      { title: "Contacts", href: "/contacts", icon: "Contacts" },
      { title: "Change Requests", href: "/change-requests", icon: "GitBranch" },
      { title: "Chat", href: "/chat", icon: "MessageSquare" },
      { title: "Reports", href: "/reports", icon: "BarChart3" },
      { title: "Activity", href: "/activity", icon: "Clock" },
      { title: "Admin", href: "/admin", icon: "Shield" },
    ],
    operations_team: [
      { title: "Operations", href: "/operations", icon: "Wrench" },
      { title: "Support", href: "/support", icon: "Headphones" },
      { title: "Invoices", href: "/invoices", icon: "Receipt" },
      { title: "Reports", href: "/reports", icon: "BarChart3" },
    ],
  };

  return [...roleSpecific[role], ...common];
}
