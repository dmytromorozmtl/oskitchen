import { logger } from "@/lib/logger";
import { resolveSrmWarnWebhookEnvKey } from "@/lib/storefront/experiment-webhook-routing";
import { pagerDutyCustomDetailsWithRunbooks } from "@/lib/storefront/experiment-runbook-links";
import { createExperimentTraceId } from "@/lib/storefront/experiment-trace";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import type { ExperimentSrmCheck } from "@/lib/storefront/theme-experiment-srm";
import { parseDlqWebhookUrl } from "@/lib/storefront/validate-dlq-webhook-url";

export function logExperimentSrmWarn(input: {
  storeSlug: string;
  storefrontId: string;
  days: number;
  srm: ExperimentSrmCheck;
}) {
  if (!input.srm.warn) return;

  logger.warn("storefront_experiment_srm_warn", {
    alert_type: "storefront_experiment_srm_warn",
    severity: "warning",
    component: "theme_experiment",
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    days: input.days,
    deltaPp: input.srm.deltaPp,
    observedDraftPercent: input.srm.observedDraftPercent,
    configuredDraftPercent: input.srm.configuredDraftPercent,
    totalExposures: input.srm.totalExposures,
    headline: input.srm.headline,
  });
}

export async function notifyExperimentSrmWarn(input: {
  storeSlug: string;
  storefrontId: string;
  workspaceId?: string | null;
  days: number;
  srm: ExperimentSrmCheck;
}): Promise<void> {
  if (!input.srm.warn) return;

  logExperimentSrmWarn({
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    days: input.days,
    srm: input.srm,
  });

  const parsed = parseDlqWebhookUrl(resolveSrmWarnWebhookEnvKey(input.workspaceId));
  if (!parsed.ok) return;

  const body = {
    text: `:warning: *Experiment traffic drift* — \`${input.storeSlug}\`\n${input.srm.headline}\n${input.srm.detail}`,
    alert_type: "storefront_experiment_srm_warn",
    storeSlug: input.storeSlug,
    storefrontId: input.storefrontId,
    days: input.days,
    deltaPp: input.srm.deltaPp,
    observedDraftPercent: input.srm.observedDraftPercent,
    configuredDraftPercent: input.srm.configuredDraftPercent,
    totalExposures: input.srm.totalExposures,
  };

  try {
    const res = await fetch(parsed.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      logger.warn("experiment_srm_webhook_failed", { status: res.status, storeSlug: input.storeSlug });
    }
  } catch (e) {
    logger.warn("experiment_srm_webhook_error", { error: String(e), storeSlug: input.storeSlug });
  }

  const traceId = createExperimentTraceId();
  void sendPagerDutyEvent({
    severity: "warning",
    summary: `Experiment SRM warn: ${input.storeSlug}`,
    source: "theme_experiment_srm",
    dedupKey: `experiment-srm-${input.storefrontId}`,
    customDetails: pagerDutyCustomDetailsWithRunbooks(
      input.storeSlug,
      {
        storeSlug: input.storeSlug,
        deltaPp: input.srm.deltaPp,
        observedDraftPercent: input.srm.observedDraftPercent,
        configuredDraftPercent: input.srm.configuredDraftPercent,
        totalExposures: input.srm.totalExposures,
      },
      traceId,
    ),
  });
}
