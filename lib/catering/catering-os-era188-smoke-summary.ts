/**
 * Catering OS summary — Round 2 wiring audit (Era 188).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CATERING_OS_ERA188_CANONICAL_SUMMARY_ARTIFACT,
  CATERING_OS_ERA188_MODULES,
  CATERING_OS_ERA188_POLICY_ID,
  CATERING_OS_ERA188_ROUTE,
} from "@/lib/catering/catering-os-era188-policy";
import { auditCateringOsSmokeWiring } from "@/lib/catering/catering-os-smoke-summary";

export const CATERING_OS_ERA188_SMOKE_SUMMARY_VERSION = CATERING_OS_ERA188_POLICY_ID;

export type CateringOsSmokeEra188Overall = "PASSED" | "FAILED" | "SKIPPED";

export type CateringOsSmokeEra188ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type CateringOsSmokeEra188Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type CateringOsSmokeEra188Summary = {
  version: typeof CATERING_OS_ERA188_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: CateringOsSmokeEra188Overall;
  proofStatus: CateringOsSmokeEra188ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  modules: readonly string[];
  steps: CateringOsSmokeEra188Step[];
  honestyNote: string;
};

export function auditCateringOsSmokeEra188Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditCateringOsSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, CATERING_OS_ERA188_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveCateringOsSmokeEra188ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): CateringOsSmokeEra188ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildCateringOsSmokeEra188Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): CateringOsSmokeEra188Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveCateringOsSmokeEra188ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: CateringOsSmokeEra188Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: CateringOsSmokeEra188Step[] = [
    {
      id: "wiring_audit",
      label: "Events + clients + packing + routes → four modules → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 188 Catering OS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era113)",
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
          ? "Canonical era113 smoke PASSED"
          : liveSmokeOverall
            ? `era113 artifact overall: ${liveSmokeOverall}`
            : "No era113 artifact — run npm run smoke:catering-os-era113",
    },
  ];

  return {
    version: CATERING_OS_ERA188_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: CATERING_OS_ERA188_ROUTE,
    modules: CATERING_OS_ERA188_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with catering quotes, packing tasks, and routes.",
  };
}

export function formatCateringOsSmokeEra188ReportLines(
  summary: CateringOsSmokeEra188Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era113): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
