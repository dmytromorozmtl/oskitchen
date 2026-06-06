/**
 * OpenTable LIVE integration summary — wiring audit (Era 157).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_SUMMARY_ARTIFACT,
  OPENTABLE_LIVE_SMOKE_ERA157_CAPABILITIES,
  OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID,
} from "@/lib/integrations/opentable-live-smoke-era157-policy";
import { auditOpenTableLiveSmokeWiring } from "@/lib/integrations/opentable-live-smoke-summary";

export const OPENTABLE_LIVE_SMOKE_ERA157_SMOKE_SUMMARY_VERSION =
  OPENTABLE_LIVE_SMOKE_ERA157_POLICY_ID;

export type OpenTableLiveSmokeEra157Overall = "PASSED" | "FAILED" | "SKIPPED";

export type OpenTableLiveSmokeEra157ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type OpenTableLiveSmokeEra157Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type OpenTableLiveSmokeEra157Summary = {
  version: typeof OPENTABLE_LIVE_SMOKE_ERA157_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: OpenTableLiveSmokeEra157Overall;
  proofStatus: OpenTableLiveSmokeEra157ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: OpenTableLiveSmokeEra157Step[];
  honestyNote: string;
};

export function auditOpenTableLiveSmokeEra157Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditOpenTableLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, OPENTABLE_LIVE_SMOKE_ERA157_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveOpenTableLiveSmokeEra157ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): OpenTableLiveSmokeEra157ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildOpenTableLiveSmokeEra157Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): OpenTableLiveSmokeEra157Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveOpenTableLiveSmokeEra157ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: OpenTableLiveSmokeEra157Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: OpenTableLiveSmokeEra157Step[] = [
    {
      id: "wiring_audit",
      label: "OpenTable OAuth → reservation webhook → table availability wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 157 OpenTable LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era89)",
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
          ? "Live sandbox OAuth path PASSED"
          : liveSmokeOverall
            ? `era89 artifact overall: ${liveSmokeOverall} — run npm run smoke:opentable-live with real restaurant`
            : "No era89 artifact — run npm run smoke:opentable-live-era89",
    },
  ];

  return {
    version: OPENTABLE_LIVE_SMOKE_ERA157_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: OPENTABLE_LIVE_SMOKE_ERA157_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo OpenTable OAuth → reservation webhook → table availability wiring — live proof requires sandbox restaurant + DATABASE_URL.",
  };
}

export function formatOpenTableLiveSmokeEra157ReportLines(
  summary: OpenTableLiveSmokeEra157Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era89): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
