import { prisma } from "@/lib/prisma";

const EXPERIMENT_ACTION_PREFIX = "storefront.experiment.";

export type StorefrontExperimentAuditRow = {
  id: string;
  action: string;
  source: string | null;
  severity: string | null;
  actorEmail: string | null;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
};

export async function listStorefrontExperimentAuditEvents(input: {
  storefrontId: string;
  storeSlug: string;
  limit?: number;
}): Promise<StorefrontExperimentAuditRow[]> {
  const rows = await prisma.auditLog.findMany({
    where: {
      action: { startsWith: EXPERIMENT_ACTION_PREFIX },
      OR: [
        { entityId: input.storefrontId },
        {
          metadataJson: {
            path: ["storeSlug"],
            equals: input.storeSlug,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: input.limit ?? 20,
    select: {
      id: true,
      action: true,
      source: true,
      severity: true,
      actorEmail: true,
      createdAt: true,
      metadataJson: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    source: r.source,
    severity: r.severity,
    actorEmail: r.actorEmail,
    createdAt: r.createdAt,
    metadata:
      r.metadataJson && typeof r.metadataJson === "object" && !Array.isArray(r.metadataJson)
        ? (r.metadataJson as Record<string, unknown>)
        : null,
  }));
}
