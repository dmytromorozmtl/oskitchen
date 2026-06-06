/**
 * KDS Rush Mode summary — Round 2 wiring audit (Era 178).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_RUSH_MODE_ERA178_CANONICAL_SUMMARY_ARTIFACT,
  KDS_RUSH_MODE_ERA178_CAPABILITIES,
  KDS_RUSH_MODE_ERA178_COMPONENT,
  KDS_RUSH_MODE_ERA178_POLICY_ID,
  KDS_RUSH_MODE_ERA178_RUSH_LEVELS,
} from "@/lib/kitchen/kds-rush-mode-era178-policy";
import { auditKdsRushModeSmokeWiring } from "@/lib/kitchen/kds-rush-mode-smoke-summary";

export const KDS_RUSH_MODE_ERA178_SMOKE_SUMMARY_VERSION = KDS_RUSH_MODE_ERA178_POLICY_ID;

export type KdsRushModeSmokeEra178Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KdsRushModeSmokeEra178ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KdsRushModeSmokeEra178Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KdsRushModeSmokeEra178Summary = {
  version: typeof KDS_RUSH_MODE_ERA178_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KdsRushModeSmokeEra178Overall;
  proofStatus: KdsRushModeSmokeEra178ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  component: string;
  rushLevels: readonly string[];
  capabilities: readonly string[];
  steps: KdsRushModeSmokeEra178Step[];
  honestyNote: string;
};

export function auditKdsRushModeSmokeEra178Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKdsRushModeSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KDS_RUSH_MODE_ERA178_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKdsRushModeSmokeEra178ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KdsRushModeSmokeEra178ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKdsRushModeSmokeEra178Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KdsRushModeSmokeEra178Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKdsRushModeSmokeEra178ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KdsRushModeSmokeEra178Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KdsRushModeSmokeEra178Step[] = [
    {
      id: "wiring_audit",
      label: "Peak detection → priority routing → RushMode UI → sound alerts",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 178 KDS Rush Mode cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era103)",
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
          ? "Canonical era103 smoke PASSED"
          : liveSmokeOverall
            ? `era103 artifact overall: ${liveSmokeOverall}`
            : "No era103 artifact — run npm run smoke:kds-rush-mode-era103",
    },
  ];

  return {
    version: KDS_RUSH_MODE_ERA178_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    component: KDS_RUSH_MODE_ERA178_COMPONENT,
    rushLevels: KDS_RUSH_MODE_ERA178_RUSH_LEVELS,
    capabilities: KDS_RUSH_MODE_ERA178_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live rush proof requires staging tenant with 8+ concurrent tickets.",
  };
}

export function formatKdsRushModeSmokeEra178ReportLines(
  summary: KdsRushModeSmokeEra178Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era103): ${summary.liveSmokeOverall ?? "not run"}`,
    `Component: ${summary.component}`,
    `Rush levels: ${summary.rushLevels.join(" → ")}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
