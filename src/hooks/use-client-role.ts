"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { ClientSubRole, WorkspaceMember } from "@/types";

export interface ClientRoleState {
  subRole: ClientSubRole | null;
  workspaceMember: WorkspaceMember | null;
  isClientAdmin: boolean;
  isClientManager: boolean;
  isClientMember: boolean;
  isClientViewer: boolean;
  canManageTeam: boolean;
  canCreateRequests: boolean;
  canEditSettings: boolean;
  isReadOnly: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

function mapRoleToSubRole(role: string): ClientSubRole {
  switch (role) {
    case "owner":
    case "client_admin":
      return "client_admin";
    case "client_manager":
    case "project_manager":
      return "client_manager";
    case "client_member":
    case "marketing":
    case "finance":
    case "reviewer":
      return "client_member";
    case "client_viewer":
    case "viewer":
      return "client_viewer";
    default:
      return "client_member";
  }
}

export function useClientRole(): ClientRoleState {
  const { user } = useAuth();
  const [workspaceMember, setWorkspaceMember] = useState<WorkspaceMember | null>(null);
  const [subRole, setSubRole] = useState<ClientSubRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user || user.role !== "client") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/team-members");
      const result = await response.json();
      if (response.ok && Array.isArray(result.data)) {
        const myMembership = result.data.find(
          (m: WorkspaceMember) => m.profile_id === user.id && (m.status === "active" || m.status === "pending")
        );
        if (myMembership) {
          setWorkspaceMember(myMembership);
          setSubRole(mapRoleToSubRole(myMembership.role));
        } else {
          setSubRole("client_admin");
        }
      }
    } catch {
      setSubRole("client_admin");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const isClientAdmin = subRole === "client_admin";
  const isClientManager = subRole === "client_manager";
  const isClientMember = subRole === "client_member";
  const isClientViewer = subRole === "client_viewer";

  return {
    subRole,
    workspaceMember,
    isClientAdmin,
    isClientManager,
    isClientMember,
    isClientViewer,
    canManageTeam: isClientAdmin,
    canCreateRequests: !isClientViewer,
    canEditSettings: isClientAdmin,
    isReadOnly: isClientViewer,
    loading,
    refresh: fetchRole,
  };
}
