import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { requireSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { workspacePermissionForStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-permission-keys";
import {
  resolveStorefrontAdminAccess,
  type StorefrontAdminPermission,
} from "@/lib/storefront/storefront-admin-access";
import { legacyStorefrontAllowsForActor } from "@/lib/storefront/require-storefront-actor";
import { logStorefrontPermissionDenied } from "@/services/storefront/storefront-permission-audit";

function deniedCard(message: string): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront admin",
    description: message,
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireStorefrontAdminPageAccess(permission: StorefrontAdminPermission) {
  try {
    const user = await requireSessionUser();
    const actor = await requireWorkspacePermissionActor();
    const required = workspacePermissionForStorefrontAdminPermission(permission);
    const canonicalOk =
      hasPermission(actor.granted, required) ||
      (await legacyStorefrontAllowsForActor(actor, required));

    if (!canonicalOk) {
      await logStorefrontPermissionDenied(actor, {
        requiredPermission: required,
        operation: `storefront.admin.page.${permission}`,
        metadata: { adminPermission: permission },
      });
      return {
        ok: false as const,
        deny: deniedCard("You do not have permission to access this storefront admin area."),
      };
    }

    const access = await resolveStorefrontAdminAccess(user.id);
    if (!access.ok || !access.permissions.includes(permission)) {
      await logStorefrontPermissionDenied(actor, {
        requiredPermission: required,
        operation: `storefront.admin.page.${permission}`,
        metadata: {
          adminPermission: permission,
          storefrontResolved: access.ok,
          tabGranted: access.ok ? access.permissions.includes(permission) : false,
        },
      });
      return {
        ok: false as const,
        deny: deniedCard(
          access.ok
            ? "This storefront tab is not enabled for your role."
            : (access.error ?? "No storefront access."),
        ),
      };
    }

    return {
      ok: true as const,
      actor,
      access,
      userId: access.storefront.userId,
    };
  } catch {
    return {
      ok: false as const,
      deny: deniedCard("You do not have permission to access this storefront admin area."),
    };
  }
}
