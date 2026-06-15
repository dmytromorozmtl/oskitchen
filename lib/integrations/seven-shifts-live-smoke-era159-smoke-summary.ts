/**
 * 7shifts LIVE integration summary — wiring audit (Era 159).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_SUMMARY_ARTIFACT,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CAPABILITIES,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID,
} from "@/lib/integrations/seven-shifts-live-smoke-era159-policy";
import { auditSevenShiftsLiveSmokeWiring } from "@/lib/integrations/seven-shifts-live-smoke-summary";

export const SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SMOKE_SUMMARY_VERSION =
  SEVEN_SHIFTS_LIVE_SMOKE_ERA159_POLICY_ID;

export type SevenShiftsLiveSmokeEra159Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SevenShiftsLiveSmokeEra159ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SevenShiftsLiveSmokeEra159Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SevenShiftsLiveSmokeEra159Summary = {
  version: typeof SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SevenShiftsLiveSmokeEra159Overall;
  proofStatus: SevenShiftsLiveSmokeEra159ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: SevenShiftsLiveSmokeEra159Step[];
  honestyNote: string;
};

export function auditSevenShiftsLiveSmokeEra159Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditSevenShiftsLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveSevenShiftsLiveSmokeEra159ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SevenShiftsLiveSmokeEra159ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSevenShiftsLiveSmokeEra159Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): SevenShiftsLiveSmokeEra159Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveSevenShiftsLiveSmokeEra159ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SevenShiftsLiveSmokeEra159Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SevenShiftsLiveSmokeEra159Step[] = [
    {
      id: "wiring_audit",
      label: "7shifts OAuth → schedule import/export → labor cost wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 159 7shifts LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era82)",
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
          ? "Live demo company OAuth path PASSED"
          : liveSmokeOverall
            ? `era82 artifact overall: ${liveSmokeOverall} — run npm run smoke:seven-shifts-live with real company`
            : "No era82 artifact — run npm run smoke:seven-shifts-live-era82",
    },
  ];

  return {
    version: SEVEN_SHIFTS_LIVE_SMOKE_ERA159_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: SEVEN_SHIFTS_LIVE_SMOKE_ERA159_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo 7shifts OAuth → schedule import/export → labor cost wiring — live proof requires demo company + DATABASE_URL.",
  };
}

export function formatSevenShiftsLiveSmokeEra159ReportLines(
  summary: SevenShiftsLiveSmokeEra159Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era82): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
