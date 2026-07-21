import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

// ============================================================
// Profile Helpers
// ============================================================
export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as Tables["profiles"]["Row"];
}

export async function updateProfile(userId: string, updates: Tables["profiles"]["Update"]) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Tables["profiles"]["Row"];
}

// ============================================================
// Client Helpers
// ============================================================
export async function getClient(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, profiles:profile_id(*)")
    .eq("profile_id", profileId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllClients() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*, profiles:profile_id(full_name, email, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Pod Helpers
// ============================================================
export async function getPods() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pods")
    .select("*, manager:manager_id(full_name, email), pod_members(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPodById(podId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pods")
    .select(`
      *,
      manager:manager_id(id, full_name, email, avatar_url),
      pod_members(
        id,
        profile_id,
        role,
        profiles:profile_id(id, full_name, email, avatar_url)
      )
    `)
    .eq("id", podId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPodsForClient(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("client_pods")
    .select("pods:pod_id(*)")
    .eq("client_id", clientId);

  if (error) throw error;
  return data.map((cp) => cp.pods);
}

export async function getPodsForManager(managerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pods")
    .select("*")
    .eq("manager_id", managerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Request Helpers
// ============================================================
export async function getRequests(filters?: {
  client_id?: string;
  pod_id?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("requests")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      pod:pod_id(id, name),
      assignee:assigned_to(id, full_name, email, avatar_url)
    `, { count: "exact" });

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.pod_id) {
    query = query.eq("pod_id", filters.pod_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function getRequestById(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("requests")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email, avatar_url)),
      pod:pod_id(id, name),
      assignee:assigned_to(id, full_name, email, avatar_url),
      deliverables(*)
    `)
    .eq("id", requestId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// Deliverable Helpers
// ============================================================
export async function getDeliverablesForRequest(requestId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(`
      *,
      assignee:assigned_to(id, full_name, email, avatar_url),
      versions:deliverable_versions(*)
    `)
    .eq("request_id", requestId)
    .order("version", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Hours Wallet Helpers
// ============================================================
export async function getHoursWallet(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hours_wallet")
    .select("*")
    .eq("client_id", clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function getHoursTransactions(walletId: string, limit = 50) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hours_transactions")
    .select(`
      *,
      request:request_id(id, title),
      creator:created_by(id, full_name)
    `)
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ============================================================
// Invoice Helpers
// ============================================================
export async function getInvoices(filters?: {
  client_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("invoices")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      line_items:invoice_line_items(*)
    `, { count: "exact" });

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// ============================================================
// Document Helpers
// ============================================================
export async function getDocuments(filters?: {
  client_id?: string;
  category?: string;
  folder?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("documents")
    .select(`
      *,
      uploader:uploaded_by(id, full_name, email),
      client:client_id(id, company_name)
    `, { count: "exact" });

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.folder) {
    query = query.eq("folder", filters.folder);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// ============================================================
// Notification Helpers
// ============================================================
export async function getNotifications(userId: string, unreadOnly = false) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(50);

  if (error) throw error;
  return data;
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
  return count || 0;
}

// ============================================================
// Activity Log Helpers
// ============================================================
export async function getActivityLogs(filters?: {
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createSupabaseServerClient();
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("activity_logs")
    .select(`
      *,
      user:user_id(id, full_name, email, avatar_url)
    `, { count: "exact" });

  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }
  if (filters?.entity_id) {
    query = query.eq("entity_id", filters.entity_id);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

// ============================================================
// Change Request Helpers
// ============================================================
export async function getChangeRequests(filters?: {
  client_id?: string;
  request_id?: string;
  status?: string;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("change_requests")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name, email)),
      request:request_id(id, title),
      reviewer:reviewed_by(id, full_name, email)
    `);

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.request_id) {
    query = query.eq("request_id", filters.request_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Feedback Helpers
// ============================================================
export async function getFeedback(filters?: {
  client_id?: string;
  deliverable_id?: string;
  type?: string;
}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("feedback")
    .select(`
      *,
      client:client_id(id, company_name, profiles:profile_id(full_name)),
      deliverable:deliverable_id(id, title),
      request:request_id(id, title)
    `);

  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.deliverable_id) {
    query = query.eq("deliverable_id", filters.deliverable_id);
  }
  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================
// Search Helpers (Global Search)
// ============================================================
export async function globalSearch(query: string) {
  const supabase = await createSupabaseServerClient();
  const searchTerm = `%${query}%`;

  const [requests, deliverables, documents, invoices, clients, profiles] = await Promise.all([
    supabase
      .from("requests")
      .select("id, title, description, status, created_at")
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from("deliverables")
      .select("id, title, description, status, created_at")
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from("documents")
      .select("id, title, description, category, created_at")
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, status, created_at")
      .or(`invoice_number.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5),
    supabase
      .from("clients")
      .select("id, company_name, created_at")
      .ilike("company_name", searchTerm)
      .limit(5),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5),
  ]);

  return {
    requests: requests.data || [],
    deliverables: deliverables.data || [],
    documents: documents.data || [],
    invoices: invoices.data || [],
    clients: clients.data || [],
    profiles: profiles.data || [],
  };
}

// ============================================================
// Dashboard Analytics Helpers
// ============================================================
export async function getDashboardStats(userId: string, role: string) {
  const supabase = await createSupabaseServerClient();

  const stats = {
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalDeliverables: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    hoursUsed: 0,
    hoursRemaining: 0,
  };

  if (role === "client") {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", userId)
      .single();

    if (client) {
      const [requests, deliverables, invoices, wallet] = await Promise.all([
        supabase
          .from("requests")
          .select("id, status", { count: "exact" })
          .eq("client_id", client.id),
        supabase
          .from("deliverables")
          .select("id", { count: "exact" })
          .in("request_id",
            (await supabase.from("requests").select("id").eq("client_id", client.id)).data?.map(r => r.id) || []
          ),
        supabase
          .from("invoices")
          .select("id, amount, status", { count: "exact" })
          .eq("client_id", client.id),
        supabase
          .from("hours_wallet")
          .select("total_hours, used_hours")
          .eq("client_id", client.id)
          .single(),
      ]);

      stats.totalRequests = requests.count || 0;
      stats.pendingRequests = requests.data?.filter(r => ["pending", "in_review", "in_progress"].includes(r.status)).length || 0;
      stats.completedRequests = requests.data?.filter(r => r.status === "completed").length || 0;
      stats.totalDeliverables = deliverables.count || 0;
      stats.totalInvoices = invoices.count || 0;
      stats.pendingInvoices = invoices.data?.filter(i => ["draft", "pending"].includes(i.status)).length || 0;
      stats.totalRevenue = invoices.data?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      stats.hoursUsed = Number(wallet.data?.used_hours) || 0;
      stats.hoursRemaining = Number(wallet.data?.total_hours || 0) - Number(wallet.data?.used_hours || 0);
    }
  } else if (role === "cpiu" || role === "leadership") {
    const [requests, deliverables, invoices] = await Promise.all([
      supabase.from("requests").select("id, status", { count: "exact" }),
      supabase.from("deliverables").select("id", { count: "exact" }),
      supabase.from("invoices").select("id, amount, status", { count: "exact" }),
    ]);

    stats.totalRequests = requests.count || 0;
    stats.pendingRequests = requests.data?.filter(r => ["pending", "in_review", "in_progress"].includes(r.status)).length || 0;
    stats.completedRequests = requests.data?.filter(r => r.status === "completed").length || 0;
    stats.totalDeliverables = deliverables.count || 0;
    stats.totalInvoices = invoices.count || 0;
    stats.pendingInvoices = invoices.data?.filter(i => ["draft", "pending"].includes(i.status)).length || 0;
    stats.totalRevenue = invoices.data?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
  } else if (role === "pod_manager") {
    const { data: pods } = await supabase
      .from("pods")
      .select("id")
      .eq("manager_id", userId);

    const podIds = pods?.map(p => p.id) || [];

    if (podIds.length > 0) {
      const [requests, deliverables] = await Promise.all([
        supabase.from("requests").select("id, status", { count: "exact" }).in("pod_id", podIds),
        supabase.from("deliverables").select("id", { count: "exact" }).in("pod_id", podIds),
      ]);

      stats.totalRequests = requests.count || 0;
      stats.pendingRequests = requests.data?.filter(r => ["pending", "in_review", "in_progress"].includes(r.status)).length || 0;
      stats.completedRequests = requests.data?.filter(r => r.status === "completed").length || 0;
      stats.totalDeliverables = deliverables.count || 0;
    }
  }

  return stats;
}
