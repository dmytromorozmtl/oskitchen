import type { Prisma } from "@prisma/client";

import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import type { OwnerScopeActor } from "@/lib/scope/tenant-scope";

/**
 * AND-merge tenant scope into a Prisma `where` clause.
 * Use for service-layer `findMany` / `findFirst` during workspace migration.
 */
export function withWorkspaceScope<T extends Prisma.OrderWhereInput>(
  actor: OwnerScopeActor,
  where: T,
): Prisma.OrderWhereInput {
  return {
    AND: [buildOwnerScopedWhere(actor.userId, actor.workspaceId), where],
  } as Prisma.OrderWhereInput;
}

/** Generic AND merge when the model uses the same owner/workspace columns as Order. */
export function withOwnerWorkspaceAnd<T extends Record<string, unknown>>(
  actor: OwnerScopeActor,
  where: T,
): { AND: [ReturnType<typeof buildOwnerScopedWhere>, T] } {
  return {
    AND: [buildOwnerScopedWhere(actor.userId, actor.workspaceId), where],
  };
}
