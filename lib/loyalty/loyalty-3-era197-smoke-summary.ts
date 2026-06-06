/**
 * Loyalty 3.0 summary — Round 2 wiring audit (Era 197).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOYALTY_3_ERA197_CANONICAL_SUMMARY_ARTIFACT,
  LOYALTY_3_ERA197_PILLARS,
  LOYALTY_3_ERA197_POLICY_ID,
  LOYALTY_3_ERA197_ROUTE,
} from "@/lib/loyalty/loyalty-3-era197-policy";
import { auditLoyalty3SmokeWiring } from "@/lib/loyalty/loyalty-3-smoke-summary";

export const LOYALTY_3_ERA197_SMOKE_SUMMARY_VERSION = LOYALTY_3_ERA197_POLICY_ID;

export type Loyalty3SmokeEra197Overall = "PASSED" | "FAILED" | "SKIPPED";

export type Loyalty3SmokeEra197ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type Loyalty3SmokeEra197Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type Loyalty3SmokeEra197Summary = {
  version: typeof LOYALTY_3_ERA197_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: Loyalty3SmokeEra197Overall;
  proofStatus: Loyalty3SmokeEra197ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  pillars: readonly string[];
  steps: Loyalty3SmokeEra197Step[];
  honestyNote: string;
};

export function auditLoyalty3SmokeEra197Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditLoyalty3SmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, LOYALTY_3_ERA197_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveLoyalty3SmokeEra197ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): Loyalty3SmokeEra197ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildLoyalty3SmokeEra197Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): Loyalty3SmokeEra197Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveLoyalty3SmokeEra197ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: Loyalty3SmokeEra197Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: Loyalty3SmokeEra197Step[] = [
    {
      id: "wiring_audit",
      label: "Cross-brand pool → VIP multipliers → event bonuses → referrals",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 197 Loyalty 3.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era122)",
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
          ? "Canonical era122 smoke PASSED"
          : liveSmokeOverall
            ? `era122 artifact overall: ${liveSmokeOverall}`
            : "No era122 artifact — run npm run smoke:loyalty-3-era122",
    },
  ];

  return {
    version: LOYALTY_3_ERA197_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: LOYALTY_3_ERA197_ROUTE,
    pillars: LOYALTY_3_ERA197_PILLARS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires loyalty accounts, multi-brand orders, catering events, and referral conversions.",
  };
}

export function formatLoyalty3SmokeEra197ReportLines(
  summary: Loyalty3SmokeEra197Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era122): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
