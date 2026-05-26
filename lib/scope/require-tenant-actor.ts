import { requireSessionUser } from "@/lib/auth";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import { revalidateTenantActor } from "@/lib/scope/revalidate-tenant-actor";

export { revalidateTenantActor };

export type TenantActor = {
  /** Authenticated Supabase/session user. */
  sessionUser: Awaited<ReturnType<typeof requireSessionUser>>;
  /** Same as `sessionUser.id`. */
  sessionUserId: string;
  /** Kitchen owner id for user-scoped Prisma rows (orders, settings, menus). */
  userId: string;
  /** @deprecated Prefer `userId` — alias kept during workspace migration. */
  dataUserId: string;
  /** Primary workspace for the owner, when provisioned. */
  workspaceId: string | null;
};

/** Session + resolved tenant owner + workspace (workspace member → owner). */
export async function requireTenantActor(): Promise<TenantActor> {
  const sessionUser = await requireSessionUser();
  const dataUserId = await resolveTenantDataUserId(sessionUser.id);
  const workspaceId = await resolveOwnerWorkspaceId(dataUserId);
  return {
    sessionUser,
    sessionUserId: sessionUser.id,
    userId: dataUserId,
    dataUserId,
    workspaceId,
  };
}
