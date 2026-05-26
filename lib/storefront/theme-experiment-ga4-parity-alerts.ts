import { logger } from "@/lib/logger";
import { resolveGa4ParityWebhookEnvKey } from "@/lib/storefront/experiment-webhook-routing";
import { pagerDutyCustomDetailsWithRunbooks } from "@/lib/storefront/experiment-runbook-links";
import { createExperimentTraceId } from "@/lib/storefront/experiment-trace";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";

export function logGa4ParityDrift(input: {
  storeSlug: string;
  storefrontId: string;
  days: number;
  score: Ga4ParityScore;
  streakCount: number;
}) {
  logger.warn("storefront_ga4_parity_drift", {
    alert_type: "storefront_ga4_parity_drift",
    severity: "warning",
    component: "theme_experiment",
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    days: input.days,
    parityScorePp: input.score.parityScorePp,
    firstPartyLiftPp: input.score.firstPartyLiftPp,
    ga4LiftPp: input.score.ga4LiftPp,
    streakCount: input.streakCount,
    headline: input.score.headline,
  });
}

export async function notifyGa4ParityDrift(input: {
  storeSlug: string;
  storefrontId: string;
  workspaceId?: string | null;
  days: number;
  score: Ga4ParityScore;
  streakCount: number;
}): Promise<void> {
  logGa4ParityDrift(input);

  const parsed = parseDlqWebhookUrl(resolveGa4ParityWebhookEnvKey(input.workspaceId));
  if (parsed.ok) {
    const body = {
      text: `:bar_chart: *GA4 parity drift* — \`${input.storeSlug}\` (${input.streakCount} cycles)\n${input.score.headline}\n${input.score.detail}`,
      alert_type: "storefront_ga4_parity_drift",
      storeSlug: input.storeSlug,
      storefrontId: input.storefrontId,
      parityScorePp: input.score.parityScorePp,
      firstPartyLiftPp: input.score.firstPartyLiftPp,
      ga4LiftPp: input.score.ga4LiftPp,
      streakCount: input.streakCount,
    };
    try {
      const res = await fetch(parsed.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        logger.warn("ga4_parity_webhook_failed", { status: res.status, storeSlug: input.storeSlug });
      }
    } catch (e) {
      logger.warn("ga4_parity_webhook_error", { error: String(e), storeSlug: input.storeSlug });
    }
  }

  const traceId = createExperimentTraceId();
  void sendPagerDutyEvent({
    severity: "warning",
    summary: `GA4 parity drift: ${input.storeSlug} (Δ${input.score.parityScorePp ?? "?"} pp, ${input.streakCount} cycles)`,
    source: "theme_experiment_ga4_parity",
    dedupKey: `ga4-parity-drift-${input.storefrontId}`,
    customDetails: pagerDutyCustomDetailsWithRunbooks(
      input.storeSlug,
      {
        parityScorePp: input.score.parityScorePp,
        firstPartyLiftPp: input.score.firstPartyLiftPp,
        ga4LiftPp: input.score.ga4LiftPp,
        streakCount: input.streakCount,
        days: input.days,
      },
      traceId,
    ),
  });
}
