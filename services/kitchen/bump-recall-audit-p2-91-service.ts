import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import {
  aggregateBumpRecallReport,
  parseBumpRecallAuditRow,
  type BumpRecallAuditReport,
} from "@/lib/kitchen/bump-recall-audit-p2-91-operations";
import { BUMP_RECALL_AUDIT_POLICY_ID } from "@/lib/kitchen/bump-recall-audit-p2-91-policy";
import { prisma } from "@/lib/prisma";
import { buildAuditWhere, type AuditWorkspaceScope } from "@/services/audit/audit-query-service";

export type BumpRecallAuditSnapshot = BumpRecallAuditReport & {
  policyId: typeof BUMP_RECALL_AUDIT_POLICY_ID;
  lookbackDays: number;
  eventCount: number;
};

async function buildScopeForOwner(userId: string): Promise<AuditWorkspaceScope> {
  const workspaces = await prisma.workspace.findMany({
    where: { ownerUserId: userId },
    select: { id: true },
  });
  return {
    userId,
    email: null,
    role: null,
    ownedWorkspaceIds: workspaces.map((workspace) => workspace.id),
  };
}

export async function loadBumpRecallAuditSnapshot(
  userId: string,
  lookbackDays = 7,
): Promise<BumpRecallAuditSnapshot> {
  const scope = await buildScopeForOwner(userId);
  const from = new Date();
  from.setDate(from.getDate() - lookbackDays);

  const where = buildAuditWhere(scope, { from });
  const rows = await prisma.auditLog.findMany({
    where: {
      AND: [
        where,
        {
          action: {
            in: [AUDIT_ACTIONS.KITCHEN_ORDER_BUMPED, AUDIT_ACTIONS.KITCHEN_ORDER_RECALLED],
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      action: true,
      entityId: true,
      userId: true,
      actorEmail: true,
      actorRole: true,
      createdAt: true,
      metadataJson: true,
    },
  });

  const events = rows
    .map((row) => parseBumpRecallAuditRow(row))
    .filter((event): event is NonNullable<typeof event> => event !== null);

  const report = aggregateBumpRecallReport(events);

  return {
    policyId: BUMP_RECALL_AUDIT_POLICY_ID,
    lookbackDays,
    eventCount: events.length,
    ...report,
  };
}
