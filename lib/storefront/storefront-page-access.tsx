import { createElement, type ReactNode } from "react";

import { PosAccessCard } from "@/components/dashboard/pos-access-card";
import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";
import {
  canStorefront,
  type StorefrontPermission,
} from "@/lib/storefront/storefront-permissions";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logStorefrontPermissionDenied } from "@/services/storefront/storefront-permission-audit";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";

export function canPublishStorefrontFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "storefront.publish");
}

export function canManageStorefrontMediaFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "storefront.media.manage");
}

export function canManageStorefrontDraftFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return hasPermission(granted, "storefront.manage");
}

export function canViewStorefrontFromGranted(granted: ReadonlySet<PermissionKey>): boolean {
  return (
    hasPermission(granted, "storefront.read") ||
    canManageStorefrontDraftFromGranted(granted) ||
    canPublishStorefrontFromGranted(granted) ||
    canManageStorefrontMediaFromGranted(granted)
  );
}

export type StorefrontHubAccess = {
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>;
  canRead: boolean;
  canManage: boolean;
  canPublish: boolean;
  canManageMedia: boolean;
};

export async function resolveStorefrontHubAccess(): Promise<StorefrontHubAccess> {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(actor.sessionUserId);
  const legacyCtx = {
    email: actor.email,
    workspaceGranted: actor.granted,
    platformBypass: actor.platformBypass,
  };
  const canManage =
    canManageStorefrontDraftFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:edit-draft", legacyCtx);
  const canPublish =
    canPublishStorefrontFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:publish", legacyCtx);
  const canManageMedia =
    canManageStorefrontMediaFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:upload-assets", legacyCtx);
  const canRead =
    canViewStorefrontFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:view", legacyCtx) ||
    canManage ||
    canPublish ||
    canManageMedia;

  return { actor, canRead, canManage, canPublish, canManageMedia };
}

export function storefrontReadDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront",
    description: "You do not have permission to view storefront settings in this workspace.",
    primaryHref: "/dashboard/today",
    primaryLabel: "Back to Today",
  });
}

export async function requireStorefrontReadPage(input?: {
  operation?: string;
  route?: string;
}): Promise<
  | ({ ok: true } & StorefrontHubAccess)
  | { ok: false; deny: ReactNode }
> {
  const hub = await resolveStorefrontHubAccess();
  if (!hub.canRead) {
    await logStorefrontPermissionDenied(hub.actor, {
      requiredPermission: "storefront.read",
      operation: input?.operation ?? "storefront.page.read",
      metadata: input?.route ? { route: input.route } : undefined,
    });
    return { ok: false, deny: storefrontReadDeniedCard() };
  }
  return { ok: true, ...hub };
}

export async function resolveStorefrontManageAccess(userId: string, email: string | null) {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(userId);
  const canManage =
    canManageStorefrontDraftFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:edit-draft", {
      email,
      workspaceGranted: actor.granted,
      platformBypass: actor.platformBypass,
    });
  return { actor, canManage };
}

export async function resolveStorefrontPublishAccess(userId: string, email: string | null) {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(userId);
  const canPublish =
    canPublishStorefrontFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:publish", {
      email,
      workspaceGranted: actor.granted,
      platformBypass: actor.platformBypass,
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
      platformBypass: actor.platformBypass,
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

export function storefrontManageDeniedCard(): ReactNode {
  return createElement(PosAccessCard, {
    title: "Storefront editor",
    description:
      "You do not have permission to edit storefront pages, navigation, footer, or business settings in this workspace.",
    primaryHref: "/dashboard/storefront",
    primaryLabel: "Storefront overview",
  });
}

export async function requireStorefrontManagePage(input?: {
  operation?: string;
  route?: string;
}): Promise<
  | { ok: true; actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>; canManage: true }
  | { ok: false; deny: ReactNode }
> {
  const actor = await requireWorkspacePermissionActor();
  const { permissions } = await getStorefrontPermissionSetForUser(actor.sessionUserId);
  const canManage =
    canManageStorefrontDraftFromGranted(actor.granted) ||
    canStorefront(permissions, "storefront:edit-draft", {
      email: actor.email,
      workspaceGranted: actor.granted,
      platformBypass: actor.platformBypass,
    });
  if (!canManage) {
    await logStorefrontPermissionDenied(actor, {
      requiredPermission: "storefront.manage",
      operation: input?.operation ?? "storefront.page.manage",
      metadata: input?.route ? { route: input.route } : undefined,
    });
    return { ok: false, deny: storefrontManageDeniedCard() };
  }
  return { ok: true, actor, canManage: true };
}
