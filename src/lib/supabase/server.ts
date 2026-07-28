import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Fallback for environments without Supabase: provide a mock client
    const mockClient = {
      auth: {
        session: async () => null,
        signInWithPassword: async () => { throw new Error("Supabase not configured"); },
        signOut: async () => {},
      },
      from: () => ({
        select: async () => ({ data: [], error: null }),
        insert: async () => ({ data: [], error: null }),
        delete: async () => ({ data: [], error: null }),
        update: async () => ({ data: [], error: null }),
      }),
    };
    return mockClient as any;
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - ignore
          }
        },
      },
    }
  );
}
