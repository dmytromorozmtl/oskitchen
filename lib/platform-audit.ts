import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";

export type PlatformAuditPayload = Record<string, unknown>;

/** Inserts an audit row for internal `/platform/*` actions (category PLATFORM). */
export async function recordPlatformAudit(input: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  /** Target workspace for cross-tenant context (optional). */
  targetWorkspaceId?: string | null;
  metadata?: PlatformAuditPayload;
}): Promise<void> {
  const adminWorkspace = await prisma.workspace.findFirst({
    where: { ownerUserId: input.adminUserId },
    select: { id: true },
  });
  const workspaceId = input.targetWorkspaceId ?? adminWorkspace?.id ?? null;
  await auditLog({
    workspaceId,
    organizationId: null,
    actor: { userId: input.adminUserId },
    action: input.action,
    category: "PLATFORM",
    source: "SUPERADMIN",
    severity: "NOTICE",
    entity: { type: input.entityType, id: input.entityId ?? null },
    metadata: input.metadata,
  });
}
