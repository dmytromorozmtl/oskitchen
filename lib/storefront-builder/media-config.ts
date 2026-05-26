/** Server-only: true when a storage provider + bucket are configured. */
export function isStorefrontMediaUploadConfigured(): boolean {
  const bucket =
    process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() ||
    process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() ||
    process.env.STOREFRONT_S3_BUCKET?.trim();
  if (!bucket) return false;
  if (process.env.STOREFRONT_SUPABASE_STORAGE_BUCKET?.trim() && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return true;
  }
  if (
    process.env.STOREFRONT_S3_BUCKET?.trim() &&
    process.env.STOREFRONT_S3_REGION?.trim() &&
    process.env.STOREFRONT_S3_ACCESS_KEY_ID?.trim() &&
    process.env.STOREFRONT_S3_SECRET_ACCESS_KEY?.trim()
  ) {
    return true;
  }
  return Boolean(process.env.STOREFRONT_MEDIA_UPLOAD_BUCKET?.trim() && process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
}
