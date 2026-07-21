import type {
  Project,
  Request,
  Deliverable,
  Invoice,
  Notification,
  HoursWallet,
  ChangeRequest,
  ActivityLog,
  Pod,
  Client,
  Payment,
} from "@/types";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

export interface ClientDashboardData {
  stats: {
    activeProjects: number;
    pendingRequests: number;
    completedDeliverables: number;
    totalInvoices: number;
    pendingInvoices: number;
    hoursUsed: number;
    hoursRemaining: number;
    hoursTotal: number;
  };
  projects: Project[];
  recentRequests: Request[];
  pendingDeliverables: Deliverable[];
  invoices: Invoice[];
  hoursWallet: HoursWallet;
  notifications: Notification[];
  activity: ActivityLog[];
  monthlySpending: { month: string; amount: number }[];
}

export interface PodMemberDashboardData {
  stats: {
    assignedTasks: number;
    completedTasks: number;
    pendingReviews: number;
    hoursLogged: number;
    deliverablesDue: number;
  };
  assignedRequests: Request[];
  myDeliverables: Deliverable[];
  recentActivity: ActivityLog[];
  notifications: Notification[];
  weeklyHours: { day: string; hours: number }[];
}

export interface PodManagerDashboardData {
  stats: {
    teamMembers: number;
    activeRequests: number;
    pendingApprovals: number;
    teamUtilization: number;
    completionRate: number;
  };
  teamOverview: { name: string; role: string; tasksAssigned: number; tasksCompleted: number; utilization: number }[];
  pendingRequests: Request[];
  changeRequests: ChangeRequest[];
  recentActivity: ActivityLog[];
  notifications: Notification[];
  teamProductivity: { week: string; completed: number; created: number }[];
}

export interface CPIUDashboardData {
  stats: {
    totalClients: number;
    activePods: number;
    totalRevenue: number;
    pendingInvoices: number;
    openRequests: number;
    platformUtilization: number;
  };
  clients: Client[];
  pods: Pod[];
  payments: Payment[];
  recentRequests: Request[];
  notifications: Notification[];
  monthlyRevenue: { month: string; revenue: number; expenses: number }[];
  podPerformance: { name: string; utilization: number; satisfaction: number; completion: number }[];
}

export interface OperationsDashboardData {
  stats: {
    openTickets: number;
    resolvedToday: number;
    avgResponseTime: string;
    clientSatisfaction: number;
    resourcesAllocated: number;
    pendingEscalations: number;
  };
  dailyActivities: { time: string; activity: string; status: string; assignee: string }[];
  tickets: { id: string; subject: string; priority: string; status: string; client: string; createdAt: string }[];
  resourceAllocation: { resource: string; role: string; utilization: number; status: string }[];
  notifications: Notification[];
  recentActivity: ActivityLog[];
}

export interface LeadershipDashboardData {
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalClients: number;
    activeProjects: number;
    overallUtilization: number;
    clientSatisfaction: number;
  };
  kpis: { label: string; value: string; target: string; status: "on_track" | "at_risk" | "behind" }[];
  clients: Client[];
  pods: Pod[];
  monthlyRevenue: { month: string; revenue: number; projected: number }[];
  podPerformance: { name: string; utilization: number; revenue: number; satisfaction: number }[];
  risks: { id: string; title: string; severity: "low" | "medium" | "high" | "critical"; owner: string; dueDate: string }[];
  pendingApprovals: ChangeRequest[];
  notifications: Notification[];
}

// ============================================================
// CLIENT DASHBOARD
// ============================================================

export async function getClientDashboardData(): Promise<ClientDashboardData> {
  return {
    stats: {
      activeProjects: 4,
      pendingRequests: 6,
      completedDeliverables: 18,
      totalInvoices: 12,
      pendingInvoices: 3,
      hoursUsed: 127,
      hoursRemaining: 73,
      hoursTotal: 200,
    },
    projects: [
      {
        id: "proj-1",
        name: "Website Redesign",
        description: "Complete overhaul of corporate website with modern design system",
        status: "in_progress",
        priority: "high",
        client_id: "client-1",
        pod_id: "pod-1",
        lead_id: "user-2",
        start_date: daysAgo(45),
        target_end_date: daysFromNow(30),
        actual_end_date: null,
        estimated_hours: 120,
        budget: 85000,
        tags: ["design", "development"],
        is_archived: false,
        clickup_project_id: "cu-proj-1",
        created_at: daysAgo(60),
        updated_at: daysAgo(2),
      },
      {
        id: "proj-2",
        name: "Mobile App MVP",
        description: "Cross-platform mobile application for customer portal",
        status: "in_progress",
        priority: "urgent",
        client_id: "client-1",
        pod_id: "pod-2",
        lead_id: "user-5",
        start_date: daysAgo(30),
        target_end_date: daysFromNow(60),
        actual_end_date: null,
        estimated_hours: 200,
        budget: 150000,
        tags: ["mobile", "mvp"],
        is_archived: false,
        clickup_project_id: "cu-proj-2",
        created_at: daysAgo(35),
        updated_at: daysAgo(1),
      },
      {
        id: "proj-3",
        name: "Data Analytics Dashboard",
        description: "Real-time analytics dashboard for business intelligence",
        status: "in_review",
        priority: "medium",
        client_id: "client-1",
        pod_id: "pod-1",
        lead_id: "user-3",
        start_date: daysAgo(60),
        target_end_date: daysFromNow(10),
        actual_end_date: null,
        estimated_hours: 80,
        budget: 62000,
        tags: ["analytics", "data"],
        is_archived: false,
        clickup_project_id: "cu-proj-3",
        created_at: daysAgo(70),
        updated_at: daysAgo(3),
      },
      {
        id: "proj-4",
        name: "Brand Identity Refresh",
        description: "Updated brand guidelines, logo variations, and collateral templates",
        status: "completed",
        priority: "medium",
        client_id: "client-1",
        pod_id: "pod-3",
        lead_id: "user-7",
        start_date: daysAgo(90),
        target_end_date: daysAgo(15),
        actual_end_date: daysAgo(18),
        estimated_hours: 40,
        budget: 35000,
        tags: ["branding", "design"],
        is_archived: false,
        clickup_project_id: "cu-proj-4",
        created_at: daysAgo(95),
        updated_at: daysAgo(18),
      },
    ],
    recentRequests: [
      {
        id: "req-1",
        title: "Homepage hero section update",
        description: "Update the hero section with new campaign imagery and copy",
        status: "in_progress",
        priority: "high",
        client_id: "client-1",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "design",
        due_date: daysFromNow(5),
        estimated_hours: 8,
        actual_hours: 4,
        clickup_task_id: "cu-req-1",
        tags: ["urgent", "design"],
        is_archived: false,
        project_id: "proj-1",
        created_at: daysAgo(3),
        updated_at: daysAgo(1),
      },
      {
        id: "req-2",
        title: "API integration for payment gateway",
        description: "Integrate Stripe payment processing into the checkout flow",
        status: "pending",
        priority: "urgent",
        client_id: "client-1",
        pod_id: "pod-2",
        assigned_to: "user-6",
        category: "development",
        due_date: daysFromNow(14),
        estimated_hours: 24,
        actual_hours: 0,
        clickup_task_id: "cu-req-2",
        tags: ["api", "payments"],
        is_archived: false,
        project_id: "proj-2",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
      {
        id: "req-3",
        title: "User authentication flow redesign",
        description: "Redesign login, registration, and password reset flows",
        status: "in_review",
        priority: "medium",
        client_id: "client-1",
        pod_id: "pod-1",
        assigned_to: "user-4",
        category: "design",
        due_date: daysFromNow(7),
        estimated_hours: 16,
        actual_hours: 14,
        clickup_task_id: "cu-req-3",
        tags: ["auth", "ux"],
        is_archived: false,
        project_id: "proj-2",
        created_at: daysAgo(10),
        updated_at: daysAgo(1),
      },
      {
        id: "req-4",
        title: "Monthly analytics report generation",
        description: "Generate and format the June 2026 analytics report",
        status: "completed",
        priority: "low",
        client_id: "client-1",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "reporting",
        due_date: daysAgo(2),
        estimated_hours: 4,
        actual_hours: 3,
        clickup_task_id: "cu-req-4",
        tags: ["reporting", "analytics"],
        is_archived: false,
        project_id: "proj-3",
        created_at: daysAgo(7),
        updated_at: daysAgo(2),
      },
      {
        id: "req-5",
        title: "Mobile push notification setup",
        description: "Configure Firebase Cloud Messaging for iOS and Android",
        status: "pending",
        priority: "high",
        client_id: "client-1",
        pod_id: "pod-2",
        assigned_to: null,
        category: "development",
        due_date: daysFromNow(21),
        estimated_hours: 12,
        actual_hours: 0,
        clickup_task_id: "cu-req-5",
        tags: ["mobile", "notifications"],
        is_archived: false,
        project_id: "proj-2",
        created_at: daysAgo(1),
        updated_at: daysAgo(1),
      },
      {
        id: "req-6",
        title: "SEO meta tag optimization",
        description: "Review and update all meta tags for improved search visibility",
        status: "pending",
        priority: "medium",
        client_id: "client-1",
        pod_id: "pod-1",
        assigned_to: null,
        category: "marketing",
        due_date: daysFromNow(10),
        estimated_hours: 6,
        actual_hours: 0,
        clickup_task_id: "cu-req-6",
        tags: ["seo", "marketing"],
        is_archived: false,
        project_id: "proj-1",
        created_at: daysAgo(1),
        updated_at: daysAgo(1),
      },
    ],
    pendingDeliverables: [
      {
        id: "del-1",
        title: "Homepage wireframes v3",
        description: "Updated wireframes incorporating feedback from stakeholder review",
        status: "in_review",
        request_id: "req-1",
        pod_id: "pod-1",
        assigned_to: "user-3",
        version: 3,
        file_url: "/files/wireframes-v3.pdf",
        file_name: "wireframes-v3.pdf",
        file_size: 2400000,
        feedback_id: null,
        submitted_at: daysAgo(1),
        approved_at: null,
        created_at: daysAgo(5),
        updated_at: daysAgo(1),
      },
      {
        id: "del-2",
        title: "Brand style guide",
        description: "Comprehensive brand guidelines document",
        status: "completed",
        request_id: "req-4",
        pod_id: "pod-3",
        assigned_to: "user-7",
        version: 2,
        file_url: "/files/brand-guide.pdf",
        file_name: "brand-guide-v2.pdf",
        file_size: 5200000,
        feedback_id: "fb-1",
        submitted_at: daysAgo(3),
        approved_at: daysAgo(2),
        created_at: daysAgo(10),
        updated_at: daysAgo(2),
      },
      {
        id: "del-3",
        title: "Analytics dashboard mockup",
        description: "High-fidelity mockup for the BI dashboard",
        status: "in_progress",
        request_id: "req-3",
        pod_id: "pod-1",
        assigned_to: "user-4",
        version: 1,
        file_url: null,
        file_name: null,
        file_size: null,
        feedback_id: null,
        submitted_at: null,
        approved_at: null,
        created_at: daysAgo(4),
        updated_at: daysAgo(1),
      },
    ],
    invoices: [
      {
        id: "inv-1",
        invoice_number: "GC3-2026-0041",
        client_id: "client-1",
        amount: 42500,
        currency: "USD",
        status: "paid",
        description: "Website Redesign - Phase 1 Discovery & Strategy",
        notes: "Thank you for your business!",
        due_date: daysAgo(15),
        paid_at: daysAgo(18),
        stripe_invoice_id: "si-1",
        stripe_payment_intent_id: "pi-1",
        is_addon: false,
        change_request_id: null,
        created_by: "user-10",
        created_at: daysAgo(45),
        updated_at: daysAgo(18),
      },
      {
        id: "inv-2",
        invoice_number: "GC3-2026-0045",
        client_id: "client-1",
        amount: 38750,
        currency: "USD",
        status: "pending",
        description: "Website Redesign - Phase 2 Design & Prototyping",
        notes: null,
        due_date: daysFromNow(12),
        paid_at: null,
        stripe_invoice_id: "si-2",
        stripe_payment_intent_id: null,
        is_addon: false,
        change_request_id: null,
        created_by: "user-10",
        created_at: daysAgo(10),
        updated_at: daysAgo(10),
      },
      {
        id: "inv-3",
        invoice_number: "GC3-2026-0048",
        client_id: "client-1",
        amount: 15000,
        currency: "USD",
        status: "draft",
        description: "Mobile App MVP - Initial Sprint",
        notes: null,
        due_date: daysFromNow(30),
        paid_at: null,
        stripe_invoice_id: null,
        stripe_payment_intent_id: null,
        is_addon: false,
        change_request_id: null,
        created_by: "user-10",
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
      {
        id: "inv-4",
        invoice_number: "GC3-2026-0039",
        client_id: "client-1",
        amount: 8500,
        currency: "USD",
        status: "overdue",
        description: "Additional hours - Design revisions (Add-on)",
        notes: "Please remit payment at your earliest convenience.",
        due_date: daysAgo(7),
        paid_at: null,
        stripe_invoice_id: "si-4",
        stripe_payment_intent_id: null,
        is_addon: true,
        change_request_id: "cr-2",
        created_by: "user-10",
        created_at: daysAgo(30),
        updated_at: daysAgo(7),
      },
    ],
    hoursWallet: {
      id: "hw-1",
      client_id: "client-1",
      total_hours: 200,
      used_hours: 127,
      remaining_hours: 73,
      billing_period_start: monthsAgo(1),
      billing_period_end: daysFromNow(30),
      notes: "Standard monthly retainer",
      created_at: monthsAgo(6),
      updated_at: daysAgo(1),
    },
    notifications: [
      {
        id: "notif-1",
        user_id: "user-1",
        title: "Deliverable ready for review",
        message: "Homepage wireframes v3 has been submitted and is awaiting your review.",
        type: "info",
        read: false,
        link: "/deliverables/del-1",
        metadata: null,
        created_at: daysAgo(0),
      },
      {
        id: "notif-2",
        user_id: "user-1",
        title: "Invoice overdue",
        message: "Invoice GC3-2026-0039 ($8,500) is 7 days past due.",
        type: "warning",
        read: false,
        link: "/invoices/inv-4",
        metadata: null,
        created_at: daysAgo(1),
      },
      {
        id: "notif-3",
        user_id: "user-1",
        title: "Request completed",
        message: "Monthly analytics report generation has been completed.",
        type: "success",
        read: true,
        link: "/requests/req-4",
        metadata: null,
        created_at: daysAgo(2),
      },
    ],
    activity: [
      {
        id: "act-1",
        user_id: "user-3",
        action: "submitted_deliverable",
        entity_type: "deliverable",
        entity_id: "del-1",
        entity_name: "Homepage wireframes v3",
        metadata: null,
        ip_address: "192.168.1.45",
        created_at: daysAgo(0),
      },
      {
        id: "act-2",
        user_id: "user-10",
        action: "created_invoice",
        entity_type: "invoice",
        entity_id: "inv-3",
        entity_name: "GC3-2026-0048",
        metadata: null,
        ip_address: "10.0.0.12",
        created_at: daysAgo(3),
      },
      {
        id: "act-3",
        user_id: "user-5",
        action: "updated_request",
        entity_type: "request",
        entity_id: "req-2",
        entity_name: "API integration for payment gateway",
        metadata: null,
        ip_address: "192.168.1.78",
        created_at: daysAgo(2),
      },
    ],
    monthlySpending: [
      { month: "Feb", amount: 42500 },
      { month: "Mar", amount: 51000 },
      { month: "Apr", amount: 38200 },
      { month: "May", amount: 67500 },
      { month: "Jun", amount: 47250 },
      { month: "Jul", amount: 23500 },
    ],
  };
}

// ============================================================
// POD MEMBER DASHBOARD
// ============================================================

export async function getPodMemberDashboardData(): Promise<PodMemberDashboardData> {
  return {
    stats: {
      assignedTasks: 8,
      completedTasks: 23,
      pendingReviews: 3,
      hoursLogged: 142,
      deliverablesDue: 2,
    },
    assignedRequests: [
      {
        id: "req-10",
        title: "Landing page A/B test implementation",
        description: "Build two variants of the landing page for conversion testing",
        status: "in_progress",
        priority: "high",
        client_id: "client-2",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "development",
        due_date: daysFromNow(3),
        estimated_hours: 16,
        actual_hours: 10,
        clickup_task_id: "cu-req-10",
        tags: ["a/b-test", "frontend"],
        is_archived: false,
        project_id: "proj-5",
        created_at: daysAgo(7),
        updated_at: daysAgo(1),
      },
      {
        id: "req-11",
        title: "Email template redesign",
        description: "Redesign transactional email templates for brand consistency",
        status: "in_progress",
        priority: "medium",
        client_id: "client-2",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "design",
        due_date: daysFromNow(7),
        estimated_hours: 12,
        actual_hours: 6,
        clickup_task_id: "cu-req-11",
        tags: ["email", "design"],
        is_archived: false,
        project_id: "proj-5",
        created_at: daysAgo(5),
        updated_at: daysAgo(1),
      },
      {
        id: "req-12",
        title: "CMS content migration",
        description: "Migrate blog content from WordPress to headless CMS",
        status: "pending",
        priority: "medium",
        client_id: "client-3",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "development",
        due_date: daysFromNow(14),
        estimated_hours: 20,
        actual_hours: 0,
        clickup_task_id: "cu-req-12",
        tags: ["cms", "migration"],
        is_archived: false,
        project_id: "proj-6",
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
      {
        id: "req-13",
        title: "Dashboard widget optimization",
        description: "Improve performance of chart rendering components",
        status: "in_review",
        priority: "low",
        client_id: "client-2",
        pod_id: "pod-1",
        assigned_to: "user-3",
        category: "development",
        due_date: daysFromNow(5),
        estimated_hours: 8,
        actual_hours: 7,
        clickup_task_id: "cu-req-13",
        tags: ["performance", "optimization"],
        is_archived: false,
        project_id: "proj-5",
        created_at: daysAgo(10),
        updated_at: daysAgo(1),
      },
    ],
    myDeliverables: [
      {
        id: "del-10",
        title: "Landing page variant A",
        description: "Control variant with current design",
        status: "in_progress",
        request_id: "req-10",
        pod_id: "pod-1",
        assigned_to: "user-3",
        version: 1,
        file_url: null,
        file_name: null,
        file_size: null,
        feedback_id: null,
        submitted_at: null,
        approved_at: null,
        created_at: daysAgo(5),
        updated_at: daysAgo(1),
      },
      {
        id: "del-11",
        title: "Email template - Welcome",
        description: "Welcome email template with responsive design",
        status: "in_review",
        request_id: "req-11",
        pod_id: "pod-1",
        assigned_to: "user-3",
        version: 2,
        file_url: "/files/welcome-email-v2.html",
        file_name: "welcome-email-v2.html",
        file_size: 85000,
        feedback_id: null,
        submitted_at: daysAgo(1),
        approved_at: null,
        created_at: daysAgo(4),
        updated_at: daysAgo(1),
      },
      {
        id: "del-12",
        title: "Dashboard optimization report",
        description: "Performance benchmark before and after optimization",
        status: "completed",
        request_id: "req-13",
        pod_id: "pod-1",
        assigned_to: "user-3",
        version: 1,
        file_url: "/files/perf-report.pdf",
        file_name: "perf-report.pdf",
        file_size: 1200000,
        feedback_id: "fb-5",
        submitted_at: daysAgo(2),
        approved_at: daysAgo(1),
        created_at: daysAgo(8),
        updated_at: daysAgo(1),
      },
    ],
    recentActivity: [
      {
        id: "act-10",
        user_id: "user-3",
        action: "updated_deliverable",
        entity_type: "deliverable",
        entity_id: "del-11",
        entity_name: "Email template - Welcome",
        metadata: null,
        ip_address: "192.168.1.45",
        created_at: daysAgo(0),
      },
      {
        id: "act-11",
        user_id: "user-3",
        action: "logged_hours",
        entity_type: "request",
        entity_id: "req-10",
        entity_name: "Landing page A/B test implementation",
        metadata: { hours: 4 },
        ip_address: "192.168.1.45",
        created_at: daysAgo(1),
      },
    ],
    notifications: [
      {
        id: "notif-10",
        user_id: "user-3",
        title: "New task assigned",
        message: "You have been assigned CMS content migration for Greenfield Corp.",
        type: "info",
        read: false,
        link: "/requests/req-12",
        metadata: null,
        created_at: daysAgo(3),
      },
      {
        id: "notif-11",
        user_id: "user-3",
        title: "Deliverable approved",
        message: "Dashboard optimization report has been approved by the client.",
        type: "success",
        read: true,
        link: "/deliverables/del-12",
        metadata: null,
        created_at: daysAgo(1),
      },
    ],
    weeklyHours: [
      { day: "Mon", hours: 7.5 },
      { day: "Tue", hours: 8 },
      { day: "Wed", hours: 6.5 },
      { day: "Thu", hours: 8.5 },
      { day: "Fri", hours: 7 },
      { day: "Sat", hours: 0 },
      { day: "Sun", hours: 0 },
    ],
  };
}

// ============================================================
// POD MANAGER DASHBOARD
// ============================================================

export async function getPodManagerDashboardData(): Promise<PodManagerDashboardData> {
  return {
    stats: {
      teamMembers: 6,
      activeRequests: 14,
      pendingApprovals: 5,
      teamUtilization: 78,
      completionRate: 85,
    },
    teamOverview: [
      { name: "Alex Rivera", role: "Senior Developer", tasksAssigned: 4, tasksCompleted: 3, utilization: 92 },
      { name: "Jordan Chen", role: "UI/UX Designer", tasksAssigned: 3, tasksCompleted: 2, utilization: 85 },
      { name: "Sam Patel", role: "Full-Stack Developer", tasksAssigned: 5, tasksCompleted: 4, utilization: 88 },
      { name: "Casey Morgan", role: "QA Engineer", tasksAssigned: 3, tasksCompleted: 2, utilization: 75 },
      { name: "Taylor Kim", role: "Backend Developer", tasksAssigned: 4, tasksCompleted: 3, utilization: 80 },
      { name: "Morgan Lee", role: "DevOps Engineer", tasksAssigned: 2, tasksCompleted: 1, utilization: 65 },
    ],
    pendingRequests: [
      {
        id: "req-20",
        title: "E-commerce checkout flow",
        description: "Build complete checkout flow with cart, payment, and confirmation",
        status: "pending",
        priority: "urgent",
        client_id: "client-2",
        pod_id: "pod-1",
        assigned_to: null,
        category: "development",
        due_date: daysFromNow(21),
        estimated_hours: 40,
        actual_hours: 0,
        clickup_task_id: "cu-req-20",
        tags: ["e-commerce", "payments"],
        is_archived: false,
        project_id: "proj-5",
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
      {
        id: "req-21",
        title: "Customer support chatbot",
        description: "Implement AI-powered chatbot for first-line customer support",
        status: "pending",
        priority: "high",
        client_id: "client-3",
        pod_id: "pod-1",
        assigned_to: null,
        category: "development",
        due_date: daysFromNow(30),
        estimated_hours: 32,
        actual_hours: 0,
        clickup_task_id: "cu-req-21",
        tags: ["ai", "chatbot"],
        is_archived: false,
        project_id: "proj-6",
        created_at: daysAgo(1),
        updated_at: daysAgo(1),
      },
      {
        id: "req-22",
        title: "Performance audit report",
        description: "Comprehensive site performance audit with recommendations",
        status: "pending",
        priority: "medium",
        client_id: "client-2",
        pod_id: "pod-1",
        assigned_to: null,
        category: "reporting",
        due_date: daysFromNow(10),
        estimated_hours: 8,
        actual_hours: 0,
        clickup_task_id: "cu-req-22",
        tags: ["performance", "audit"],
        is_archived: false,
        project_id: "proj-5",
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
    ],
    changeRequests: [
      {
        id: "cr-10",
        title: "Additional API endpoints",
        description: "Client requested 3 additional REST API endpoints for the mobile app",
        status: "under_review",
        client_id: "client-2",
        request_id: "req-20",
        pod_id: "pod-1",
        estimated_hours: 16,
        estimated_cost: 12000,
        reason: "Scope expansion for mobile app launch",
        pod_manager_notes: "Reviewed technical feasibility - all endpoints are straightforward",
        reviewed_by: null,
        reviewed_at: null,
        addon_invoice_id: null,
        created_at: daysAgo(5),
        updated_at: daysAgo(2),
      },
      {
        id: "cr-11",
        title: "Custom analytics integration",
        description: "Add Mixpanel event tracking across all user touchpoints",
        status: "submitted",
        client_id: "client-3",
        request_id: "req-21",
        pod_id: "pod-1",
        estimated_hours: 12,
        estimated_cost: 9000,
        reason: "Client wants detailed user behavior analytics",
        pod_manager_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        addon_invoice_id: null,
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
    ],
    recentActivity: [
      {
        id: "act-20",
        user_id: "user-2",
        action: "assigned_request",
        entity_type: "request",
        entity_id: "req-22",
        entity_name: "Performance audit report",
        metadata: { assignee: "Alex Rivera" },
        ip_address: "10.0.0.5",
        created_at: daysAgo(0),
      },
      {
        id: "act-21",
        user_id: "user-4",
        action: "submitted_deliverable",
        entity_type: "deliverable",
        entity_id: "del-11",
        entity_name: "Email template - Welcome",
        metadata: null,
        ip_address: "192.168.1.78",
        created_at: daysAgo(1),
      },
      {
        id: "act-22",
        user_id: "user-2",
        action: "approved_deliverable",
        entity_type: "deliverable",
        entity_id: "del-12",
        entity_name: "Dashboard optimization report",
        metadata: null,
        ip_address: "10.0.0.5",
        created_at: daysAgo(1),
      },
    ],
    notifications: [
      {
        id: "notif-20",
        user_id: "user-2",
        title: "Change request pending review",
        message: "Additional API endpoints change request from Meridian Labs needs your review.",
        type: "warning",
        read: false,
        link: "/change-requests/cr-10",
        metadata: null,
        created_at: daysAgo(2),
      },
      {
        id: "notif-21",
        user_id: "user-2",
        title: "Team utilization below target",
        message: "Morgan Lee's utilization is at 65%, below the 75% target.",
        type: "info",
        read: false,
        link: "/my-pod",
        metadata: null,
        created_at: daysAgo(1),
      },
    ],
    teamProductivity: [
      { week: "Week 1", completed: 8, created: 10 },
      { week: "Week 2", completed: 12, created: 9 },
      { week: "Week 3", completed: 10, created: 11 },
      { week: "Week 4", completed: 14, created: 8 },
      { week: "Week 5", completed: 11, created: 12 },
      { week: "Week 6", completed: 13, created: 7 },
    ],
  };
}

// ============================================================
// CPIU DASHBOARD
// ============================================================

export async function getCPIUDashboardData(): Promise<CPIUDashboardData> {
  return {
    stats: {
      totalClients: 12,
      activePods: 4,
      totalRevenue: 1247500,
      pendingInvoices: 8,
      openRequests: 23,
      platformUtilization: 82,
    },
    clients: [
      {
        id: "client-1",
        profile_id: "user-1",
        company_name: "Meridian Labs",
        industry: "Technology",
        website: "https://meridianlabs.io",
        address: "123 Tech Drive",
        city: "San Francisco",
        state: "CA",
        country: "US",
        postal_code: "94105",
        tax_id: "94-XXXXXXX",
        notes: "Enterprise client, high priority",
        is_active: true,
        created_at: monthsAgo(12),
        updated_at: daysAgo(5),
      },
      {
        id: "client-2",
        profile_id: "user-8",
        company_name: "Verdant Health",
        industry: "Healthcare",
        website: "https://verdanthealth.com",
        address: "456 Medical Center Blvd",
        city: "Boston",
        state: "MA",
        country: "US",
        postal_code: "02101",
        tax_id: "26-XXXXXXX",
        notes: "Healthcare startup, Series B",
        is_active: true,
        created_at: monthsAgo(8),
        updated_at: daysAgo(3),
      },
      {
        id: "client-3",
        profile_id: "user-9",
        company_name: "Greenfield Corp",
        industry: "Manufacturing",
        website: "https://greenfieldcorp.com",
        address: "789 Industrial Park",
        city: "Chicago",
        state: "IL",
        country: "US",
        postal_code: "60601",
        tax_id: "36-XXXXXXX",
        notes: "Long-term manufacturing client",
        is_active: true,
        created_at: monthsAgo(18),
        updated_at: daysAgo(1),
      },
      {
        id: "client-4",
        profile_id: "user-11",
        company_name: "Nexus Financial",
        industry: "Finance",
        website: "https://nexusfinancial.com",
        address: "321 Wall Street",
        city: "New York",
        state: "NY",
        country: "US",
        postal_code: "10005",
        tax_id: "13-XXXXXXX",
        notes: "Financial services, compliance-heavy",
        is_active: true,
        created_at: monthsAgo(6),
        updated_at: daysAgo(7),
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "Alpha Pod",
        description: "Full-stack web development team",
        manager_id: "user-2",
        is_active: true,
        created_at: monthsAgo(14),
        updated_at: daysAgo(2),
      },
      {
        id: "pod-2",
        name: "Beta Pod",
        description: "Mobile development specialists",
        manager_id: "user-5",
        is_active: true,
        created_at: monthsAgo(10),
        updated_at: daysAgo(1),
      },
      {
        id: "pod-3",
        name: "Gamma Pod",
        description: "Design and brand strategy team",
        manager_id: "user-7",
        is_active: true,
        created_at: monthsAgo(8),
        updated_at: daysAgo(3),
      },
      {
        id: "pod-4",
        name: "Delta Pod",
        description: "DevOps and infrastructure team",
        manager_id: "user-12",
        is_active: true,
        created_at: monthsAgo(5),
        updated_at: daysAgo(1),
      },
    ],
    payments: [
      {
        id: "pay-1",
        invoice_id: "inv-1",
        client_id: "client-1",
        amount: 42500,
        currency: "USD",
        status: "completed",
        payment_method: "bank_transfer",
        stripe_payment_id: "pi-1",
        stripe_receipt_url: null,
        notes: null,
        processed_at: daysAgo(18),
        created_at: daysAgo(18),
        updated_at: daysAgo(18),
      },
      {
        id: "pay-2",
        invoice_id: "inv-5",
        client_id: "client-2",
        amount: 67500,
        currency: "USD",
        status: "completed",
        payment_method: "credit_card",
        stripe_payment_id: "pi-5",
        stripe_receipt_url: null,
        notes: null,
        processed_at: daysAgo(10),
        created_at: daysAgo(10),
        updated_at: daysAgo(10),
      },
      {
        id: "pay-3",
        invoice_id: "inv-6",
        client_id: "client-3",
        amount: 31000,
        currency: "USD",
        status: "processing",
        payment_method: "bank_transfer",
        stripe_payment_id: "pi-6",
        stripe_receipt_url: null,
        notes: null,
        processed_at: null,
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
    ],
    recentRequests: [
      {
        id: "req-30",
        title: "Regulatory compliance portal",
        description: "Build internal compliance tracking portal for SEC requirements",
        status: "in_progress",
        priority: "urgent",
        client_id: "client-4",
        pod_id: "pod-1",
        assigned_to: "user-6",
        category: "development",
        due_date: daysFromNow(45),
        estimated_hours: 120,
        actual_hours: 35,
        clickup_task_id: "cu-req-30",
        tags: ["compliance", "enterprise"],
        is_archived: false,
        project_id: "proj-7",
        created_at: daysAgo(20),
        updated_at: daysAgo(1),
      },
      {
        id: "req-31",
        title: "Patient portal mobile app",
        description: "Native mobile app for patient appointment management",
        status: "in_progress",
        priority: "high",
        client_id: "client-2",
        pod_id: "pod-2",
        assigned_to: "user-6",
        category: "development",
        due_date: daysFromNow(35),
        estimated_hours: 160,
        actual_hours: 48,
        clickup_task_id: "cu-req-31",
        tags: ["mobile", "healthcare"],
        is_archived: false,
        project_id: "proj-8",
        created_at: daysAgo(25),
        updated_at: daysAgo(1),
      },
    ],
    notifications: [
      {
        id: "notif-30",
        user_id: "user-10",
        title: "Payment received",
        message: "Meridian Labs paid $42,500 for invoice GC3-2026-0041.",
        type: "success",
        read: true,
        link: "/payments/pay-1",
        metadata: null,
        created_at: daysAgo(18),
      },
      {
        id: "notif-31",
        user_id: "user-10",
        title: "New client inquiry",
        message: "Nexus Financial has submitted a project inquiry for compliance portal.",
        type: "info",
        read: false,
        link: "/clients/client-4",
        metadata: null,
        created_at: daysAgo(20),
      },
    ],
    monthlyRevenue: [
      { month: "Feb", revenue: 185000, expenses: 112000 },
      { month: "Mar", revenue: 210000, expenses: 118000 },
      { month: "Apr", revenue: 195000, expenses: 115000 },
      { month: "May", revenue: 248000, expenses: 125000 },
      { month: "Jun", revenue: 227500, expenses: 120000 },
      { month: "Jul", revenue: 182000, expenses: 108000 },
    ],
    podPerformance: [
      { name: "Alpha Pod", utilization: 88, satisfaction: 4.6, completion: 92 },
      { name: "Beta Pod", utilization: 76, satisfaction: 4.3, completion: 85 },
      { name: "Gamma Pod", utilization: 82, satisfaction: 4.8, completion: 90 },
      { name: "Delta Pod", utilization: 71, satisfaction: 4.2, completion: 78 },
    ],
  };
}

// ============================================================
// OPERATIONS DASHBOARD
// ============================================================

export async function getOperationsDashboardData(): Promise<OperationsDashboardData> {
  return {
    stats: {
      openTickets: 17,
      resolvedToday: 6,
      avgResponseTime: "2.4h",
      clientSatisfaction: 4.5,
      resourcesAllocated: 22,
      pendingEscalations: 3,
    },
    dailyActivities: [
      { time: "09:00", activity: "Morning standup sync completed", status: "completed", assignee: "Ops Team" },
      { time: "09:30", activity: "Server health check - all systems operational", status: "completed", assignee: "Morgan Lee" },
      { time: "10:15", activity: "Client onboarding - Nexus Financial kickoff", status: "completed", assignee: "Sarah Johnson" },
      { time: "11:00", activity: "Deploy staging build for Meridian Labs", status: "in_progress", assignee: "Taylor Kim" },
      { time: "13:30", activity: "Database backup verification", status: "pending", assignee: "Morgan Lee" },
      { time: "14:00", activity: "Infrastructure cost review meeting", status: "pending", assignee: "Ops Team" },
      { time: "15:30", activity: "Security patch deployment - v2.4.1", status: "pending", assignee: "Taylor Kim" },
    ],
    tickets: [
      {
        id: "tkt-1",
        subject: "Email delivery delays for Verdant Health",
        priority: "high",
        status: "in_progress",
        client: "Verdant Health",
        createdAt: daysAgo(1),
      },
      {
        id: "tkt-2",
        subject: "SSO integration issue - Nexus Financial",
        priority: "urgent",
        status: "escalated",
        client: "Nexus Financial",
        createdAt: daysAgo(0),
      },
      {
        id: "tkt-3",
        subject: "CMS backup failure - Greenfield Corp",
        priority: "medium",
        status: "open",
        client: "Greenfield Corp",
        createdAt: daysAgo(2),
      },
      {
        id: "tkt-4",
        subject: "SSL certificate renewal - Meridian Labs",
        priority: "high",
        status: "in_progress",
        client: "Meridian Labs",
        createdAt: daysAgo(1),
      },
      {
        id: "tkt-5",
        subject: "Performance degradation on staging",
        priority: "low",
        status: "resolved",
        client: "Internal",
        createdAt: daysAgo(3),
      },
      {
        id: "tkt-6",
        subject: "API rate limiting configuration",
        priority: "medium",
        status: "open",
        client: "Meridian Labs",
        createdAt: daysAgo(1),
      },
    ],
    resourceAllocation: [
      { resource: "Alex Rivera", role: "Senior Developer", utilization: 92, status: "allocated" },
      { resource: "Jordan Chen", role: "UI/UX Designer", utilization: 85, status: "allocated" },
      { resource: "Sam Patel", role: "Full-Stack Developer", utilization: 88, status: "allocated" },
      { resource: "Casey Morgan", role: "QA Engineer", utilization: 75, status: "allocated" },
      { resource: "Taylor Kim", role: "Backend Developer", utilization: 80, status: "allocated" },
      { resource: "Morgan Lee", role: "DevOps Engineer", utilization: 65, status: "available" },
      { resource: "Riley Brooks", role: "Junior Developer", utilization: 45, status: "available" },
      { resource: "Jamie Walsh", role: "QA Analyst", utilization: 55, status: "available" },
    ],
    notifications: [
      {
        id: "notif-40",
        user_id: "user-13",
        title: "Ticket escalated",
        message: "SSO integration issue for Nexus Financial has been escalated to Tier 2.",
        type: "error",
        read: false,
        link: "/support",
        metadata: null,
        created_at: hoursAgo(2),
      },
      {
        id: "notif-41",
        user_id: "user-13",
        title: "Server alert resolved",
        message: "CPU usage on us-east-1 has returned to normal levels.",
        type: "success",
        read: true,
        link: null,
        metadata: null,
        created_at: hoursAgo(5),
      },
    ],
    recentActivity: [
      {
        id: "act-40",
        user_id: "user-13",
        action: "resolved_ticket",
        entity_type: "ticket",
        entity_id: "tkt-5",
        entity_name: "Performance degradation on staging",
        metadata: null,
        ip_address: "10.0.1.15",
        created_at: daysAgo(2),
      },
      {
        id: "act-41",
        user_id: "user-14",
        action: "escalated_ticket",
        entity_type: "ticket",
        entity_id: "tkt-2",
        entity_name: "SSO integration issue - Nexus Financial",
        metadata: { reason: "Client deadline at risk" },
        ip_address: "10.0.1.16",
        created_at: hoursAgo(2),
      },
    ],
  };
}

// ============================================================
// LEADERSHIP DASHBOARD
// ============================================================

export async function getLeadershipDashboardData(): Promise<LeadershipDashboardData> {
  return {
    stats: {
      totalRevenue: 1247500,
      revenueGrowth: 12.3,
      totalClients: 12,
      activeProjects: 18,
      overallUtilization: 81,
      clientSatisfaction: 4.6,
    },
    kpis: [
      { label: "Monthly Recurring Revenue", value: "$227,500", target: "$250,000", status: "at_risk" },
      { label: "Client Retention Rate", value: "94%", target: "95%", status: "on_track" },
      { label: "Avg. Project Delivery", value: "28 days", target: "25 days", status: "behind" },
      { label: "Net Promoter Score", value: "72", target: "70", status: "on_track" },
      { label: "Employee Utilization", value: "81%", target: "85%", status: "at_risk" },
      { label: "On-Time Delivery", value: "88%", target: "90%", status: "at_risk" },
    ],
    clients: [
      {
        id: "client-1",
        profile_id: "user-1",
        company_name: "Meridian Labs",
        industry: "Technology",
        website: "https://meridianlabs.io",
        address: "123 Tech Drive",
        city: "San Francisco",
        state: "CA",
        country: "US",
        postal_code: "94105",
        tax_id: "94-XXXXXXX",
        notes: "Enterprise client, high priority",
        is_active: true,
        created_at: monthsAgo(12),
        updated_at: daysAgo(5),
      },
      {
        id: "client-2",
        profile_id: "user-8",
        company_name: "Verdant Health",
        industry: "Healthcare",
        website: "https://verdanthealth.com",
        address: "456 Medical Center Blvd",
        city: "Boston",
        state: "MA",
        country: "US",
        postal_code: "02101",
        tax_id: "26-XXXXXXX",
        notes: "Healthcare startup, Series B",
        is_active: true,
        created_at: monthsAgo(8),
        updated_at: daysAgo(3),
      },
      {
        id: "client-3",
        profile_id: "user-9",
        company_name: "Greenfield Corp",
        industry: "Manufacturing",
        website: "https://greenfieldcorp.com",
        address: "789 Industrial Park",
        city: "Chicago",
        state: "IL",
        country: "US",
        postal_code: "60601",
        tax_id: "36-XXXXXXX",
        notes: "Long-term manufacturing client",
        is_active: true,
        created_at: monthsAgo(18),
        updated_at: daysAgo(1),
      },
      {
        id: "client-4",
        profile_id: "user-11",
        company_name: "Nexus Financial",
        industry: "Finance",
        website: "https://nexusfinancial.com",
        address: "321 Wall Street",
        city: "New York",
        state: "NY",
        country: "US",
        postal_code: "10005",
        tax_id: "13-XXXXXXX",
        notes: "Financial services, compliance-heavy",
        is_active: true,
        created_at: monthsAgo(6),
        updated_at: daysAgo(7),
      },
    ],
    pods: [
      {
        id: "pod-1",
        name: "Alpha Pod",
        description: "Full-stack web development team",
        manager_id: "user-2",
        is_active: true,
        created_at: monthsAgo(14),
        updated_at: daysAgo(2),
      },
      {
        id: "pod-2",
        name: "Beta Pod",
        description: "Mobile development specialists",
        manager_id: "user-5",
        is_active: true,
        created_at: monthsAgo(10),
        updated_at: daysAgo(1),
      },
      {
        id: "pod-3",
        name: "Gamma Pod",
        description: "Design and brand strategy team",
        manager_id: "user-7",
        is_active: true,
        created_at: monthsAgo(8),
        updated_at: daysAgo(3),
      },
      {
        id: "pod-4",
        name: "Delta Pod",
        description: "DevOps and infrastructure team",
        manager_id: "user-12",
        is_active: true,
        created_at: monthsAgo(5),
        updated_at: daysAgo(1),
      },
    ],
    monthlyRevenue: [
      { month: "Feb", revenue: 185000, projected: 190000 },
      { month: "Mar", revenue: 210000, projected: 200000 },
      { month: "Apr", revenue: 195000, projected: 210000 },
      { month: "May", revenue: 248000, projected: 225000 },
      { month: "Jun", revenue: 227500, projected: 240000 },
      { month: "Jul", revenue: 182000, projected: 250000 },
    ],
    podPerformance: [
      { name: "Alpha Pod", utilization: 88, revenue: 485000, satisfaction: 4.6 },
      { name: "Beta Pod", utilization: 76, revenue: 312000, satisfaction: 4.3 },
      { name: "Gamma Pod", utilization: 82, revenue: 278000, satisfaction: 4.8 },
      { name: "Delta Pod", utilization: 71, revenue: 172500, satisfaction: 4.2 },
    ],
    risks: [
      {
        id: "risk-1",
        title: "Beta Pod under-utilization impacting revenue targets",
        severity: "high",
        owner: "Sarah Johnson",
        dueDate: daysFromNow(14),
      },
      {
        id: "risk-2",
        title: "Nexus Financial compliance deadline approaching",
        severity: "critical",
        owner: "David Park",
        dueDate: daysFromNow(30),
      },
      {
        id: "risk-3",
        title: "Infrastructure costs exceeding budget by 12%",
        severity: "medium",
        owner: "Morgan Lee",
        dueDate: daysFromNow(21),
      },
      {
        id: "risk-4",
        title: "Key developer PTO coverage gap in August",
        severity: "low",
        owner: "HR Team",
        dueDate: daysFromNow(45),
      },
    ],
    pendingApprovals: [
      {
        id: "cr-20",
        title: "Scope change - Verdant Health mobile app",
        description: "Add biometric authentication feature to patient portal app",
        status: "under_review",
        client_id: "client-2",
        request_id: "req-31",
        pod_id: "pod-2",
        estimated_hours: 24,
        estimated_cost: 18000,
        reason: "Client compliance requirement for HIPAA",
        pod_manager_notes: "Technically feasible within current architecture",
        reviewed_by: null,
        reviewed_at: null,
        addon_invoice_id: null,
        created_at: daysAgo(5),
        updated_at: daysAgo(2),
      },
      {
        id: "cr-21",
        title: "Additional sprint - Meridian Labs",
        description: "Extra development sprint for advanced reporting features",
        status: "submitted",
        client_id: "client-1",
        request_id: "req-30",
        pod_id: "pod-1",
        estimated_hours: 40,
        estimated_cost: 30000,
        reason: "Client requested expanded analytics capabilities",
        pod_manager_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        addon_invoice_id: null,
        created_at: daysAgo(3),
        updated_at: daysAgo(3),
      },
    ],
    notifications: [
      {
        id: "notif-50",
        user_id: "user-15",
        title: "Critical risk flagged",
        message: "Nexus Financial compliance deadline requires immediate attention.",
        type: "error",
        read: false,
        link: "/reports",
        metadata: null,
        created_at: daysAgo(1),
      },
      {
        id: "notif-51",
        user_id: "user-15",
        title: "Monthly report ready",
        message: "June 2026 executive summary is ready for review.",
        type: "info",
        read: false,
        link: "/reports",
        metadata: null,
        created_at: daysAgo(2),
      },
    ],
  };
}

// ============================================================
// HELPERS
// ============================================================

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

// ============================================================
// COMMON
// ============================================================

export function getCommonNotifications(): Notification[] {
  return [
    {
      id: "c-notif-1",
      user_id: "current",
      title: "System maintenance scheduled",
      message: "Scheduled maintenance window: Saturday 2:00 AM - 4:00 AM EST.",
      type: "info",
      read: false,
      link: null,
      metadata: null,
      created_at: daysAgo(0),
    },
    {
      id: "c-notif-2",
      user_id: "current",
      title: "New feature release",
      message: "Invoice auto-generation is now available in the billing module.",
      type: "success",
      read: true,
      link: "/invoices",
      metadata: null,
      created_at: daysAgo(3),
    },
  ];
}

export function getCommonActivity(): ActivityLog[] {
  return [
    {
      id: "c-act-1",
      user_id: "user-10",
      action: "processed_payment",
      entity_type: "payment",
      entity_id: "pay-2",
      entity_name: "Verdant Health - $67,500",
      metadata: null,
      ip_address: "10.0.0.12",
      created_at: daysAgo(10),
    },
    {
      id: "c-act-2",
      user_id: "user-15",
      action: "approved_change_request",
      entity_type: "change_request",
      entity_id: "cr-1",
      entity_name: "Additional API endpoints",
      metadata: null,
      ip_address: "10.0.0.20",
      created_at: daysAgo(8),
    },
    {
      id: "c-act-3",
      user_id: "user-2",
      action: "created_project",
      entity_type: "project",
      entity_id: "proj-7",
      entity_name: "Regulatory compliance portal",
      metadata: null,
      ip_address: "10.0.0.5",
      created_at: daysAgo(20),
    },
  ];
}
