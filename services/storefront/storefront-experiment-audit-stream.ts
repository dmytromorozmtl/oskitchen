import { prisma } from "@/lib/prisma";

const EXPERIMENT_ACTION_PREFIX = "storefront.experiment.";

export function isStorefrontExperimentAuditAction(action: string): boolean {
  return action.startsWith(EXPERIMENT_ACTION_PREFIX);
}

/** Dual-write append-only stream for compliance (immutable in application code). */
export async function appendStorefrontExperimentAuditEvent(input: {
  storefrontId: string;
  action: string;
  severity?: string | null;
  source?: string | null;
  actorEmail?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  if (!isStorefrontExperimentAuditAction(input.action)) return;
  if (!input.storefrontId) return;

  try {
    await prisma.storefrontExperimentAuditEvent.create({
      data: {
        storefrontId: input.storefrontId,
        action: input.action.slice(0, 120),
        severity: input.severity?.slice(0, 20) ?? null,
        source: input.source?.slice(0, 40) ?? null,
        actorEmail: input.actorEmail?.slice(0, 255) ?? null,
        metadataJson: input.metadata ? (input.metadata as object) : undefined,
      },
    });
  } catch (e) {
    const { logger } = await import("@/lib/logger");
    logger.warn("experiment_audit_stream_write_failed", {
      action: input.action,
      error: String(e),
    });
  }
}
