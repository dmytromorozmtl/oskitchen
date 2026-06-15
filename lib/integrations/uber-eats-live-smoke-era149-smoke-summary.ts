/**
 * Uber Eats LIVE integration summary — wiring audit (Era 149).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_SUMMARY_ARTIFACT,
  UBER_EATS_LIVE_SMOKE_ERA149_CAPABILITIES,
  UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID,
} from "@/lib/integrations/uber-eats-live-smoke-era149-policy";
import { auditUberEatsLiveSmokeWiring } from "@/lib/integrations/uber-eats-live-smoke-summary";

export const UBER_EATS_LIVE_SMOKE_ERA149_SMOKE_SUMMARY_VERSION =
  UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID;

export type UberEatsLiveSmokeEra149Overall = "PASSED" | "FAILED" | "SKIPPED";

export type UberEatsLiveSmokeEra149ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type UberEatsLiveSmokeEra149Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type UberEatsLiveSmokeEra149Summary = {
  version: typeof UBER_EATS_LIVE_SMOKE_ERA149_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: UberEatsLiveSmokeEra149Overall;
  proofStatus: UberEatsLiveSmokeEra149ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: UberEatsLiveSmokeEra149Step[];
  honestyNote: string;
};

export function auditUberEatsLiveSmokeEra149Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditUberEatsLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveUberEatsLiveSmokeEra149ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): UberEatsLiveSmokeEra149ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildUberEatsLiveSmokeEra149Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): UberEatsLiveSmokeEra149Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveUberEatsLiveSmokeEra149ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: UberEatsLiveSmokeEra149Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: UberEatsLiveSmokeEra149Step[] = [
    {
      id: "wiring_audit",
      label: "Uber Eats OAuth → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 149 Uber Eats LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era76)",
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
          ? "Live partner sandbox path PASSED"
          : liveSmokeOverall
            ? `era76 artifact overall: ${liveSmokeOverall} — run npm run smoke:uber-eats-live with real store UUID`
            : "No era76 artifact — run npm run smoke:uber-eats-live-era76",
    },
  ];

  return {
    version: UBER_EATS_LIVE_SMOKE_ERA149_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: UBER_EATS_LIVE_SMOKE_ERA149_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Uber Eats → webhook → KDS → status sync wiring — live proof requires partner sandbox store UUID.",
  };
}

export function formatUberEatsLiveSmokeEra149ReportLines(
  summary: UberEatsLiveSmokeEra149Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era76): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
