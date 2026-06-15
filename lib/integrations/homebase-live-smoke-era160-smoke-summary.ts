/**
 * Homebase LIVE integration summary — wiring audit (Era 160).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_SUMMARY_ARTIFACT,
  HOMEBASE_LIVE_SMOKE_ERA160_CAPABILITIES,
  HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID,
} from "@/lib/integrations/homebase-live-smoke-era160-policy";
import { auditHomebaseLiveSmokeWiring } from "@/lib/integrations/homebase-live-smoke-summary";

export const HOMEBASE_LIVE_SMOKE_ERA160_SMOKE_SUMMARY_VERSION =
  HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID;

export type HomebaseLiveSmokeEra160Overall = "PASSED" | "FAILED" | "SKIPPED";

export type HomebaseLiveSmokeEra160ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type HomebaseLiveSmokeEra160Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type HomebaseLiveSmokeEra160Summary = {
  version: typeof HOMEBASE_LIVE_SMOKE_ERA160_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: HomebaseLiveSmokeEra160Overall;
  proofStatus: HomebaseLiveSmokeEra160ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: HomebaseLiveSmokeEra160Step[];
  honestyNote: string;
};

export function auditHomebaseLiveSmokeEra160Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditHomebaseLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveHomebaseLiveSmokeEra160ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): HomebaseLiveSmokeEra160ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildHomebaseLiveSmokeEra160Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): HomebaseLiveSmokeEra160Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveHomebaseLiveSmokeEra160ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: HomebaseLiveSmokeEra160Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: HomebaseLiveSmokeEra160Step[] = [
    {
      id: "wiring_audit",
      label: "Homebase OAuth → time clock → schedule wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 160 Homebase LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era83)",
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
          ? "Live demo location OAuth path PASSED"
          : liveSmokeOverall
            ? `era83 artifact overall: ${liveSmokeOverall} — run npm run smoke:homebase-live with real location`
            : "No era83 artifact — run npm run smoke:homebase-live-era83",
    },
  ];

  return {
    version: HOMEBASE_LIVE_SMOKE_ERA160_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: HOMEBASE_LIVE_SMOKE_ERA160_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Homebase OAuth → time clock → schedule wiring — live proof requires demo location + DATABASE_URL.",
  };
}

export function formatHomebaseLiveSmokeEra160ReportLines(
  summary: HomebaseLiveSmokeEra160Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era83): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
