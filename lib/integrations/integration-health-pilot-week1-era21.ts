/**
 * Integration Health — Pilot Week 1 banner (post-GO, Week 1 in progress).
 */

import type { PilotCaseStudyDraftSummary } from "@/lib/commercial/pilot-case-study-draft-summary";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { PilotMetricsBaselineSummary } from "@/lib/commercial/pilot-metrics-baseline-summary";
import {
  buildPilotWeek1ExecutionUiSlice,
  PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR,
  type PilotWeek1ExecutionUiSlice,
} from "@/lib/commercial/pilot-week1-execution-ui-era21";

export const INTEGRATION_HEALTH_PILOT_WEEK1_ERA21_POLICY_ID =
  "era21-integration-health-pilot-week1-v1" as const;

export type IntegrationHealthPilotWeek1Banner = {
  policyId: typeof INTEGRATION_HEALTH_PILOT_WEEK1_ERA21_POLICY_ID;
  visible: boolean;
  goDecision: string;
  customerName: string | null;
  headline: string;
  honestyNote: string;
  week1: PilotWeek1ExecutionUiSlice;
  nextActions: readonly { label: string; href: string }[];
};

export function buildIntegrationHealthPilotWeek1Banner(input: {
  goNoGoSummary: PilotGoNoGoSummary | null;
  metricsBaseline?: PilotMetricsBaselineSummary | null;
  caseStudyDraft?: PilotCaseStudyDraftSummary | null;
}): IntegrationHealthPilotWeek1Banner | null {
  const week1 = buildPilotWeek1ExecutionUiSlice({
    goNoGoSummary: input.goNoGoSummary,
    metricsBaseline: input.metricsBaseline ?? null,
    caseStudyDraft: input.caseStudyDraft ?? null,
  });
  if (!week1) return null;

  const nextPhaseId = week1.nextPhase?.id;
  const headline =
    nextPhaseId === "day2_integration_health"
      ? "Pilot Week 1 Day 2 — review channel cards for honest LIVE/SKIPPED status before cadence sign-off."
      : "Pilot Week 1 active — Integration Health cadence is part of the paid pilot operating rhythm.";

  return {
    policyId: INTEGRATION_HEALTH_PILOT_WEEK1_ERA21_POLICY_ID,
    visible: true,
    goDecision: week1.goDecision,
    customerName: week1.customerName,
    headline,
    honestyNote:
      "SKIPPED WITH REASON remains honest when engineering proof is missing — never upgrade to LIVE for sales narrative.",
    week1,
    nextActions: [
      { label: "Owner Briefing", href: week1.todayHref },
      { label: "Order Hub", href: week1.orderHubHref },
      { label: "Launch Wizard", href: week1.launchWizardHref },
    ],
  };
}

export { PILOT_WEEK1_INTEGRATION_HEALTH_ANCHOR };
