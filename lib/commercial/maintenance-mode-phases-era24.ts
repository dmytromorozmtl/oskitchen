/**
 * Maintenance mode — commercial pilot path complete (Step 12, era24).
 * Informational operator rhythms — no env attestation gates.
 */
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
  CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import type { CompetitorFeatureGapMatrixSummary } from "@/lib/commercial/competitor-feature-gap-matrix-summary";
import {
  resolveContinuousImprovementLoopPrerequisites,
  resolveSustainedOpsCompleteForContinuousImprovement,
} from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { SERIES_A_COMPETITOR_LEAPFROG_DOC } from "@/lib/commercial/market-leader-positioning-phases-era21";
import {
  IMPLEMENTATION_BACKLOG_DOC,
  resolveEra25PureOperationalModeContext,
  resolveSustainedProductEvolutionPrerequisites,
  SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
  type Era25PureOperationalModeContext,
} from "@/lib/commercial/sustained-product-evolution-phases-era23";
import {
  SERIES_A_FEATURE_MATURITY_DOC,
  SERIES_A_FORBIDDEN_CLAIMS_DOC,
  SERIES_A_PLATFORM_OPS_ROUTE,
  SUSTAINED_OPS_ORDER_HUB_ROUTE,
  SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/commercial/sustained-operational-excellence-phases-era21";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { InvestorNarrativeOnepagerSummary } from "@/lib/commercial/investor-narrative-onepager-summary";
import type { PilotRollbackDrillSummary } from "@/lib/commercial/pilot-rollback-drill-summary";

export const MAINTENANCE_MODE_PHASES_ERA24_POLICY_ID =
  "era24-maintenance-mode-phases-v1" as const;

export const MAINTENANCE_MODE_STEP12_DOC =
  "docs/next-step-12-commercial-pilot-path-complete-2026-05-28.md" as const;

export const MAINTENANCE_MODE_RHYTHM_CALENDAR_DOC =
  "docs/maintenance-mode-rhythm-calendar-era24.md" as const;

export const MAINTENANCE_MODE_PLAYBOOK_REPORT_PATH =
  "artifacts/maintenance-mode-playbook-report.md" as const;

export type MaintenanceModeRhythmFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "per_release"
  | "per_pilot";

export type MaintenanceModeRhythmStatusKind = "healthy" | "due_soon" | "overdue" | "guidance";

export type MaintenanceModeRhythmDef = {
  id: string;
  label: string;
  frequency: MaintenanceModeRhythmFrequency;
  ownerRole: string;
  docPath: string;
  routes: readonly string[];
  commands: readonly string[];
};

export const MAINTENANCE_MODE_RHYTHMS: readonly MaintenanceModeRhythmDef[] = [
  {
    id: "weekly_mon_shift_handoffs",
    label: "Weekly Mon — Owner Briefing → Order Hub handoffs",
    frequency: "weekly",
    ownerRole: "ops",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    routes: ["/dashboard/today", SUSTAINED_OPS_ORDER_HUB_ROUTE, SUSTAINED_OPS_PRODUCTION_CALENDAR_ROUTE],
    commands: [],
  },
  {
    id: "weekly_wed_integration_health",
    label: "Weekly Wed — Integration Health review",
    frequency: "weekly",
    ownerRole: "ops",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/integration-health"],
    commands: ["smoke:woo-shopify-live", "smoke:commerce-webhook-drill"],
  },
  {
    id: "weekly_fri_progress_sync",
    label: "Weekly Fri — Loop + evolution progress sync",
    frequency: "weekly",
    ownerRole: "leadership",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE],
    commands: [
      "ops:sync-continuous-improvement-loop-progress-report",
      "ops:sync-sustained-product-evolution-progress-report",
    ],
  },
  {
    id: "monthly_w1_metrics_baseline",
    label: "Monthly W1 — Metrics baseline per customer",
    frequency: "monthly",
    ownerRole: "ops",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: ["/dashboard/reports", SERIES_A_PLATFORM_OPS_ROUTE],
    commands: ["smoke:pilot-metrics-baseline"],
  },
  {
    id: "monthly_w2_feedback_triage",
    label: "Monthly W2 — operator_feedback_score → backlog triage",
    frequency: "monthly",
    ownerRole: "product",
    docPath: IMPLEMENTATION_BACKLOG_DOC,
    routes: ["/dashboard/reports", "/dashboard/implementation"],
    commands: ["smoke:pilot-metrics-baseline"],
  },
  {
    id: "monthly_w3_improvement_loop_review",
    label: "Monthly W3 — Improvement loop health review",
    frequency: "monthly",
    ownerRole: "ops",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_STEP10_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#continuous-improvement-loop`],
    commands: ["ops:validate-continuous-improvement-loop"],
  },
  {
    id: "monthly_w4_product_evolution_review",
    label: "Monthly W4 — Product evolution tracks review",
    frequency: "monthly",
    ownerRole: "product",
    docPath: SUSTAINED_PRODUCT_EVOLUTION_STEP11_DOC,
    routes: [`${SERIES_A_PLATFORM_OPS_ROUTE}#sustained-product-evolution`],
    commands: ["ops:validate-sustained-product-evolution"],
  },
  {
    id: "quarterly_governance_bundle",
    label: "Quarterly — Governance + maturity + leapfrog bundle",
    frequency: "quarterly",
    ownerRole: "leadership",
    docPath: SERIES_A_FEATURE_MATURITY_DOC,
    routes: ["/dashboard/implementation", "/dashboard/reports"],
    commands: [
      "smoke:pilot-forbidden-claims-enforcement",
      "smoke:competitor-feature-gap-matrix",
    ],
  },
  {
    id: "per_release_cert_bundle",
    label: "Per release — Commercial pilot cert + loop validation",
    frequency: "per_release",
    ownerRole: "engineering",
    docPath: CONTINUOUS_IMPROVEMENT_LOOP_RELEASE_CHECKLIST_DOC,
    routes: [SERIES_A_PLATFORM_OPS_ROUTE],
    commands: [
      "test:ci:commercial-pilot-runbook:cert",
      "ops:validate-continuous-improvement-loop",
      "ops:validate-sustained-product-evolution",
      "ops:validate-maintenance-mode",
    ],
  },
  {
    id: "per_new_pilot_isolation",
    label: "Per new pilot — Isolated GO artifacts (Scale Gate 1)",
    frequency: "per_pilot",
    ownerRole: "commercial",
    docPath: MAINTENANCE_MODE_STEP12_DOC,
    routes: ["/dashboard/launch-wizard", SERIES_A_PLATFORM_OPS_ROUTE],
    commands: ["smoke:pilot-gono-go"],
  },
] as const;

export const MAINTENANCE_MODE_GUARDRAILS = [
  "Never hand-edit PASS in artifacts/*.json — SKIPPED ≠ PASS",
  "Never merge GO artifacts across customers — SCALE_PER_CUSTOMER_GO_ISOLATION=1",
  "Never skip test:ci:commercial-pilot-runbook:cert on release",
  "Never add Step 13+ gate engineering without explicit new era charter",
] as const;

export type MaintenanceModeRhythmStatus = {
  id: string;
  label: string;
  frequency: MaintenanceModeRhythmFrequency;
  ownerRole: string;
  status: MaintenanceModeRhythmStatusKind;
  docPath: string;
  routes: readonly string[];
  commands: readonly string[];
  detail: string;
};

export type MaintenanceModePrerequisiteStatus = {
  goDecision: string | null;
  improvementLoopActive: boolean;
  sustainedOpsConvergenceReady: boolean;
  pureOperationalModeEra25Active: boolean;
  productEvolutionReady: boolean;
  maintenanceModeActive: boolean;
  commercialPilotPathComplete: boolean;
};

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return (Date.now() - parsed) / (1000 * 60 * 60 * 24);
}

export function resolveProductEvolutionReady(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
  investorOnepager?: InvestorNarrativeOnepagerSummary | null;
  rollbackDrill?: PilotRollbackDrillSummary | null;
  competitorMatrix: CompetitorFeatureGapMatrixSummary | null;
  env?: NodeJS.ProcessEnv;
}): boolean {
  const sustainedOpsComplete = resolveSustainedOpsCompleteForContinuousImprovement({
    goNoGoSummary: input.goNoGoSummary,
    p0Staging: input.p0Staging,
    tier2Summary: input.tier2Summary,
    metricsBaseline: input.metricsBaseline,
    caseStudyDraft: input.caseStudyDraft ?? null,
    investorOnepager: input.investorOnepager ?? null,
    rollbackDrill: input.rollbackDrill ?? null,
    competitorMatrix: input.competitorMatrix,
    env: input.env,
  });
  const goDecision = input.goNoGoSummary?.decision ?? null;
  const improvementLoopActive = resolveContinuousImprovementLoopPrerequisites({
    goDecision,
    sustainedOpsComplete,
  }).pureOperationalMode;
  const era25 = resolveEra25PureOperationalModeContext(input.env);
  return resolveSustainedProductEvolutionPrerequisites({
    goDecision,
    continuousImprovementLoopActive: improvementLoopActive,
    era25,
  }).productEvolutionReady;
}

export function resolveMaintenanceModePrerequisites(input: {
  goDecision: string | null;
  productEvolutionReady: boolean;
  era25?: Pick<
    Era25PureOperationalModeContext,
    "sustainedOpsConvergenceReady" | "pureOperationalModeEra25Active"
  >;
}): MaintenanceModePrerequisiteStatus {
  const sustainedOpsConvergenceReady = input.era25?.sustainedOpsConvergenceReady ?? false;
  const pureOperationalModeEra25Active = input.era25?.pureOperationalModeEra25Active ?? false;
  const maintenanceModeActive =
    input.goDecision === "GO" &&
    input.productEvolutionReady &&
    sustainedOpsConvergenceReady;
  return {
    goDecision: input.goDecision,
    improvementLoopActive: input.productEvolutionReady,
    sustainedOpsConvergenceReady,
    pureOperationalModeEra25Active,
    productEvolutionReady: input.productEvolutionReady,
    maintenanceModeActive,
    commercialPilotPathComplete: maintenanceModeActive,
  };
}

export function buildMaintenanceModeRhythmStatuses(input: {
  improvementLoopOverdue: number;
  improvementLoopDueSoon: number;
  productEvolutionOverdue: number;
  productEvolutionDueSoon: number;
  metricsBaseline: PilotMetricsBaselineSummary | null;
  p0Staging: P0StagingProofUnblockSummary | null;
  customerName: string | null;
}): MaintenanceModeRhythmStatus[] {
  const customer = input.customerName ?? "customer";
  const combinedOverdue = input.improvementLoopOverdue + input.productEvolutionOverdue;
  const combinedDueSoon = input.improvementLoopDueSoon + input.productEvolutionDueSoon;

  return MAINTENANCE_MODE_RHYTHMS.map((rhythm) => {
    if (rhythm.id === "weekly_wed_integration_health") {
      const channelPassed = p0ChannelPassed(input.p0Staging);
      const lastRunAt = input.p0Staging?.runAt ?? null;
      const ageDays = daysSince(lastRunAt);
      const status = !channelPassed
        ? ("overdue" as const)
        : ageDays !== null && ageDays > 7
          ? ("due_soon" as const)
          : ("healthy" as const);
      return rhythmStatus(rhythm, status, integrationDetail(status, customer));
    }

    if (rhythm.id === "monthly_w1_metrics_baseline" || rhythm.id === "monthly_w2_feedback_triage") {
      const metricsPassed = input.metricsBaseline?.overall === "PASSED";
      const ageDays = daysSince(input.metricsBaseline?.runAt ?? input.metricsBaseline?.capturedAt);
      const status = !metricsPassed
        ? ("overdue" as const)
        : ageDays !== null && ageDays > 28
          ? ("due_soon" as const)
          : ageDays !== null && ageDays > 35
            ? ("overdue" as const)
            : ("healthy" as const);
      const detail =
        rhythm.id === "monthly_w2_feedback_triage"
          ? status === "healthy"
            ? `Triage operator_feedback_score for ${customer} into ${IMPLEMENTATION_BACKLOG_DOC}`
            : "Capture metrics baseline before backlog triage"
          : status === "healthy"
            ? `Metrics baseline fresh for ${customer} — Gate 1 isolation maintained`
            : "Run npm run smoke:pilot-metrics-baseline per active customer";
      return rhythmStatus(rhythm, status, detail);
    }

    if (
      rhythm.id === "monthly_w3_improvement_loop_review" &&
      input.improvementLoopOverdue > 0
    ) {
      return rhythmStatus(
        rhythm,
        "overdue",
        `${input.improvementLoopOverdue} improvement loop track(s) overdue — review #continuous-improvement-loop`,
      );
    }

    if (
      rhythm.id === "monthly_w4_product_evolution_review" &&
      input.productEvolutionOverdue > 0
    ) {
      return rhythmStatus(
        rhythm,
        "overdue",
        `${input.productEvolutionOverdue} product evolution track(s) overdue — review #sustained-product-evolution`,
      );
    }

    if (rhythm.id === "quarterly_governance_bundle" && combinedOverdue > 0) {
      return rhythmStatus(
        rhythm,
        "due_soon",
        `Address ${combinedOverdue} overdue track(s) before quarterly governance bundle`,
      );
    }

    const status: MaintenanceModeRhythmStatusKind =
      combinedOverdue > 0 && (rhythm.frequency === "weekly" || rhythm.frequency === "monthly")
        ? "due_soon"
        : combinedDueSoon > 0 && rhythm.frequency === "weekly"
          ? "due_soon"
          : "guidance";

    return rhythmStatus(rhythm, status, defaultRhythmDetail(rhythm, customer));
  });
}

function p0ChannelPassed(p0: P0StagingProofUnblockSummary | null): boolean {
  return p0?.children.channelLive.overall === "PASSED";
}

function rhythmStatus(
  rhythm: MaintenanceModeRhythmDef,
  status: MaintenanceModeRhythmStatusKind,
  detail: string,
): MaintenanceModeRhythmStatus {
  return {
    id: rhythm.id,
    label: rhythm.label,
    frequency: rhythm.frequency,
    ownerRole: rhythm.ownerRole,
    status,
    docPath: rhythm.docPath,
    routes: rhythm.routes,
    commands: rhythm.commands,
    detail,
  };
}

function integrationDetail(
  status: MaintenanceModeRhythmStatusKind,
  customer: string,
): string {
  if (status === "healthy") {
    return "Integration evidence fresh — re-run smokes after credential rotation";
  }
  if (status === "due_soon") {
    return "Schedule smoke:woo-shopify-live + smoke:commerce-webhook-drill this week";
  }
  return `Integration review overdue for ${customer} — run channel smokes until artifacts honest`;
}

function defaultRhythmDetail(rhythm: MaintenanceModeRhythmDef, customer: string): string {
  if (rhythm.id === "weekly_mon_shift_handoffs") {
    return `Daily/weekly shift cadence via Today → Order Hub for ${customer}`;
  }
  if (rhythm.id === "weekly_fri_progress_sync") {
    return "Sync improvement loop + product evolution progress reports to artifacts/";
  }
  if (rhythm.id === "quarterly_governance_bundle") {
    return `Review ${SERIES_A_FEATURE_MATURITY_DOC}, ${SERIES_A_FORBIDDEN_CLAIMS_DOC}, ${SERIES_A_COMPETITOR_LEAPFROG_DOC}`;
  }
  if (rhythm.id === "per_release_cert_bundle") {
    return "Non-negotiable release train — cert chain + all loop validators";
  }
  if (rhythm.id === "per_new_pilot_isolation") {
    return "Launch Wizard for new pilots only — isolated GO artifacts per Scale Gate 1";
  }
  return `${rhythm.label} — see ${rhythm.docPath}`;
}

export function resolveMaintenanceModeHealthSummary(
  rhythms: readonly MaintenanceModeRhythmStatus[],
): {
  healthyCount: number;
  dueSoonCount: number;
  overdueCount: number;
  guidanceCount: number;
} {
  return {
    healthyCount: rhythms.filter((rhythm) => rhythm.status === "healthy").length,
    dueSoonCount: rhythms.filter((rhythm) => rhythm.status === "due_soon").length,
    overdueCount: rhythms.filter((rhythm) => rhythm.status === "overdue").length,
    guidanceCount: rhythms.filter((rhythm) => rhythm.status === "guidance").length,
  };
}

export function resolveNextMaintenanceModeAttentionRhythm(
  rhythms: readonly MaintenanceModeRhythmStatus[],
): MaintenanceModeRhythmStatus | null {
  return (
    rhythms.find((rhythm) => rhythm.status === "overdue") ??
    rhythms.find((rhythm) => rhythm.status === "due_soon") ??
    null
  );
}

export function formatMaintenanceModeRhythmDetail(rhythm: MaintenanceModeRhythmStatus): string {
  return `${rhythm.label}: ${rhythm.detail}`;
}
