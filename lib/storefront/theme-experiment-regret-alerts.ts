import { logger } from "@/lib/logger";
import { pagerDutyCustomDetailsWithRunbooks } from "@/lib/storefront/experiment-runbook-links";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { readOffPolicyEvaluation } from "@/lib/storefront/theme-experiment-off-policy";
import { readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";

export function regretAlertThresholdPp(): number {
  return Number(process.env.THEME_EXPERIMENT_REGRET_ALERT_PP ?? "5");
}

export async function notifyExperimentRegretBudgetExceeded(input: {
  storeSlug: string;
  storefrontId: string;
  workspaceId?: string | null;
  themeExperimentJson: unknown;
}): Promise<boolean> {
  const offPolicy = readOffPolicyEvaluation(input.themeExperimentJson);
  const linucb = readLinUcbSnapshot(input.themeExperimentJson);
  const regretPp = Math.max(
    offPolicy?.estimatedRegretPp ?? 0,
    linucb?.regretPp ?? 0,
  );
  const threshold = regretAlertThresholdPp();
  if (regretPp <= threshold) return false;

  logger.warn("storefront_experiment_regret_budget_exceeded", {
    alert_type: "storefront_experiment_regret_budget_exceeded",
    store_slug: input.storeSlug,
    regret_pp: regretPp,
    threshold_pp: threshold,
  });

  await sendPagerDutyEvent({
    severity: "warning",
    dedupKey: `experiment-regret-${input.storeSlug}`,
    summary: `Experiment regret ${regretPp}pp exceeds ${threshold}pp (${input.storeSlug})`,
    source: "kitchenos-experiment-linucb",
    customDetails: pagerDutyCustomDetailsWithRunbooks(input.storeSlug, {
      storefront_id: input.storefrontId,
      regret_pp: regretPp,
      threshold_pp: threshold,
      off_policy_ips: offPolicy?.ipsLiftPp ?? null,
      linucb_exploration: linucb?.explorationPercent ?? null,
    }),
  });

  return true;
}
