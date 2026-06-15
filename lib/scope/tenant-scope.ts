import type { Prisma } from "@prisma/client";

import { requireSessionUser } from "@/lib/auth";
import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import {
  assertUserCanAccessWorkspace,
  WorkspaceAccessDeniedError,
} from "@/lib/scope/assert-user-workspace-access";

export { WorkspaceAccessDeniedError };

export type TenantScope = {
  userId: string;
  workspaceId: string | null;
};

/** Default list/query cap for service-layer `findMany` (override per call when aggregating). */
export const SERVICE_DEFAULT_TAKE = 50;

/** Hard ceiling for dashboard aggregation queries. */
export const SERVICE_AGGREGATION_TAKE = 2_000;

export type OwnerScopeActor = {
  userId: string;
  workspaceId: string | null;
};

/** Prefer workspace filter when available; always includes owner `userId` for legacy rows. */
export function prismaOwnerScopeWhere(actor: OwnerScopeActor): Prisma.OrderWhereInput {
  return buildOwnerScopedWhere(actor.userId, actor.workspaceId) as Prisma.OrderWhereInput;
}

/** Session user plus optional active workspace (validated when provided). */
export async function requireTenantScope(workspaceId?: string | null): Promise<TenantScope> {
  const user = await requireSessionUser();
  const ws = workspaceId ?? null;
  if (ws) {
    await requireWorkspaceAccess(user.id, ws);
  }
  return { userId: user.id, workspaceId: ws };
}

export async function requireWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
  await assertUserCanAccessWorkspace(userId, workspaceId);
}

/** `findFirst` filter: match id and tenant (workspace preferred when scoped). */
export function scopedIdWhere(
  scope: TenantScope,
  id: string,
): { id: string; userId?: string; workspaceId?: string } {
  if (scope.workspaceId) {
    return { id, workspaceId: scope.workspaceId };
  }
  return { id, userId: scope.userId };
}

/** Broad list filter for user-owned or workspace-owned rows. */
export function scopedWhereByUserOrWorkspace(
  scope: TenantScope,
): Prisma.StorefrontSettingsWhereInput {
  if (scope.workspaceId) {
    return {
      OR: [{ userId: scope.userId }, { workspaceId: scope.workspaceId }],
    };
  }
  return { userId: scope.userId };
}

/** Throws when resource tenant does not match scope. */
export function assertResourceBelongsToUserOrWorkspace(
  scope: TenantScope,
  resource: { userId: string; workspaceId?: string | null },
): void {
  if (scope.workspaceId && resource.workspaceId) {
    if (resource.workspaceId !== scope.workspaceId) {
      throw new WorkspaceAccessDeniedError();
    }
    return;
  }
  if (resource.userId !== scope.userId) {
    throw new WorkspaceAccessDeniedError();
  }
}
