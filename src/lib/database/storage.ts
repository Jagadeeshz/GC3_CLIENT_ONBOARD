import { createSupabaseClient } from "@/lib/supabase/client";

const BUCKETS = {
  AVATARS: "avatars",
  DOCUMENTS: "documents",
  DELIVERABLES: "deliverables",
  ATTACHMENTS: "attachments",
} as const;

export function uploadFileClient(
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  return new Promise((resolve) => {
    const supabase = createSupabaseClient();

    onProgress?.(10);

    supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })
      .then((result: { data: { path: string } | null; error: { message: string } | null }) => {
        if (result.error) {
          console.error("Client upload error:", result.error);
          resolve(null);
          return;
        }

        onProgress?.(100);
        resolve(result.data?.path ?? null);
      });
  });
}

export function getPublicUrlClient(bucket: string, path: string): string {
  const supabase = createSupabaseClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKETS };
