import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { requireAuditCenterViewAccess } from "@/lib/audit/require-audit-center-mutation-access";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";
import type { AuditWorkspaceScope } from "@/services/audit/audit-query-service";

/** Session-scoped workspaces the actor may query in Audit Center. */
export async function resolveAuditWorkspaceScope(): Promise<AuditWorkspaceScope | null> {
  const viewAccess = await requireAuditCenterViewAccess();
  if (!viewAccess.ok) return null;

  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { email: true, role: true },
  });
  const email = profile?.email ?? user.email ?? null;
  const role = profile?.role ?? null;
  const platformBypass = await hasSuperAdminRoleRow(user.id);
  const workspaces = await prisma.workspace.findMany({
    where: { ownerUserId: dataUserId },
    select: { id: true },
  });

  return {
    userId: dataUserId,
    email,
    role,
    ownedWorkspaceIds: workspaces.map((w) => w.id),
    platformBypass,
  };
}
