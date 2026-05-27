import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  canStorefront,
  type StorefrontPermission,
} from "@/lib/storefront/storefront-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";

export function canPublishStorefrontFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "storefront.publish");
}

export function canManageStorefrontMediaFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "storefront.media.manage");
}

export async function resolveStorefrontPublishAccess(userId: string, email: string | null) {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(userId);
  const canPublish =
    canPublishStorefrontFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:publish", {
      email,
      workspaceGranted: actor.granted,
    });
  return { actor, canPublish };
}

export async function resolveStorefrontMediaAccess(userId: string, email: string | null) {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(userId);
  const canManageMedia =
    canManageStorefrontMediaFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:upload-assets", {
      email,
      workspaceGranted: actor.granted,
    });
  return { actor, canManageMedia };
}

export function storefrontPublishDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront publish",
    description:
      "You do not have permission to publish storefront theme or page changes in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export function storefrontMediaDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront media",
    description: "You do not have permission to upload or delete storefront media assets.",
    primaryHref: "/dashboard/storefront",
    primaryLabel: "Storefront overview",
  });
}
