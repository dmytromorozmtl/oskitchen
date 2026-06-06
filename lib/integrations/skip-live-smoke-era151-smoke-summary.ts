/**
 * Skip/Just Eat LIVE integration summary — wiring audit (Era 151).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SKIP_LIVE_SMOKE_ERA151_CANONICAL_SUMMARY_ARTIFACT,
  SKIP_LIVE_SMOKE_ERA151_CAPABILITIES,
  SKIP_LIVE_SMOKE_ERA151_POLICY_ID,
} from "@/lib/integrations/skip-live-smoke-era151-policy";
import { auditSkipLiveSmokeWiring } from "@/lib/integrations/skip-live-smoke-summary";

export const SKIP_LIVE_SMOKE_ERA151_SMOKE_SUMMARY_VERSION = SKIP_LIVE_SMOKE_ERA151_POLICY_ID;

export type SkipLiveSmokeEra151Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SkipLiveSmokeEra151ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SkipLiveSmokeEra151Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SkipLiveSmokeEra151Summary = {
  version: typeof SKIP_LIVE_SMOKE_ERA151_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SkipLiveSmokeEra151Overall;
  proofStatus: SkipLiveSmokeEra151ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: SkipLiveSmokeEra151Step[];
  honestyNote: string;
};

export function auditSkipLiveSmokeEra151Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditSkipLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, SKIP_LIVE_SMOKE_ERA151_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveSkipLiveSmokeEra151ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SkipLiveSmokeEra151ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSkipLiveSmokeEra151Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): SkipLiveSmokeEra151Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveSkipLiveSmokeEra151ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SkipLiveSmokeEra151Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SkipLiveSmokeEra151Step[] = [
    {
      id: "wiring_audit",
      label: "Skip/Just Eat OAuth → webhook → KDS → status sync wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 151 Skip/Just Eat LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era79)",
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
            ? `era79 artifact overall: ${liveSmokeOverall} — run npm run smoke:skip-live with real restaurant ID`
            : "No era79 artifact — run npm run smoke:skip-live-era79",
    },
  ];

  return {
    version: SKIP_LIVE_SMOKE_ERA151_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: SKIP_LIVE_SMOKE_ERA151_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Skip/Just Eat → webhook → KDS wiring — live proof requires partner sandbox restaurant ID.",
  };
}

export function formatSkipLiveSmokeEra151ReportLines(
  summary: SkipLiveSmokeEra151Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era79): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
