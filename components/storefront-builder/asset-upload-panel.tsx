"use client";

import { getStorefrontStorageStatus } from "@/services/storefront/storefront-storage-service";

export function AssetUploadPanel() {
  const status = getStorefrontStorageStatus();
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
      {status.ready
        ? "Storage is configured — wire the authenticated upload server action to your provider to enable uploads."
        : "Storage provider is not configured. Set Supabase bucket env vars or S3-compatible credentials before uploading."}
    </div>
  );
}
