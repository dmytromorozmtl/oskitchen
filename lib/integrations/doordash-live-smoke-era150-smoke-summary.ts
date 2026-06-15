/**
 * DoorDash LIVE integration summary — wiring audit (Era 150).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_SUMMARY_ARTIFACT,
  DOORDASH_LIVE_SMOKE_ERA150_CAPABILITIES,
  DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID,
} from "@/lib/integrations/doordash-live-smoke-era150-policy";
import { auditDoorDashLiveSmokeWiring } from "@/lib/integrations/doordash-live-smoke-summary";

export const DOORDASH_LIVE_SMOKE_ERA150_SMOKE_SUMMARY_VERSION =
  DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID;

export type DoorDashLiveSmokeEra150Overall = "PASSED" | "FAILED" | "SKIPPED";

export type DoorDashLiveSmokeEra150ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type DoorDashLiveSmokeEra150Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type DoorDashLiveSmokeEra150Summary = {
  version: typeof DOORDASH_LIVE_SMOKE_ERA150_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: DoorDashLiveSmokeEra150Overall;
  proofStatus: DoorDashLiveSmokeEra150ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: DoorDashLiveSmokeEra150Step[];
  honestyNote: string;
};

export function auditDoorDashLiveSmokeEra150Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditDoorDashLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveDoorDashLiveSmokeEra150ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): DoorDashLiveSmokeEra150ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildDoorDashLiveSmokeEra150Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): DoorDashLiveSmokeEra150Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveDoorDashLiveSmokeEra150ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: DoorDashLiveSmokeEra150Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: DoorDashLiveSmokeEra150Step[] = [
    {
      id: "wiring_audit",
      label: "DoorDash OAuth/Drive API → webhook → menu sync → KDS wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 150 DoorDash LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era77)",
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
            ? `era77 artifact overall: ${liveSmokeOverall} — run npm run smoke:doordash-live with real merchant ID`
            : "No era77 artifact — run npm run smoke:doordash-live-era77",
    },
  ];

  return {
    version: DOORDASH_LIVE_SMOKE_ERA150_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: DOORDASH_LIVE_SMOKE_ERA150_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo DoorDash → Drive API → webhook → menu sync → KDS wiring — live proof requires partner sandbox merchant ID.",
  };
}

export function formatDoorDashLiveSmokeEra150ReportLines(
  summary: DoorDashLiveSmokeEra150Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era77): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
