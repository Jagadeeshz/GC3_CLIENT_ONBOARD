import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const PKCE_VERIFIER_KEY = "gc3-pkce-code-verifier";

let client: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      const auth = (client as any).auth;
      if (auth?.storage) {
        const origSetItem = auth.storage.setItem.bind(auth.storage);
        const origGetItem = auth.storage.getItem.bind(auth.storage);
        const origRemoveItem = auth.storage.removeItem.bind(auth.storage);

        auth.storage.setItem = async (key: string, value: string) => {
          await origSetItem(key, value);
          if (key.endsWith("-code-verifier")) {
            try {
              localStorage.setItem(PKCE_VERIFIER_KEY, value);
            } catch {}
          }
        };

        auth.storage.getItem = async (key: string) => {
          let value = await origGetItem(key);
          if (!value && key.endsWith("-code-verifier")) {
            try {
              value = localStorage.getItem(PKCE_VERIFIER_KEY);
            } catch {}
          }
          return value;
        };

        auth.storage.removeItem = async (key: string) => {
          await origRemoveItem(key);
          if (key.endsWith("-code-verifier")) {
            try {
              localStorage.removeItem(PKCE_VERIFIER_KEY);
            } catch {}
          }
        };
      }
    } catch {}
  }
  return client;
}
