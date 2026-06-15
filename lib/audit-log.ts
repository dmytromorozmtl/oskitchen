import type { Prisma } from "@prisma/client";

import { auditLogLegacyCompat } from "@/services/audit/audit-service";

export async function recordAuditLog(input: {
  organizationId?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await auditLogLegacyCompat(input);
}
