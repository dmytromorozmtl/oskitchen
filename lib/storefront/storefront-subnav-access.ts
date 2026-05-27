import { requireSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { legacyStorefrontAllowsForActor } from "@/lib/storefront/require-storefront-actor";
import { canAccessStorefrontGiftCardsTab } from "@/lib/storefront/storefront-gift-cards-permission";
import { canAccessStorefrontLoyaltyTab } from "@/lib/storefront/storefront-loyalty-permission";
import { workspacePermissionForStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-permission-keys";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminPermission,
} from "@/lib/storefront/storefront-admin-access";
import type { StorefrontHubAccess } from "@/lib/storefront/storefront-page-access";

type SubnavGate =
  | { kind: "read" }
  | { kind: "manage" }
  | { kind: "media" }
  | { kind: "gift_cards" }
  | { kind: "loyalty" }
  | { kind: "admin"; permission: StorefrontAdminPermission };

const SUBNAV_ENTRIES: { href: string; gate: SubnavGate }[] = [
  { href: "/dashboard/storefront/launch", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/website", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront", gate: { kind: "read" } },
  { href: "/dashboard/storefront/analytics", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/preview", gate: { kind: "read" } },
  { href: "/dashboard/storefront/seo", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/marketing", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/reviews", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/cart-recovery", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/notifications", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/builder", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/media", gate: { kind: "media" } },
  { href: "/dashboard/storefront/pages", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/theme", gate: { kind: "admin", permission: "storefront.theme" } },
  { href: "/dashboard/storefront/menu", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/catalog", gate: { kind: "admin", permission: "storefront.catalog" } },
  { href: "/dashboard/storefront/products", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/markets", gate: { kind: "admin", permission: "storefront.markets" } },
  { href: "/dashboard/storefront/workspace", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/team", gate: { kind: "admin", permission: "storefront.team" } },
  { href: "/dashboard/storefront/ordering", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/fulfillment", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/forms", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/domains", gate: { kind: "manage" } },
  { href: "/dashboard/storefront/redirects", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/discounts", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/gift-cards", gate: { kind: "gift_cards" } },
  { href: "/dashboard/storefront/loyalty", gate: { kind: "loyalty" } },
  { href: "/dashboard/storefront/reservations", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/referrals", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/schedule", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/inventory", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/settings", gate: { kind: "admin", permission: "storefront.settings" } },
  { href: "/dashboard/storefront/advanced", gate: { kind: "admin", permission: "storefront.settings" } },
];

async function canAccessStorefrontAdminTab(
  actor: WorkspacePermissionActor,
  sessionUserId: string,
  permission: StorefrontAdminPermission,
): Promise<boolean> {
  const required = workspacePermissionForStorefrontAdminPermission(permission);
  const canonicalOk =
    hasPermission(actor.granted, required) ||
    (await legacyStorefrontAllowsForActor(actor, required));
  if (!canonicalOk) return false;
  const access = await resolveStorefrontAdminAccess(sessionUserId);
  return access.ok && access.permissions.includes(permission);
}

/** Resolve which storefront subnav links the current actor may see. */
export async function resolveStorefrontSubnavVisibleHrefs(
  hub: StorefrontHubAccess,
): Promise<string[]> {
  const sessionUser = await requireSessionUser();
  const visible: string[] = [];

  for (const entry of SUBNAV_ENTRIES) {
    switch (entry.gate.kind) {
      case "read":
        if (hub.canRead) visible.push(entry.href);
        break;
      case "manage":
        if (hub.canManage) visible.push(entry.href);
        break;
      case "media":
        if (hub.canManageMedia) visible.push(entry.href);
        break;
      case "gift_cards":
        if (canAccessStorefrontGiftCardsTab(hub.actor.granted, hub.canRead)) {
          const access = await resolveStorefrontAdminAccess(sessionUser.id);
          if (access.ok) visible.push(entry.href);
        }
        break;
      case "loyalty":
        if (canAccessStorefrontLoyaltyTab(hub.actor.granted, hub.canRead)) {
          const access = await resolveStorefrontAdminAccess(sessionUser.id);
          if (access.ok) visible.push(entry.href);
        }
        break;
      case "admin":
        if (await canAccessStorefrontAdminTab(hub.actor, sessionUser.id, entry.gate.permission)) {
          visible.push(entry.href);
        }
        break;
    }
  }

  return visible;
}
