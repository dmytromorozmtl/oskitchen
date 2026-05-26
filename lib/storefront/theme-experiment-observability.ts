import { logger } from "@/lib/logger";

export type { MiddlewareArmSource } from "@/lib/storefront/theme-experiment-observability-edge";
export {
  logThemeExperimentArmAssigned,
  logThemeExperimentObservability,
} from "@/lib/storefront/theme-experiment-observability-edge";

export function logEdgeSyncDlq(input: {
  jobId: string;
  storefrontId: string;
  storeSlug: string;
  workspaceId?: string | null;
  expectedVersion: number;
  attemptCount: number;
  lastError: string | null;
}) {
  /** Structured for Vercel Log Drain → Slack (filter: alert_type = storefront_edge_sync_dlq). */
  logger.error("storefront_edge_sync_dlq", {
    alert_type: "storefront_edge_sync_dlq",
    severity: "critical",
    ...input,
    component: "storefront_edge_sync",
  });
  void import("@/lib/storefront/storefront-experiment-audit").then(({ auditStorefrontExperimentEdgeDlq }) =>
    auditStorefrontExperimentEdgeDlq(input),
  );
  void (async () => {
    const { prisma } = await import("@/lib/prisma");
    const { notifyEdgeSyncDlq } = await import("@/lib/storefront/theme-experiment-edge-alerts");
    let workspaceId = input.workspaceId;
    if (!workspaceId) {
      const sf = await prisma.storefrontSettings.findUnique({
        where: { id: input.storefrontId },
        select: { workspaceId: true },
      });
      workspaceId = sf?.workspaceId ?? null;
    }
    await notifyEdgeSyncDlq({ ...input, workspaceId });
  })();
}
