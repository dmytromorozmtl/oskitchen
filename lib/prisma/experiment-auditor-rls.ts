import { redactAuditorMetadata } from "@/lib/auth/experiment-auditor-redact";
import { prisma } from "@/lib/prisma";

export { redactAuditorMetadata };

/**
 * Auditor-scoped audit event query (application-level RLS).
 * Postgres RLS policy SQL: prisma/sql/experiment-auditor-rls.sql
 */
export async function listAuditorScopedExperimentAuditEvents(input: {
  storefrontId?: string;
  limit?: number;
}) {
  const rows = await prisma.storefrontExperimentAuditEvent.findMany({
    where: input.storefrontId ? { storefrontId: input.storefrontId } : undefined,
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 50,
    select: {
      id: true,
      storefrontId: true,
      action: true,
      severity: true,
      source: true,
      createdAt: true,
      metadataJson: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    storefrontId: r.storefrontId,
    action: r.action,
    severity: r.severity,
    source: r.source,
    createdAt: r.createdAt,
    metadata: redactAuditorMetadata(
      r.metadataJson && typeof r.metadataJson === "object" && !Array.isArray(r.metadataJson)
        ? (r.metadataJson as Record<string, unknown>)
        : null,
    ),
  }));
}
