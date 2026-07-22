import { createBrowserClient } from "@supabase/ssr";

const VERIFIER_KEY = "supabase.auth.token-code-verifier";
const LS_KEY = "__gc3_pkce_verifier";

type StorageLike = {
  isServer: boolean;
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function isVerifierKey(key: string): boolean {
  return key === VERIFIER_KEY || key.startsWith(VERIFIER_KEY + ".");
}

function wrapStorage(original: StorageLike): StorageLike {
  return {
    isServer: original.isServer,
    getItem: async (key: string) => {
      const value = await original.getItem(key);
      if (value) return value;

      if (isVerifierKey(key)) {
        try {
          const lsValue = localStorage.getItem(LS_KEY);
          if (lsValue) {
            await original.setItem(VERIFIER_KEY, lsValue);
            return await original.getItem(key);
          }
        } catch {}
      }
      return null;
    },
    setItem: async (key: string, value: string) => {
      await original.setItem(key, value);
      if (isVerifierKey(key) && key === VERIFIER_KEY) {
        try {
          localStorage.setItem(LS_KEY, value);
        } catch {}
      }
    },
    removeItem: async (key: string) => {
      await original.removeItem(key);
      if (isVerifierKey(key)) {
        try {
          localStorage.removeItem(LS_KEY);
        } catch {}
      }
    },
  };
}

let lastClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (client !== lastClient) {
    lastClient = client;
    const auth = client.auth as unknown as { storage: StorageLike };
    if (auth.storage && !auth.storage.isServer) {
      auth.storage = wrapStorage(auth.storage);
    }
  }

  return client;
}
