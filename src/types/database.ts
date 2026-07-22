export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          company?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          phone?: string | null;
          company?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
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
        };
        Insert: {
          id?: string;
          profile_id: string;
          company_name: string;
          industry?: string | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          postal_code?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          company_name?: string;
          industry?: string | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          postal_code?: string | null;
          tax_id?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pods: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          manager_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          manager_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          manager_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      pod_members: {
        Row: {
          id: string;
          pod_id: string;
          profile_id: string;
          role: string;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pod_id: string;
          profile_id: string;
          role?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pod_id?: string;
          profile_id?: string;
          role?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_pods: {
        Row: {
          id: string;
          client_id: string;
          pod_id: string;
          assigned_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          pod_id: string;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          pod_id?: string;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: RequestStatus;
          priority: PriorityLevel;
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
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: RequestStatus;
          priority?: PriorityLevel;
          client_id: string;
          pod_id?: string | null;
          lead_id?: string | null;
          start_date?: string | null;
          target_end_date?: string | null;
          actual_end_date?: string | null;
          estimated_hours?: number | null;
          budget?: number | null;
          tags?: string[];
          is_archived?: boolean;
          clickup_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: RequestStatus;
          priority?: PriorityLevel;
          client_id?: string;
          pod_id?: string | null;
          lead_id?: string | null;
          start_date?: string | null;
          target_end_date?: string | null;
          actual_end_date?: string | null;
          estimated_hours?: number | null;
          budget?: number | null;
          tags?: string[];
          is_archived?: boolean;
          clickup_project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      request_projects: {
        Row: {
          id: string;
          request_id: string;
          project_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          project_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          project_id?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      requests: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: RequestStatus;
          priority: PriorityLevel;
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
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: RequestStatus;
          priority?: PriorityLevel;
          client_id: string;
          pod_id?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number;
          clickup_task_id?: string | null;
          tags?: string[];
          is_archived?: boolean;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: RequestStatus;
          priority?: PriorityLevel;
          client_id?: string;
          pod_id?: string | null;
          assigned_to?: string | null;
          category?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number;
          clickup_task_id?: string | null;
          tags?: string[];
          is_archived?: boolean;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deliverables: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: RequestStatus;
          request_id: string;
          pod_id: string;
          assigned_to?: string | null;
          version?: number;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          feedback_id?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: RequestStatus;
          request_id?: string;
          pod_id?: string;
          assigned_to?: string | null;
          version?: number;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          feedback_id?: string | null;
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deliverable_versions: {
        Row: {
          id: string;
          deliverable_id: string;
          version: number;
          file_url: string;
          file_name: string;
          file_size: number | null;
          change_notes: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          deliverable_id: string;
          version: number;
          file_url: string;
          file_name: string;
          file_size?: number | null;
          change_notes?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          deliverable_id?: string;
          version?: number;
          file_url?: string;
          file_name?: string;
          file_size?: number | null;
          change_notes?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      hours_wallet: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_id: string;
          total_hours?: number;
          used_hours?: number;
          remaining_hours?: never;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          total_hours?: number;
          used_hours?: number;
          remaining_hours?: never;
          billing_period_start?: string | null;
          billing_period_end?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hours_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          request_id: string | null;
          hours: number;
          type: "credit" | "debit";
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          request_id?: string | null;
          hours: number;
          type: "credit" | "debit";
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          request_id?: string | null;
          hours?: number;
          type?: "credit" | "debit";
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category?: DocumentCategory;
          file_url: string;
          file_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          client_id?: string | null;
          request_id?: string | null;
          uploaded_by?: string | null;
          folder?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: DocumentCategory;
          file_url?: string;
          file_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          client_id?: string | null;
          request_id?: string | null;
          uploaded_by?: string | null;
          folder?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version: number;
          file_url: string;
          file_name: string;
          file_size: number | null;
          change_notes: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version: number;
          file_url: string;
          file_name: string;
          file_size?: number | null;
          change_notes?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          version?: number;
          file_url?: string;
          file_name?: string;
          file_size?: number | null;
          change_notes?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
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
        };
        Insert: {
          id?: string;
          invoice_number?: string;
          client_id: string;
          amount: number;
          currency?: string;
          status?: InvoiceStatus;
          description?: string | null;
          notes?: string | null;
          due_date: string;
          paid_at?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          is_addon?: boolean;
          change_request_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          client_id?: string;
          amount?: number;
          currency?: string;
          status?: InvoiceStatus;
          description?: string | null;
          notes?: string | null;
          due_date?: string;
          paid_at?: string | null;
          stripe_invoice_id?: string | null;
          stripe_payment_intent_id?: string | null;
          is_addon?: boolean;
          change_request_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price: number;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          amount?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
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
        };
        Insert: {
          id?: string;
          invoice_id: string;
          client_id: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: string | null;
          stripe_payment_id?: string | null;
          stripe_receipt_url?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          client_id?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: string | null;
          stripe_payment_id?: string | null;
          stripe_receipt_url?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          title?: string | null;
          department?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          title?: string | null;
          department?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      faq: {
        Row: {
          id: string;
          question: string;
          answer: string;
          category: string;
          sort_order: number;
          is_published: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          category?: string;
          sort_order?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          category?: string;
          sort_order?: number;
          is_published?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          read: boolean;
          link: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: NotificationType;
          read?: boolean;
          link?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: NotificationType;
          read?: boolean;
          link?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          title: string | null;
          is_group: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          is_group?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          is_group?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_members: {
        Row: {
          id: string;
          conversation_id: string;
          profile_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          profile_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          profile_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
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
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          file_url?: string | null;
          file_name?: string | null;
          reply_to?: string | null;
          read_at?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          file_url?: string | null;
          file_name?: string | null;
          reply_to?: string | null;
          read_at?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_name: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_name?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          entity_name?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      change_requests: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: ChangeRequestStatus;
          client_id: string;
          request_id: string;
          pod_id?: string | null;
          estimated_hours?: number | null;
          estimated_cost?: number | null;
          reason?: string | null;
          pod_manager_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          addon_invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: ChangeRequestStatus;
          client_id?: string;
          request_id?: string;
          pod_id?: string | null;
          estimated_hours?: number | null;
          estimated_cost?: number | null;
          reason?: string | null;
          pod_manager_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          addon_invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      feedback: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_id: string;
          deliverable_id?: string | null;
          request_id?: string | null;
          type?: FeedbackType;
          rating?: number | null;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          deliverable_id?: string | null;
          request_id?: string | null;
          type?: FeedbackType;
          rating?: number | null;
          comment?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          profile_id: string;
          client_id: string;
          role: string;
          department: string | null;
          phone: string | null;
          status: string;
          invited_by: string | null;
          invited_at: string | null;
          joined_at: string | null;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          client_id: string;
          role?: string;
          department?: string | null;
          phone?: string | null;
          status?: string;
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string | null;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          client_id?: string;
          role?: string;
          department?: string | null;
          phone?: string | null;
          status?: string;
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string | null;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Enums: {
      user_role: "client" | "pod_member" | "pod_manager" | "cpiu" | "leadership";
      request_status: "pending" | "in_review" | "in_progress" | "completed" | "cancelled" | "on_hold";
      priority_level: "low" | "medium" | "high" | "urgent";
      invoice_status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
      payment_status: "pending" | "processing" | "completed" | "failed" | "refunded";
      change_request_status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "implemented";
      notification_type: "info" | "success" | "warning" | "error";
      document_category: "contract" | "proposal" | "report" | "design" | "development" | "other";
      feedback_type: "deliverable" | "service" | "general";
    };
  };
};

type UserRole = Database["public"]["Enums"]["user_role"];
type RequestStatus = Database["public"]["Enums"]["request_status"];
type PriorityLevel = Database["public"]["Enums"]["priority_level"];
type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type ChangeRequestStatus = Database["public"]["Enums"]["change_request_status"];
type NotificationType = Database["public"]["Enums"]["notification_type"];
type DocumentCategory = Database["public"]["Enums"]["document_category"];
type FeedbackType = Database["public"]["Enums"]["feedback_type"];
