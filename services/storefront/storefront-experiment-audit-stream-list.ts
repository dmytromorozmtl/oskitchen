import { prisma } from "@/lib/prisma";

export type ExperimentAuditStreamRow = {
  id: string;
  action: string;
  severity: string | null;
  source: string | null;
  actorEmail: string | null;
  createdAt: Date;
  metadataJson: unknown;
};

export async function listStorefrontExperimentAuditStream(input: {
  storefrontId: string;
  limit?: number;
}): Promise<ExperimentAuditStreamRow[]> {
  const limit = Math.min(100, Math.max(1, input.limit ?? 50));
  return prisma.storefrontExperimentAuditEvent.findMany({
    where: { storefrontId: input.storefrontId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      severity: true,
      source: true,
      actorEmail: true,
      createdAt: true,
      metadataJson: true,
    },
  });
}
