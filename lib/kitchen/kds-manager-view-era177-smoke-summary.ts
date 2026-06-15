/**
 * KDS Manager View summary — Round 2 wiring audit (Era 177).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_MANAGER_VIEW_ERA177_CANONICAL_SUMMARY_ARTIFACT,
  KDS_MANAGER_VIEW_ERA177_CAPABILITIES,
  KDS_MANAGER_VIEW_ERA177_PILLARS,
  KDS_MANAGER_VIEW_ERA177_POLICY_ID,
  KDS_MANAGER_VIEW_ERA177_ROUTE,
} from "@/lib/kitchen/kds-manager-view-era177-policy";
import { auditKdsManagerViewSmokeWiring } from "@/lib/kitchen/kds-manager-view-smoke-summary";

export const KDS_MANAGER_VIEW_ERA177_SMOKE_SUMMARY_VERSION = KDS_MANAGER_VIEW_ERA177_POLICY_ID;

export type KdsManagerViewSmokeEra177Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsManagerViewSmokeEra177ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsManagerViewSmokeEra177Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsManagerViewSmokeEra177Summary = {
  version: typeof KDS_MANAGER_VIEW_ERA177_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsManagerViewSmokeEra177Overall;
  proofStatus: KdsManagerViewSmokeEra177ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  pillars: readonly string[];
  capabilities: readonly string[];
  steps: KdsManagerViewSmokeEra177Step[];
  honestyNote: string;
};

export function auditKdsManagerViewSmokeEra177Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsManagerViewSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_MANAGER_VIEW_ERA177_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsManagerViewSmokeEra177ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsManagerViewSmokeEra177ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsManagerViewSmokeEra177Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsManagerViewSmokeEra177Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsManagerViewSmokeEra177ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsManagerViewSmokeEra177Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsManagerViewSmokeEra177Step[] = [
    {
      id: "wiring_audit",
      label: "Production + expo + queue → performance / delays / efficiency manager dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 177 KDS Manager View cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era102)",
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
          ? "Canonical era102 smoke PASSED"
          : liveSmokeOverall
            ? `era102 artifact overall: ${liveSmokeOverall}`
            : "No era102 artifact — run npm run smoke:kds-manager-view-era102",
    },
  ];

  return {
    version: KDS_MANAGER_VIEW_ERA177_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: KDS_MANAGER_VIEW_ERA177_ROUTE,
    pillars: KDS_MANAGER_VIEW_ERA177_PILLARS,
    capabilities: KDS_MANAGER_VIEW_ERA177_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live manager proof requires staging tenant with active kitchen flow.",
  };
}

export function formatKdsManagerViewSmokeEra177ReportLines(
  summary: KdsManagerViewSmokeEra177Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era102): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(" · ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
