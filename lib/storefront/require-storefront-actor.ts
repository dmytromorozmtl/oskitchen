import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  canStorefront,
  type StorefrontPermission,
} from "@/lib/storefront/storefront-permissions";
import { logStorefrontPermissionDenied } from "@/services/storefront/storefront-permission-audit";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";

const LEGACY_BY_CANONICAL: Partial<Record<PermissionKey, StorefrontPermission>> = {
  "storefront.publish": "storefront:publish",
  "storefront.media.manage": "storefront:upload-assets",
};

async function legacyStorefrontAllows(
  actor: WorkspacePermissionActor,
  requiredPermission: PermissionKey,
): Promise<boolean> {
  const legacyKey = LEGACY_BY_CANONICAL[requiredPermission];
  if (!legacyKey) return false;
  const { permissions, email } = await getStorefrontPermissionSetForUser(actor.sessionUserId);
  return canStorefront(permissions, legacyKey, {
    email,
    workspaceGranted: actor.granted,
  });
}

async function requireStorefrontPermission(
  requiredPermission: PermissionKey,
  input?: {
    operation?: string;
    metadata?: Record<string, unknown>;
  },
):
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string } {
  const access = await requireMutationPermission(requiredPermission);
  if (access.ok) {
    return { ok: true, actor: access.actor };
  }
  if (access.actor && (await legacyStorefrontAllows(access.actor, requiredPermission))) {
    return { ok: true, actor: access.actor };
  }
  await logStorefrontPermissionDenied(access.actor, {
    requiredPermission,
    operation: input?.operation ?? requiredPermission,
    metadata: input?.metadata,
  });
  return { ok: false, error: access.error };
}

export async function requireStorefrontPublishActor(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}) {
  return requireStorefrontPermission("storefront.publish", {
    operation: input?.operation ?? "storefront.publish",
    metadata: input?.metadata,
  });
}

export async function requireStorefrontMediaActor(input?: {
  operation?: string;
  metadata?: Record<string, unknown>;
}) {
  return requireStorefrontPermission("storefront.media.manage", {
    operation: input?.operation ?? "storefront.media.manage",
    metadata: input?.metadata,
  });
}
