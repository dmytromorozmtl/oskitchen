/**
 * Marketplace Financing summary — Round 2 wiring audit (Era 194).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_FINANCING_ERA194_CANONICAL_SUMMARY_ARTIFACT,
  MARKETPLACE_FINANCING_ERA194_POLICY_ID,
  MARKETPLACE_FINANCING_ERA194_PRODUCTS,
  MARKETPLACE_FINANCING_ERA194_ROUTE,
} from "@/lib/marketplace/marketplace-financing-era194-policy";
import { auditMarketplaceFinancingSmokeWiring } from "@/lib/marketplace/marketplace-financing-smoke-summary";

export const MARKETPLACE_FINANCING_ERA194_SMOKE_SUMMARY_VERSION =
  MARKETPLACE_FINANCING_ERA194_POLICY_ID;

export type MarketplaceFinancingSmokeEra194Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MarketplaceFinancingSmokeEra194ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MarketplaceFinancingSmokeEra194Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MarketplaceFinancingSmokeEra194Summary = {
  version: typeof MARKETPLACE_FINANCING_ERA194_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MarketplaceFinancingSmokeEra194Overall;
  proofStatus: MarketplaceFinancingSmokeEra194ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  products: readonly string[];
  steps: MarketplaceFinancingSmokeEra194Step[];
  honestyNote: string;
};

export function auditMarketplaceFinancingSmokeEra194Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditMarketplaceFinancingSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, MARKETPLACE_FINANCING_ERA194_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveMarketplaceFinancingSmokeEra194ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MarketplaceFinancingSmokeEra194ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMarketplaceFinancingSmokeEra194Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): MarketplaceFinancingSmokeEra194Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveMarketplaceFinancingSmokeEra194ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MarketplaceFinancingSmokeEra194Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MarketplaceFinancingSmokeEra194Step[] = [
    {
      id: "wiring_audit",
      label: "Net-30/60/90 + early payment + factoring → financing snapshot",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 194 Marketplace Financing cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era119)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Canonical era119 smoke PASSED"
          : liveSmokeOverall
            ? `era119 artifact overall: ${liveSmokeOverall}`
            : "No era119 artifact — run npm run smoke:marketplace-financing-era119",
    },
  ];

  return {
    version: MARKETPLACE_FINANCING_ERA194_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: MARKETPLACE_FINANCING_ERA194_ROUTE,
    products: MARKETPLACE_FINANCING_ERA194_PRODUCTS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires credit line, net-terms POs, and payment schedules.",
  };
}

export function formatMarketplaceFinancingSmokeEra194ReportLines(
  summary: MarketplaceFinancingSmokeEra194Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era119): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Products: ${summary.products.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
