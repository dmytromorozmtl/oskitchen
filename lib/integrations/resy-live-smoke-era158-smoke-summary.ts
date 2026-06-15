/**
 * Resy LIVE integration summary — wiring audit (Era 158).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RESY_LIVE_SMOKE_ERA158_CANONICAL_SUMMARY_ARTIFACT,
  RESY_LIVE_SMOKE_ERA158_CAPABILITIES,
  RESY_LIVE_SMOKE_ERA158_POLICY_ID,
} from "@/lib/integrations/resy-live-smoke-era158-policy";
import { auditResyLiveSmokeWiring } from "@/lib/integrations/resy-live-smoke-summary";

export const RESY_LIVE_SMOKE_ERA158_SMOKE_SUMMARY_VERSION = RESY_LIVE_SMOKE_ERA158_POLICY_ID;

export type ResyLiveSmokeEra158Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ResyLiveSmokeEra158ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ResyLiveSmokeEra158Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ResyLiveSmokeEra158Summary = {
  version: typeof RESY_LIVE_SMOKE_ERA158_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ResyLiveSmokeEra158Overall;
  proofStatus: ResyLiveSmokeEra158ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: ResyLiveSmokeEra158Step[];
  honestyNote: string;
};

export function auditResyLiveSmokeEra158Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditResyLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, RESY_LIVE_SMOKE_ERA158_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveResyLiveSmokeEra158ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): ResyLiveSmokeEra158ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildResyLiveSmokeEra158Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): ResyLiveSmokeEra158Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveResyLiveSmokeEra158ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: ResyLiveSmokeEra158Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: ResyLiveSmokeEra158Step[] = [
    {
      id: "wiring_audit",
      label: "Resy OAuth → reservation sync → waitlist wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 158 Resy LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era90)",
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
            ? `era90 artifact overall: ${liveSmokeOverall} — run npm run smoke:resy-live with real venue`
            : "No era90 artifact — run npm run smoke:resy-live-era90",
    },
  ];

  return {
    version: RESY_LIVE_SMOKE_ERA158_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: RESY_LIVE_SMOKE_ERA158_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Resy OAuth → reservation sync → waitlist wiring — live proof requires sandbox venue + DATABASE_URL.",
  };
}

export function formatResyLiveSmokeEra158ReportLines(
  summary: ResyLiveSmokeEra158Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era90): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
