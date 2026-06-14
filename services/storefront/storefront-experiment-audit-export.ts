import { csvEscapeCell } from "@/lib/audit/audit-formatters";
import { prisma } from "@/lib/prisma";

const EXPERIMENT_ACTION_PREFIX = "storefront.experiment.";

export async function exportStorefrontExperimentAuditCsv(input: {
  storefrontId: string;
  storeSlug: string;
  days?: number;
}): Promise<{ body: string; rowCount: number }> {
  const days = Math.min(90, Math.max(1, input.days ?? 90));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await prisma.auditLog.findMany({
    where: {
      action: { startsWith: EXPERIMENT_ACTION_PREFIX },
      createdAt: { gte: since },
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
    take: 5000,
    select: {
      id: true,
      createdAt: true,
      action: true,
      severity: true,
      source: true,
      actorEmail: true,
      entityType: true,
      entityId: true,
      metadataJson: true,
    },
  });

  const headers = [
    "id",
    "createdAt",
    "action",
    "severity",
    "source",
    "actorEmail",
    "entityType",
    "entityId",
    "metadataJson",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscapeCell(r.id),
        csvEscapeCell(r.createdAt.toISOString()),
        csvEscapeCell(r.action),
        csvEscapeCell(r.severity ?? ""),
        csvEscapeCell(r.source ?? ""),
        csvEscapeCell(r.actorEmail ?? ""),
        csvEscapeCell(r.entityType),
        csvEscapeCell(r.entityId ?? ""),
        csvEscapeCell(r.metadataJson ? JSON.stringify(r.metadataJson) : ""),
      ].join(","),
    );
  }

  return { body: lines.join("\n"), rowCount: rows.length };
}
