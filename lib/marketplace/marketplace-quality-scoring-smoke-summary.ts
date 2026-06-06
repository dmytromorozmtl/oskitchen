/**
 * Marketplace Quality Scoring smoke summary — wiring audit (Era 120).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QUALITY_SCORING_ERA120_DIMENSIONS,
  QUALITY_SCORING_ERA120_POLICY_ID,
  QUALITY_SCORING_ERA120_ROUTE,
  QUALITY_SCORING_ERA120_SERVICE,
  QUALITY_SCORING_ERA120_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-quality-scoring-era120-policy";

export const QUALITY_SCORING_SMOKE_SUMMARY_VERSION = QUALITY_SCORING_ERA120_POLICY_ID;

export type QualityScoringSmokeEra120Overall = "PASSED" | "FAILED" | "SKIPPED";

export type QualityScoringSmokeEra120ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type QualityScoringSmokeEra120Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type QualityScoringSmokeEra120Summary = {
  version: typeof QUALITY_SCORING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: QualityScoringSmokeEra120Overall;
  proofStatus: QualityScoringSmokeEra120ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  dimensions: readonly string[];
  steps: QualityScoringSmokeEra120Step[];
  honestyNote: string;
};

export function auditQualityScoringSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of QUALITY_SCORING_ERA120_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === QUALITY_SCORING_ERA120_SERVICE) {
      if (!src.includes("loadMarketplaceQualityScoringSnapshot")) {
        failures.push("quality-scoring.ts missing loadMarketplaceQualityScoringSnapshot");
      }
      if (!src.includes("buildQualityScoringSnapshot")) {
        failures.push("quality-scoring.ts missing buildQualityScoringSnapshot");
      }
      if (!src.includes("buildSupplierQualityScore")) {
        failures.push("quality-scoring.ts missing buildSupplierQualityScore");
      }
      if (!src.includes("marketplaceVendorReview")) {
        failures.push("quality-scoring.ts missing vendor review aggregates");
      }
      if (!src.includes("loadPendingReviews")) {
        failures.push("quality-scoring.ts missing pending review loader");
      }
      if (!src.includes("computeCompositeQualityScore")) {
        failures.push("quality-scoring.ts missing computeCompositeQualityScore");
      }
    }

    if (rel === "lib/marketplace/quality-scoring-builders.ts") {
      if (!src.includes("buildSupplierQualityScore")) {
        failures.push("quality-scoring-builders.ts missing buildSupplierQualityScore");
      }
      if (!src.includes("buildQualityAlerts")) {
        failures.push("quality-scoring-builders.ts missing buildQualityAlerts");
      }
      if (!src.includes("buildQualityScoringSnapshot")) {
        failures.push("quality-scoring-builders.ts missing buildQualityScoringSnapshot");
      }
      if (!src.includes("resolveQualityTier")) {
        failures.push("quality-scoring-builders.ts missing resolveQualityTier");
      }
    }

    if (rel === "lib/marketplace/quality-scoring-policy.ts") {
      if (!src.includes("QUALITY_SCORING_POLICY_ID")) {
        failures.push("quality-scoring-policy.ts missing policy id");
      }
      if (!src.includes("QUALITY_SCORE_DIMENSIONS")) {
        failures.push("quality-scoring-policy.ts missing score dimensions");
      }
      if (!src.includes("QUALITY_TIER_THRESHOLDS")) {
        failures.push("quality-scoring-policy.ts missing tier thresholds");
      }
    }

    if (rel === "app/dashboard/marketplace/quality/page.tsx") {
      if (!src.includes("QualityScoringPanel")) {
        failures.push("quality page missing QualityScoringPanel");
      }
      if (!src.includes("loadMarketplaceQualityScoringSnapshot")) {
        failures.push("quality page missing loadMarketplaceQualityScoringSnapshot");
      }
      if (!src.includes("quality, accuracy, delivery, and packaging")) {
        failures.push("quality page missing four-dimension copy");
      }
    }

    if (rel === "components/marketplace/quality-scoring-panel.tsx") {
      if (!src.includes("quality-scoring-panel")) {
        failures.push("quality-scoring-panel.tsx missing root test id");
      }
      if (!src.includes("workspaceSuppliers")) {
        failures.push("quality-scoring-panel.tsx missing workspace supplier list");
      }
      if (!src.includes("Packaging")) {
        failures.push("quality-scoring-panel.tsx missing packaging dimension");
      }
      if (!src.includes("pendingReviews")) {
        failures.push("quality-scoring-panel.tsx missing pending reviews");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveQualityScoringSmokeEra120ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): QualityScoringSmokeEra120ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildQualityScoringSmokeEra120Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): QualityScoringSmokeEra120Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveQualityScoringSmokeEra120ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: QualityScoringSmokeEra120Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: QualityScoringSmokeEra120Step[] = [
    {
      id: "wiring_audit",
      label: "Reviews → supplier scores → tier rankings → quality alerts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 120 Marketplace Quality Scoring cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: QUALITY_SCORING_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: QUALITY_SCORING_ERA120_ROUTE,
    dimensions: QUALITY_SCORING_ERA120_DIMENSIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires marketplace POs with vendor reviews and delivered orders.",
  };
}

export function formatQualityScoringSmokeEra120ReportLines(
  summary: QualityScoringSmokeEra120Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Dimensions: ${summary.dimensions.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
