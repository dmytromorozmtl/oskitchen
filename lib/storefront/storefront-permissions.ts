import type { UserRole } from "@prisma/client";

import { isSuperAdminEmail } from "@/lib/platform-owner";

export type StorefrontPermission =
  | "storefront:view"
  | "storefront:edit-draft"
  | "storefront:publish"
  | "storefront:edit-navigation"
  | "storefront:edit-footer"
  | "storefront:edit-theme"
  | "storefront:upload-assets"
  | "storefront:delete-assets"
  | "storefront:edit-legal"
  | "storefront:manage-domain"
  | "storefront:toggle-publication";

const OWNER_ALL: StorefrontPermission[] = [
  "storefront:view",
  "storefront:edit-draft",
  "storefront:publish",
  "storefront:edit-navigation",
  "storefront:edit-footer",
  "storefront:edit-theme",
  "storefront:upload-assets",
  "storefront:delete-assets",
  "storefront:edit-legal",
  "storefront:manage-domain",
  "storefront:toggle-publication",
];

/** Staff: operational dashboard access assumed elsewhere; storefront builder defaults to view-only. */
const STAFF_DEFAULT: StorefrontPermission[] = ["storefront:view"];

export function storefrontPermissionsForRole(
  role: UserRole,
  opts?: { marketingDraft?: boolean; staffPublish?: boolean },
): Set<StorefrontPermission> {
  if (role === "OWNER") return new Set(OWNER_ALL);
  const s = new Set(STAFF_DEFAULT);
  if (opts?.marketingDraft) {
    s.add("storefront:edit-draft");
    s.add("storefront:edit-navigation");
    s.add("storefront:edit-footer");
    s.add("storefront:upload-assets");
  }
  if (opts?.staffPublish) {
    s.add("storefront:publish");
    s.add("storefront:toggle-publication");
  }
  return s;
}

export function canStorefront(
  perms: Set<StorefrontPermission>,
  key: StorefrontPermission,
  ctx?: { email?: string | null },
): boolean {
  if (isSuperAdminEmail(ctx?.email ?? null)) return true;
  return perms.has(key);
}
