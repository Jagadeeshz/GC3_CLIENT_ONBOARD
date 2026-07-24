"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { getDashboardRoute } from "@/lib/rbac/guards";
import type { UserProfile, UserRole } from "@/types";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);

  const buildFallbackUser = useCallback(
    (rawUser: User): UserProfile => ({
      id: rawUser.id,
      email: rawUser.email ?? "",
      full_name:
        rawUser.user_metadata?.full_name ??
        rawUser.user_metadata?.name ??
        rawUser.email?.split("@")[0] ??
        "User",
      avatar_url: rawUser.user_metadata?.avatar_url ?? null,
      role: (rawUser.user_metadata?.role as UserRole) ?? "client",
      phone: rawUser.user_metadata?.phone ?? null,
      company: rawUser.user_metadata?.company ?? null,
      is_active: true,
      last_login_at: null,
      created_at: rawUser.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    []
  );

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, phone, company, is_active, last_login_at, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as UserProfile;
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          setRawUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) setUser(profile ?? buildFallbackUser(session.user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          setRawUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile ?? buildFallbackUser(session.user));
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setRawUser(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile ?? buildFallbackUser(session.user));
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile, buildFallbackUser]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setRawUser(data.user);
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);

        const redirectRoute = profile ? getDashboardRoute(profile.role) : "/dashboard";
        router.push(redirectRoute);
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRawUser(null);
    window.location.href = "/";
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = () => hasRole(["cpiu", "leadership"]);

  return {
    user,
    rawUser,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    isAdmin,
  };
}
