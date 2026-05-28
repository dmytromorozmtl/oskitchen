import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  formatCommercialPilotOpsDecisionLabel,
  resolveCommercialPilotOpsDecision,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type {
  ImplementationPilotReadinessAttentionItem,
  ImplementationPilotReadinessModel,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import {
  IMPLEMENTATION_GO_LIVE_ROUTE,
  IMPLEMENTATION_PILOT_READINESS_ROUTE,
} from "@/lib/implementation/implementation-pilot-readiness-focus-era18-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import type { GettingStartedPilotSsoFocus } from "@/lib/onboarding/getting-started-pilot-sso-era18";

export const OWNER_DAILY_BRIEFING_PILOT_READINESS_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-pilot-readiness-v1" as const;

export type OwnerDailyBriefingPilotReadinessLaneItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "urgent" | "normal";
  category: ImplementationPilotReadinessAttentionItem["category"] | "commercial";
};

export type OwnerDailyBriefingPilotReadinessSlice = {
  hubHref: string;
  headline: string;
  totalSignals: number;
  hasUrgent: boolean;
  allClear: boolean;
  ssoLabel: string;
  ssoTone: "success" | "attention" | "neutral";
  channelIncompleteCount: number;
  goLiveBlockerCount: number;
  commercialDecisionLabel: string | null;
  p0ProofStatusLabel: string | null;
  attentionItems: OwnerDailyBriefingPilotReadinessLaneItem[];
};

export function resolvePilotReadinessSsoLabel(focus: GettingStartedPilotSsoFocus): {
  label: string;
  tone: "success" | "attention" | "neutral";
} {
  if (!focus.entitlementEnabled) {
    return { label: "SSO not entitled", tone: "neutral" };
  }
  if (focus.active) {
    return { label: "SSO pilot active", tone: "success" };
  }
  if (focus.configured) {
    return { label: "SSO configured — activation pending", tone: "attention" };
  }
  if (focus.ssoSetupIncomplete) {
    return { label: "SSO pilot setup incomplete", tone: "attention" };
  }
  return { label: "SSO not configured", tone: "neutral" };
}

export function countPilotReadinessGoLiveBlockers(
  model: ImplementationPilotReadinessModel,
): number {
  if (!model.goLive.validation) return 0;
  return model.goLive.validation.blockers.filter(
    (blocker) => blocker.severity === "CRITICAL" || blocker.severity === "HIGH_RISK",
  ).length;
}

function commercialOpsLaneItems(
  ops: CommercialPilotOpsStatusModel | null | undefined,
): OwnerDailyBriefingPilotReadinessLaneItem[] {
  if (!ops) return [];

  const items: OwnerDailyBriefingPilotReadinessLaneItem[] = [];
  const decision = resolveCommercialPilotOpsDecision(ops.goNoGo);

  if (decision !== "GO") {
    items.push({
      id: "commercial-gono-go",
      title: formatCommercialPilotOpsDecisionLabel(decision),
      detail:
        decision === "NO-GO"
          ? `${ops.goNoGo.summary?.blockers.length ?? 0} commercial blocker(s) — resolve evidence gates before paid pilot cutover.`
          : "Run smoke:pilot-gono-go — never assume GO without the summary artifact.",
      href: IMPLEMENTATION_PILOT_READINESS_ROUTE,
      tone: "urgent",
      category: "commercial",
    });
  }

  const p0 = ops.p0Staging.summary;
  if (p0 && p0.p0ProofStatus !== "proof_passed") {
    items.push({
      id: "commercial-p0-staging",
      title: `P0 staging proof — ${p0.p0ProofStatus.replaceAll("_", " ")}`,
      detail:
        p0.allMissingEnvVars.length > 0
          ? `${p0.allMissingEnvVars.length} ops env var(s) missing — engineering proof still blocked.`
          : "SSO IdP, GitHub first-green, or channel live smoke incomplete.",
      href: IMPLEMENTATION_PILOT_READINESS_ROUTE,
      tone: "urgent",
      category: "commercial",
    });
  }

  return items;
}

export function buildOwnerDailyBriefingPilotReadinessSlice(input: {
  model: ImplementationPilotReadinessModel;
  attentionItems: readonly ImplementationPilotReadinessAttentionItem[];
  commercialOps?: CommercialPilotOpsStatusModel | null;
}): OwnerDailyBriefingPilotReadinessSlice {
  const sso = resolvePilotReadinessSsoLabel(input.model.pilotSso);
  const goLiveBlockerCount = countPilotReadinessGoLiveBlockers(input.model);
  const channelIncompleteCount = input.attentionItems.filter(
    (item) => item.category === "channel",
  ).length;

  const workspaceItems: OwnerDailyBriefingPilotReadinessLaneItem[] = input.attentionItems
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      href: item.href,
      tone: item.tone,
      category: item.category,
    }));

  const commercialItems = commercialOpsLaneItems(input.commercialOps);
  const attentionItems = [...commercialItems, ...workspaceItems].slice(0, 5);

  const totalSignals = attentionItems.length;
  const hasUrgent = attentionItems.some((item) => item.tone === "urgent");
  const allClear = totalSignals === 0;

  const hubHref = LAUNCH_WIZARD_ROUTE;

  let headline: string;
  if (allClear) {
    headline =
      "Workspace pilot signals look clear — confirm commercial GO/NO-GO before contract cutover.";
  } else if (hasUrgent) {
    headline =
      "Pilot cutover blockers open — resolve channel, SSO, launch validation, or commercial proof gaps.";
  } else {
    headline = `${totalSignals} pilot readiness signal(s) — complete before paid pilot traffic.`;
  }

  const decision = input.commercialOps
    ? resolveCommercialPilotOpsDecision(input.commercialOps.goNoGo)
    : null;
  const commercialDecisionLabel =
    decision && decision !== "GO" ? formatCommercialPilotOpsDecisionLabel(decision) : null;

  const p0Status = input.commercialOps?.p0Staging.summary?.p0ProofStatus ?? null;
  const p0ProofStatusLabel =
    p0Status && p0Status !== "proof_passed"
      ? p0Status.replaceAll("_", " ")
      : null;

  return {
    hubHref,
    headline,
    totalSignals,
    hasUrgent,
    allClear,
    ssoLabel: sso.label,
    ssoTone: sso.tone,
    channelIncompleteCount,
    goLiveBlockerCount,
    commercialDecisionLabel,
    p0ProofStatusLabel,
    attentionItems,
  };
}

export function pilotReadinessHubFallbackHref(
  model: ImplementationPilotReadinessModel,
): string {
  return model.goLive.projectId
    ? `/dashboard/go-live/projects/${model.goLive.projectId}`
    : IMPLEMENTATION_GO_LIVE_ROUTE;
}
