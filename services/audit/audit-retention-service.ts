import { clampRetentionDays, DEFAULT_AUDIT_RETENTION_DAYS } from "@/lib/audit/audit-retention";
import { prisma } from "@/lib/prisma";

export { clampRetentionDays, DEFAULT_AUDIT_RETENTION_DAYS } from "@/lib/audit/audit-retention";

export async function loadAuditRetentionPolicy(workspaceId: string) {
  return prisma.auditRetentionPolicy.findUnique({ where: { workspaceId } });
}
