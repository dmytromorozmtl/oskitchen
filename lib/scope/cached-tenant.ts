import { cache } from "react";

import { requireSessionUser } from "@/lib/auth";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import type { TenantActor } from "@/lib/scope/require-tenant-actor";

/**
 * Per-request cached tenant actor for dashboard server components.
 * Uses React `cache()` only — avoids cross-request `unstable_cache` stalls on serverless.
 */
export const getTenantActor = cache(async (): Promise<TenantActor> => {
  const sessionUser = await requireSessionUser();
  const userId = await resolveTenantDataUserId(sessionUser.id);
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return {
    sessionUser,
    sessionUserId: sessionUser.id,
    userId,
    dataUserId: userId,
    workspaceId,
  };
});

/** Shorthand for Prisma filters on user-owned rows. */
export async function getTenantDataUserId(): Promise<string> {
  const { userId } = await getTenantActor();
  return userId;
}

/** Primary workspace id for the resolved kitchen owner. */
export async function getTenantWorkspaceId(): Promise<string | null> {
  const { workspaceId } = await getTenantActor();
  return workspaceId;
}
