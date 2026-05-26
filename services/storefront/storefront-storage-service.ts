import { resolveConfiguredStorefrontStorageProvider } from "@/lib/storefront/storage-provider";

/** Storage wiring — returns null when no provider is configured (uploads must not proceed). */
export function getStorefrontStorageStatus(): { ready: boolean; provider: string } {
  const p = resolveConfiguredStorefrontStorageProvider();
  return { ready: p !== "NONE", provider: p };
}
