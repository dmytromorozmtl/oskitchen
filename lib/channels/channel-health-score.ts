import type { IntegrationConnection } from "@prisma/client";

import type { ChannelStatusType } from "@/lib/channels/channel-types";

/** 0–100 aggregate for workspace channel posture (heuristic, not a vendor SLA). */
export function workspaceChannelHealthScore(input: {
  connections: IntegrationConnection[];
  resolved: { effectiveStatus: ChannelStatusType }[];
  webhookFailures: number;
  failedExternalImports: number;
  unmatchedProducts: number;
}): number {
  let score = 100;
  const errConns = input.connections.filter((c) => c.status === "ERROR").length;
  score -= Math.min(30, errConns * 12);
  score -= Math.min(25, input.webhookFailures * 3);
  score -= Math.min(20, input.failedExternalImports * 4);
  score -= Math.min(15, Math.min(50, input.unmatchedProducts) / 3);

  const needsCreds = input.resolved.filter((r) => r.effectiveStatus === "NEEDS_CREDENTIALS").length;
  score -= Math.min(15, needsCreds * 5);

  return Math.max(0, Math.round(score));
}
