/**
 * Commissary OS summary — Round 2 wiring audit (Era 187).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSARY_OS_ERA187_CANONICAL_SUMMARY_ARTIFACT,
  COMMISSARY_OS_ERA187_PILLARS,
  COMMISSARY_OS_ERA187_POLICY_ID,
  COMMISSARY_OS_ERA187_ROUTE,
} from "@/lib/enterprise/commissary-os-era187-policy";
import { auditCommissaryOsSmokeWiring } from "@/lib/enterprise/commissary-os-smoke-summary";

export const COMMISSARY_OS_ERA187_SMOKE_SUMMARY_VERSION = COMMISSARY_OS_ERA187_POLICY_ID;

export type CommissaryOsSmokeEra187Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CommissaryOsSmokeEra187ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CommissaryOsSmokeEra187Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CommissaryOsSmokeEra187Summary = {
  version: typeof COMMISSARY_OS_ERA187_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CommissaryOsSmokeEra187Overall;
  proofStatus: CommissaryOsSmokeEra187ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  pillars: readonly string[];
  steps: CommissaryOsSmokeEra187Step[];
  honestyNote: string;
};

export function auditCommissaryOsSmokeEra187Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditCommissaryOsSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, COMMISSARY_OS_ERA187_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveCommissaryOsSmokeEra187ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CommissaryOsSmokeEra187ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCommissaryOsSmokeEra187Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): CommissaryOsSmokeEra187Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveCommissaryOsSmokeEra187ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CommissaryOsSmokeEra187Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CommissaryOsSmokeEra187Step[] = [
    {
      id: "wiring_audit",
      label: "Production + purchasing + delivery + distribution → four pillars → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 187 Commissary OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era112)",
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
          ? "Canonical era112 smoke PASSED"
          : liveSmokeOverall
            ? `era112 artifact overall: ${liveSmokeOverall}`
            : "No era112 artifact — run npm run smoke:commissary-os-era112",
    },
  ];

  return {
    version: COMMISSARY_OS_ERA187_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: COMMISSARY_OS_ERA187_ROUTE,
    pillars: COMMISSARY_OS_ERA187_PILLARS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with production plans, POs, transfers, and routes.",
  };
}

export function formatCommissaryOsSmokeEra187ReportLines(
  summary: CommissaryOsSmokeEra187Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era112): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
