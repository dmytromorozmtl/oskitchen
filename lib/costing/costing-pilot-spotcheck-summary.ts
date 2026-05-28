/**
 * Costing pilot spot check summary — Evolution Era 17 Cycle 31.
 */

import {
  runPilotMenuSpotcheck,
  type PilotMarginReportRow,
} from "@/lib/costing/costing-pilot-menu-spotcheck-math";
import {
  COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
  COSTING_PILOT_SPOTCHECK_ERA17_PROOF_STATUS,
  COSTING_PILOT_SPOTCHECK_ERA17_SPOTCHECK_STEPS,
} from "@/lib/costing/costing-pilot-spotcheck-era17-policy";

export const COSTING_PILOT_SPOTCHECK_SUMMARY_VERSION =
  "era17-costing-pilot-spotcheck-v1" as const;

export type CostingPilotSpotcheckProofStatus =
  | "proof_passed"
  | "proof_failed"
  | "proof_skipped_cert_failed"
  | "spotcheck_documented_awaiting_staging_execution";

export type CostingPilotSpotcheckSummary = {
  version: typeof COSTING_PILOT_SPOTCHECK_SUMMARY_VERSION;
  policyId: typeof COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID;
  runAt: string;
  certPassed: boolean;
  fixtureSpotcheckPassed: boolean;
  costingProofStatus: CostingPilotSpotcheckProofStatus;
  operatorEmail: string | null;
  stagingUrl: string | null;
  fixtureRecipeCount: number;
  fixtureRows: Pick<
    PilotMarginReportRow,
    "recipeName" | "foodCostPct" | "marginPct" | "sellingPrice"
  >[];
  spotcheckSteps: readonly string[];
  readinessDecision: "READY" | "NOT_READY";
};

export function resolveCostingPilotSpotcheckProofStatus(input: {
  certPassed: boolean;
  fixtureSpotcheckPassed: boolean;
  operatorEmail?: string | null;
}): CostingPilotSpotcheckProofStatus {
  if (!input.certPassed || !input.fixtureSpotcheckPassed) return "proof_skipped_cert_failed";
  if (input.operatorEmail?.trim()) return "proof_passed";
  return "spotcheck_documented_awaiting_staging_execution";
}

export function buildCostingPilotSpotcheckSummary(input: {
  certPassed: boolean;
  operatorEmail?: string | null;
  stagingUrl?: string | null;
  runAt?: Date;
}): CostingPilotSpotcheckSummary {
  const fixture = runPilotMenuSpotcheck();
  const costingProofStatus = resolveCostingPilotSpotcheckProofStatus({
    certPassed: input.certPassed,
    fixtureSpotcheckPassed: fixture.passed,
    operatorEmail: input.operatorEmail,
  });

  return {
    version: COSTING_PILOT_SPOTCHECK_SUMMARY_VERSION,
    policyId: COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
    runAt: (input.runAt ?? new Date()).toISOString(),
    certPassed: input.certPassed,
    fixtureSpotcheckPassed: fixture.passed,
    costingProofStatus,
    operatorEmail: input.operatorEmail?.trim() || null,
    stagingUrl: input.stagingUrl?.trim() || null,
    fixtureRecipeCount: fixture.rows.length,
    fixtureRows: fixture.rows.map((row) => ({
      recipeName: row.recipeName,
      foodCostPct: row.foodCostPct,
      marginPct: row.marginPct,
      sellingPrice: row.sellingPrice,
    })),
    spotcheckSteps: COSTING_PILOT_SPOTCHECK_ERA17_SPOTCHECK_STEPS,
    readinessDecision:
      input.certPassed && fixture.passed ? "READY" : "NOT_READY",
  };
}

export function formatCostingPilotSpotcheckReportLines(
  summary: CostingPilotSpotcheckSummary,
): string[] {
  const operatorLine = summary.operatorEmail
    ? `Staging operator: ${summary.operatorEmail}`
    : "[SKIPPED WITH REASON] Staging spot check — COSTING_PILOT_SPOTCHECK_OPERATOR_EMAIL not set";

  const stagingLine = summary.stagingUrl
    ? `Staging URL: ${summary.stagingUrl}`
    : "Staging URL: not set (optional COSTING_PILOT_SPOTCHECK_STAGING_URL)";

  return [
    `Costing pilot spot check (${summary.version}) — proof: ${summary.costingProofStatus}`,
    `Run at: ${summary.runAt}`,
    `Cert passed: ${summary.certPassed}`,
    `Fixture spotcheck: ${summary.fixtureSpotcheckPassed}`,
    `Fixture recipes: ${summary.fixtureRecipeCount}`,
    `Readiness: ${summary.readinessDecision}`,
    operatorLine,
    stagingLine,
  ];
}

export function parseCostingPilotSpotcheckEnv(): Pick<
  Parameters<typeof buildCostingPilotSpotcheckSummary>[0],
  "operatorEmail" | "stagingUrl"
> {
  return {
    operatorEmail: process.env.COSTING_PILOT_SPOTCHECK_OPERATOR_EMAIL ?? null,
    stagingUrl: process.env.COSTING_PILOT_SPOTCHECK_STAGING_URL ?? null,
  };
}
