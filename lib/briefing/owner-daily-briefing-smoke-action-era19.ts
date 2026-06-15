import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type {
  OwnerDailyBriefingRiskSignal,
} from "@/lib/briefing/owner-daily-briefing-risk-radar-era19";
import type { OwnerDailyBriefingRiskCategory } from "@/lib/briefing/owner-daily-briefing-risk-radar-era19-policy";
import { OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL } from "@/lib/briefing/owner-daily-briefing-risk-radar-era19-policy";
import {
  BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
  OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
export {
  BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
  OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
import type { IntegrationHealthSmokeNextAction } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";
import type { IntegrationHealthSmokeDisplayStatus } from "@/lib/integrations/integration-health-smoke-artifacts-era19";

export const OWNER_DAILY_BRIEFING_SMOKE_ACTION_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-smoke-action-aggregator-v1" as const;

const ROW_TO_RISK_SIGNAL_ID: Record<string, string> = {
  "p0-staging-proof-unblock": "risk-p0-staging-proof",
  "channel-live-smoke": "risk-channel-live-smoke",
  "staging-workflows-first-green": "risk-staging-workflows-smoke",
};

export function resolveBriefingSmokeActionRiskCategory(
  rowId: string,
): OwnerDailyBriefingRiskCategory {
  if (rowId === "channel-live-smoke") return "live_smoke";
  if (rowId === "staging-workflows-first-green") return "p0_proof";
  return "p0_proof";
}

function smokeActionSeverity(
  status: IntegrationHealthSmokeDisplayStatus,
): OwnerDailyBriefingRiskSignal["severity"] {
  if (status === "FAILED") return "critical";
  if (status === "SKIPPED WITH REASON" || status === "MISSING") return "high";
  return "normal";
}

function smokeActionPriority(
  status: IntegrationHealthSmokeDisplayStatus,
  rowId: string,
): number {
  if (status === "FAILED") return rowId === "p0-staging-proof-unblock" ? 1 : 2;
  if (rowId === "p0-staging-proof-unblock") return 2;
  if (rowId === "channel-live-smoke") return 3;
  return 4;
}

export function buildBriefingSmokeNextActionRiskSignal(
  action: IntegrationHealthSmokeNextAction,
): OwnerDailyBriefingRiskSignal {
  const category = resolveBriefingSmokeActionRiskCategory(action.rowId);

  return {
    id: "risk-next-engineering-smoke",
    category,
    categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL[category],
    title: `Next smoke — ${action.label}`,
    detail: `${action.reason} Run: ${action.smokeScript}`,
    href: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
    severity: smokeActionSeverity(action.displayStatus),
    statusLabel: action.displayStatus,
    honestNote: "SKIPPED WITH REASON is not PASS — see Integration Health artifacts.",
    priority: smokeActionPriority(action.displayStatus, action.rowId),
    smokeScript: action.smokeScript,
  };
}

export function buildBriefingSmokeNextActionRankedAction(
  action: IntegrationHealthSmokeNextAction,
): OwnerDailyBriefingRankedAction {
  const severity = smokeActionSeverity(action.displayStatus);

  return {
    id: `briefing-smoke-${action.rowId}`,
    title: `Run ${action.label} smoke`,
    reason: action.reason,
    severity: severity === "critical" ? "critical" : severity === "high" ? "high" : "normal",
    ownerRole: "owner",
    href: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
    status: action.displayStatus === "FAILED" ? "open" : "monitor",
    unblockCondition: "Engineering smoke artifact reports PASS — never upgrade SKIPPED to GO.",
    priority: smokeActionPriority(action.displayStatus, action.rowId),
    ctaLabel: "Open smoke proof",
    tone: severity === "critical" || severity === "high" ? "urgent" : "normal",
  };
}

export function enrichBriefingRiskSignalsWithSmokeNextAction(
  signals: readonly OwnerDailyBriefingRiskSignal[],
  nextAction: IntegrationHealthSmokeNextAction | null,
): OwnerDailyBriefingRiskSignal[] {
  if (!nextAction) return [...signals];

  const linkedSignalId = ROW_TO_RISK_SIGNAL_ID[nextAction.rowId];
  let enriched = false;

  const merged = signals.map((signal) => {
    if (linkedSignalId && signal.id === linkedSignalId) {
      enriched = true;
      return {
        ...signal,
        href: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
        smokeScript: nextAction.smokeScript,
        detail: `${signal.detail} Next script: ${nextAction.smokeScript}`,
        honestNote:
          signal.honestNote ??
          "Open Integration Health for child proofs and missing env var detail.",
      };
    }
    return signal;
  });

  if (enriched) return merged;

  const smokeSignal = buildBriefingSmokeNextActionRiskSignal(nextAction);
  return [smokeSignal, ...merged];
}

export function mergeBriefingSmokeNextTopActions(
  smokeAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!smokeAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [smokeAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingSmokeActionPolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID;
  href: typeof BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_SMOKE_ACTION_ERA19_POLICY_ID,
    href: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
  };
}
