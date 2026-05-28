import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import {
  formatCommercialPilotOpsDecisionLabel,
  resolveCommercialPilotOpsDecision,
} from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { OwnerDailyBriefingIntegrationHealthSlice } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import type { OwnerDailyBriefingInput } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL,
  OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID,
  type OwnerDailyBriefingRiskCategory,
} from "@/lib/briefing/owner-daily-briefing-risk-radar-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import type { IntegrationHealthSmokeNextAction } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";
import { enrichBriefingRiskSignalsWithSmokeNextAction } from "@/lib/briefing/owner-daily-briefing-smoke-action-era19";
import { resolveBriefingIntegrationRecoveryHref } from "@/lib/briefing/owner-daily-briefing-integration-recovery-convergence-era19";
import { resolveBriefingOverdueProductionHref } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";
import type { TodayBlocker } from "@/services/today/today-command-center-service";

export const OWNER_DAILY_BRIEFING_RISK_RADAR_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-risk-radar-aggregator-v1" as const;

export type OwnerDailyBriefingRiskSeverity = "critical" | "high" | "normal";

export type OwnerDailyBriefingRiskSignal = {
  id: string;
  category: OwnerDailyBriefingRiskCategory;
  categoryLabel: string;
  title: string;
  detail: string;
  href: string;
  severity: OwnerDailyBriefingRiskSeverity;
  statusLabel: string;
  honestNote?: string;
  smokeScript?: string;
  priority: number;
};

export type OwnerDailyBriefingRiskRadarSlice = {
  policyId: typeof OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID;
  headline: string;
  criticalCount: number;
  highCount: number;
  totalSignals: number;
  allClear: boolean;
  signals: OwnerDailyBriefingRiskSignal[];
};

const MAX_RISK_SIGNALS = 8;

function severityRank(severity: OwnerDailyBriefingRiskSeverity): number {
  switch (severity) {
    case "critical":
      return 0;
    case "high":
      return 1;
    default:
      return 2;
  }
}

function pushUniqueSignal(
  signals: OwnerDailyBriefingRiskSignal[],
  seen: Set<string>,
  signal: OwnerDailyBriefingRiskSignal,
): void {
  if (seen.has(signal.id)) return;
  seen.add(signal.id);
  signals.push(signal);
}

function commercialRiskSignals(
  commercialOps: CommercialPilotOpsStatusModel | null | undefined,
): OwnerDailyBriefingRiskSignal[] {
  if (!commercialOps) return [];

  const signals: OwnerDailyBriefingRiskSignal[] = [];
  const decision = resolveCommercialPilotOpsDecision(commercialOps.goNoGo);

  if (decision !== "GO") {
    signals.push({
      id: "risk-commercial-gono-go",
      category: "commercial_gono_go",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.commercial_gono_go,
      title: formatCommercialPilotOpsDecisionLabel(decision),
      detail:
        decision === "NO-GO"
          ? `${commercialOps.goNoGo.summary?.blockers.length ?? 0} commercial evidence gate(s) open — not safe for paid pilot cutover.`
          : "Run smoke:pilot-gono-go and review the summary artifact — never assume GO.",
      href: LAUNCH_WIZARD_ROUTE,
      severity: decision === "NO-GO" ? "critical" : "high",
      statusLabel: decision,
      honestNote: "NO-GO is honest when blockers exist — never upgrade to GO without artifact.",
      priority: 1,
    });
  }

  const p0 = commercialOps.p0Staging.summary;
  if (p0 && p0.p0ProofStatus !== "proof_passed") {
    signals.push({
      id: "risk-p0-staging-proof",
      category: "p0_proof",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.p0_proof,
      title: `P0 staging proof — ${p0.p0ProofStatus.replaceAll("_", " ")}`,
      detail:
        p0.allMissingEnvVars.length > 0
          ? `${p0.allMissingEnvVars.length} ops env var(s) missing — engineering proof SKIPPED WITH REASON.`
          : "SSO IdP, GitHub first-green, or channel live smoke child proofs incomplete.",
      href: "/dashboard/integration-health#engineering-smoke-artifacts",
      severity: p0.p0ProofStatus === "proof_failed" ? "critical" : "high",
      statusLabel: p0.overall ?? "SKIPPED",
      honestNote: "SKIPPED is not PASS — supply ops credentials per era18 checklist.",
      priority: 2,
    });
  }

  const ssoChild = p0?.children.ssoIdpStaging;
  if (ssoChild && ssoChild.overall !== "PASSED") {
    signals.push({
      id: "risk-sso-idp-staging",
      category: "sso_proof",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.sso_proof,
      title: "SSO IdP staging proof incomplete",
      detail:
        ssoChild.missingEnvVars.length > 0
          ? `IdP smoke SKIPPED — missing ${ssoChild.missingEnvVars.join(", ")}.`
          : "Enterprise SSO is pilot wiring only — IdP proof remains ops-gated.",
      href: "/dashboard/settings/security/sso",
      severity: ssoChild.overall === "FAILED" ? "critical" : "high",
      statusLabel: ssoChild.overall ?? "SKIPPED",
      honestNote: "Not production SSO for all tenants.",
      priority: 4,
    });
  }

  return signals;
}

function liveSmokeRiskSignals(
  integrationHealth: OwnerDailyBriefingIntegrationHealthSlice | null | undefined,
  integrationRecoveryHref: string,
): OwnerDailyBriefingRiskSignal[] {
  if (!integrationHealth?.channelSmokeOverall) return [];

  const overall = integrationHealth.channelSmokeOverall;
  if (overall === "PASSED") return [];

  return [
    {
      id: "risk-channel-live-smoke",
      category: "live_smoke",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.live_smoke,
      title:
        overall === "FAILED"
          ? "Woo/Shopify live smoke FAILED"
          : "Woo/Shopify live smoke not proven",
      detail:
        overall === "FAILED"
          ? "Engineering live smoke failed — fix credentials and product mapping before pilot scale."
          : "Live smoke SKIPPED WITH REASON or missing — in-app pilot ready ≠ LIVE marketplace claim.",
      href: integrationRecoveryHref,
      severity: overall === "FAILED" ? "critical" : "high",
      statusLabel: overall,
      honestNote: "Never claim LIVE without artifact PASS.",
      priority: 3,
    },
  ];
}

function ssoWorkspaceRiskSignal(input: {
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
}): OwnerDailyBriefingRiskSignal | null {
  if (!input.ssoEntitlementEnabled || input.ssoActive) return null;

  return {
    id: "risk-sso-workspace-setup",
    category: "sso_proof",
    categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.sso_proof,
    title: input.ssoConfigured ? "SSO pilot not active" : "SSO pilot setup incomplete",
    detail: "Complete enterprise SSO pilot wiring — IdP staging proof is separate from workspace config.",
    href: "/dashboard/settings/security/sso",
    severity: "normal",
    statusLabel: input.ssoConfigured ? "Configured" : "Setup needed",
    priority: 14,
  };
}

function operationalRiskSignals(input: {
  kpis: OwnerDailyBriefingInput["kpis"];
  blockers: readonly TodayBlocker[];
  integrationOverall: OwnerDailyBriefingInput["integrationOverall"];
  integrationHealth: OwnerDailyBriefingIntegrationHealthSlice | null | undefined;
  productionCalendarSummary?: { overdue: number; dueToday: number } | null;
  lowStockCount: number;
  ingredientParConfigured: boolean;
  integrationRecoveryHref: string;
}): OwnerDailyBriefingRiskSignal[] {
  const signals: OwnerDailyBriefingRiskSignal[] = [];

  for (const blocker of input.blockers.slice(0, 3)) {
    signals.push({
      id: `risk-blocker-${blocker.id}`,
      category: "blocker",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.blocker,
      title: blocker.title,
      detail: blocker.detail,
      href: blocker.href,
      severity: "critical",
      statusLabel: "Open",
      priority: blocker.priority,
    });
  }

  if (input.kpis.blockedOrdersApprox > 0) {
    signals.push({
      id: "risk-stuck-orders",
      category: "stuck_orders",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.stuck_orders,
      title: "Stuck orders in pipeline",
      detail: `${input.kpis.blockedOrdersApprox} order(s) may be blocked — review Order Hub handoffs.`,
      href: "/dashboard/order-hub",
      severity: "high",
      statusLabel: String(input.kpis.blockedOrdersApprox),
      priority: 5,
    });
  }

  if (input.productionCalendarSummary && input.productionCalendarSummary.overdue > 0) {
    signals.push({
      id: "risk-overdue-production",
      category: "overdue_production",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.overdue_production,
      title: "Overdue production batches",
      detail: `${input.productionCalendarSummary.overdue} batch(es) past due on the production calendar.`,
      href: resolveBriefingOverdueProductionHref({
        overdue: input.productionCalendarSummary.overdue,
      }),
      severity: "high",
      statusLabel: `${input.productionCalendarSummary.overdue} overdue`,
      priority: 6,
    });
  }

  const integrationDown =
    input.integrationOverall === "down" || input.integrationOverall === "degraded";
  const integrationErrors =
    input.kpis.errorIntegrations > 0 || input.kpis.webhooksNeedingAttention > 0;
  const webhookBacklog = (input.integrationHealth?.failedWebhookCount ?? 0) > 0;

  if (integrationDown || integrationErrors || webhookBacklog) {
    let detail: string;
    if (input.integrationOverall === "down") {
      detail = "One or more integrations are in error — channel orders may fail.";
    } else if (webhookBacklog) {
      detail = `${input.integrationHealth!.failedWebhookCount} webhook delivery(ies) need attention.`;
    } else {
      detail = "Integrations degraded — review connections before scaling pilot traffic.";
    }

    signals.push({
      id: "risk-integration-failure",
      category: "integration_failure",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.integration_failure,
      title: "Integration reliability at risk",
      detail,
      href: input.integrationRecoveryHref,
      severity: input.integrationOverall === "down" ? "critical" : "high",
      statusLabel: input.integrationOverall.replace("_", " "),
      priority: input.integrationOverall === "down" ? 2 : 7,
    });
  }

  if (input.kpis.openSupportTickets > 0) {
    const urgent = input.kpis.openSupportTickets >= 3;
    signals.push({
      id: "risk-support-sla",
      category: "support_sla",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.support_sla,
      title: urgent ? "Support SLA pressure" : "Open support tickets",
      detail: `${input.kpis.openSupportTickets} ticket(s) open — resolve before customer impact spreads.`,
      href: "/dashboard/support/inbox",
      severity: urgent ? "high" : "normal",
      statusLabel: `${input.kpis.openSupportTickets} open`,
      priority: urgent ? 8 : 12,
    });
  }

  if (input.ingredientParConfigured && input.lowStockCount > 0) {
    signals.push({
      id: "risk-low-stock",
      category: "low_stock",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.low_stock,
      title: "Low stock ingredients",
      detail: `${input.lowStockCount} ingredient(s) below par — review purchasing before service gaps.`,
      href: "/dashboard/purchasing",
      severity: "normal",
      statusLabel: String(input.lowStockCount),
      priority: 11,
    });
  }

  if (input.kpis.overdueTasks > 0) {
    signals.push({
      id: "risk-overdue-tasks",
      category: "overdue_production",
      categoryLabel: OWNER_DAILY_BRIEFING_RISK_CATEGORY_LABEL.overdue_production,
      title: "Overdue operational tasks",
      detail: `${input.kpis.overdueTasks} task(s) past due — kitchen and ops follow-up needed.`,
      href: "/dashboard/tasks",
      severity: "high",
      statusLabel: String(input.kpis.overdueTasks),
      priority: 9,
    });
  }

  return signals;
}

export function sortOwnerDailyBriefingRiskSignals(
  signals: readonly OwnerDailyBriefingRiskSignal[],
): OwnerDailyBriefingRiskSignal[] {
  return [...signals].sort((a, b) => {
    const rank = severityRank(a.severity) - severityRank(b.severity);
    if (rank !== 0) return rank;
    return a.priority - b.priority;
  });
}

export function summarizeOwnerDailyBriefingRiskRadar(
  signals: readonly OwnerDailyBriefingRiskSignal[],
): Pick<
  OwnerDailyBriefingRiskRadarSlice,
  "headline" | "criticalCount" | "highCount" | "totalSignals" | "allClear"
> {
  const criticalCount = signals.filter((signal) => signal.severity === "critical").length;
  const highCount = signals.filter((signal) => signal.severity === "high").length;
  const totalSignals = signals.length;
  const allClear = totalSignals === 0;

  let headline: string;
  if (allClear) {
    headline =
      "No active risk signals — monitor Order Hub and integration health through the shift.";
  } else if (criticalCount > 0) {
    headline = `${criticalCount} critical · ${highCount} high — commercial proof, integrations, or pipeline blockers need attention.`;
  } else if (highCount > 0) {
    headline = `${highCount} high-priority signal(s) — resolve before scaling pilot or rush-hour traffic.`;
  } else {
    headline = `${totalSignals} monitor signal(s) — operational exceptions worth a quick review.`;
  }

  return { headline, criticalCount, highCount, totalSignals, allClear };
}

export function buildOwnerDailyBriefingRiskSignals(input: {
  kpis: OwnerDailyBriefingInput["kpis"];
  blockers: readonly TodayBlocker[];
  integrationOverall: OwnerDailyBriefingInput["integrationOverall"];
  integrationHealth?: OwnerDailyBriefingIntegrationHealthSlice | null;
  productionCalendarSummary?: { overdue: number; dueToday: number } | null;
  commercialOps?: CommercialPilotOpsStatusModel | null;
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
  lowStockCount: number;
  ingredientParConfigured: boolean;
  smokeNextAction?: IntegrationHealthSmokeNextAction | null;
}): OwnerDailyBriefingRiskSignal[] {
  const integrationRecoveryHref = resolveBriefingIntegrationRecoveryHref({
    integrationOverall: input.integrationOverall,
    integrationHealth: input.integrationHealth ?? null,
    smokeNextAction: input.smokeNextAction ?? null,
    errorIntegrations: input.kpis.errorIntegrations,
    webhooksNeedingAttention: input.kpis.webhooksNeedingAttention,
  });
  const signals: OwnerDailyBriefingRiskSignal[] = [];
  const seen = new Set<string>();

  for (const signal of commercialRiskSignals(input.commercialOps)) {
    pushUniqueSignal(signals, seen, signal);
  }

  for (const signal of liveSmokeRiskSignals(input.integrationHealth, integrationRecoveryHref)) {
    pushUniqueSignal(signals, seen, signal);
  }

  const ssoSignal = ssoWorkspaceRiskSignal(input);
  if (ssoSignal) pushUniqueSignal(signals, seen, ssoSignal);

  for (const signal of operationalRiskSignals({
    ...input,
    integrationRecoveryHref,
  })) {
    pushUniqueSignal(signals, seen, signal);
  }

  return sortOwnerDailyBriefingRiskSignals(
    enrichBriefingRiskSignalsWithSmokeNextAction(signals, input.smokeNextAction ?? null),
  ).slice(0, MAX_RISK_SIGNALS);
}

export function buildOwnerDailyBriefingRiskRadarSlice(input: {
  kpis: OwnerDailyBriefingInput["kpis"];
  blockers: readonly TodayBlocker[];
  integrationOverall: OwnerDailyBriefingInput["integrationOverall"];
  integrationHealth?: OwnerDailyBriefingIntegrationHealthSlice | null;
  productionCalendarSummary?: { overdue: number; dueToday: number } | null;
  commercialOps?: CommercialPilotOpsStatusModel | null;
  ssoEntitlementEnabled: boolean;
  ssoActive: boolean;
  ssoConfigured: boolean;
  lowStockCount: number;
  ingredientParConfigured: boolean;
  smokeNextAction?: IntegrationHealthSmokeNextAction | null;
}): OwnerDailyBriefingRiskRadarSlice {
  const signals = buildOwnerDailyBriefingRiskSignals(input);
  const summary = summarizeOwnerDailyBriefingRiskRadar(signals);

  return {
    policyId: OWNER_DAILY_BRIEFING_RISK_RADAR_ERA19_POLICY_ID,
    ...summary,
    signals,
  };
}

export function riskSignalToBriefingAlert(
  signal: OwnerDailyBriefingRiskSignal,
): import("@/lib/briefing/owner-daily-briefing-era19").OwnerDailyBriefingAlert {
  return {
    id: signal.id,
    title: signal.title,
    detail: signal.detail,
    href: signal.href,
    priority: signal.priority,
    tone: signal.severity === "critical" || signal.severity === "high" ? "urgent" : "normal",
  };
}
