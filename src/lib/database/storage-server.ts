import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  return data.path;
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error("Delete error:", error);
    return false;
  }

  return true;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}

export async function listFiles(bucket: string, folder?: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder || "", {
      limit: 100,
      offset: 0,
    });

  if (error) {
    console.error("List files error:", error);
    return [];
  }

  return data;
}

export async function createBuckets() {
  const supabase = await createSupabaseServerClient();
  const BUCKETS = {
    AVATARS: "avatars",
    DOCUMENTS: "documents",
    DELIVERABLES: "deliverables",
    ATTACHMENTS: "attachments",
  } as const;

  for (const bucket of Object.values(BUCKETS)) {
    const { error } = await supabase.storage.createBucket(bucket, {
      public: bucket === BUCKETS.AVATARS,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: [
        "image/*",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
        "application/zip",
      ],
    });

    if (error && !error.message.includes("already exists")) {
      console.error(`Error creating bucket ${bucket}:`, error);
    }
  }
}
