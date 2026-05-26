export type StorefrontStorageProviderKind = "SUPABASE" | "S3_COMPATIBLE" | "NONE";

export function resolveConfiguredStorefrontStorageProvider(): StorefrontStorageProviderKind {
  if (process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return "SUPABASE";
  }
  if (
    process.env.STOREFRONT_S3_BUCKET?.trim() &&
    process.env.STOREFRONT_S3_REGION?.trim() &&
    process.env.STOREFRONT_S3_ACCESS_KEY_ID?.trim() &&
    process.env.STOREFRONT_S3_SECRET_ACCESS_KEY?.trim()
  ) {
    return "S3_COMPATIBLE";
  }
  return "NONE";
}
