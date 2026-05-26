import { cache } from "react";
import { unstable_cache } from "next/cache";

import { requireSessionUser } from "@/lib/auth";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import { tenantActorCacheTag } from "@/lib/scope/tenant-cache-tags";
import type { TenantActor } from "@/lib/scope/require-tenant-actor";

async function resolveTenantScope(sessionUserId: string): Promise<{
  userId: string;
  workspaceId: string | null;
}> {
  return unstable_cache(
    async () => {
      const dataUserId = await resolveTenantDataUserId(sessionUserId);
      const workspaceId = await resolveOwnerWorkspaceId(dataUserId);
      return { userId: dataUserId, workspaceId };
    },
    ["tenant-scope", sessionUserId],
    { tags: [tenantActorCacheTag(sessionUserId)], revalidate: 120 },
  )();
}

/**
 * Per-request cached tenant actor for dashboard server components.
 * Owner `userId` / `workspaceId` also cached via `unstable_cache` + revalidateTag on workspace switch.
 */
export const getTenantActor = cache(async (): Promise<TenantActor> => {
  const sessionUser = await requireSessionUser();
  const scope = await resolveTenantScope(sessionUser.id);
  return {
    sessionUser,
    sessionUserId: sessionUser.id,
    userId: scope.userId,
    dataUserId: scope.userId,
    workspaceId: scope.workspaceId,
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
