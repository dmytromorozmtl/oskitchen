/**
 * Handheld POS terminal summary — Round 2 wiring audit (Era 171).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_HANDHELD_TERMINAL_ERA171_CANONICAL_SUMMARY_ARTIFACT,
  POS_HANDHELD_TERMINAL_ERA171_CAPABILITIES,
  POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE,
  POS_HANDHELD_TERMINAL_ERA171_MIN_TOUCH_PX,
  POS_HANDHELD_TERMINAL_ERA171_POLICY_ID,
} from "@/lib/pos/pos-handheld-terminal-era171-policy";
import { auditPosHandheldTerminalSmokeWiring } from "@/lib/pos/pos-handheld-terminal-smoke-summary";

export const POS_HANDHELD_TERMINAL_ERA171_SMOKE_SUMMARY_VERSION =
  POS_HANDHELD_TERMINAL_ERA171_POLICY_ID;

export type PosHandheldTerminalSmokeEra171Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosHandheldTerminalSmokeEra171ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosHandheldTerminalSmokeEra171Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosHandheldTerminalSmokeEra171Summary = {
  version: typeof POS_HANDHELD_TERMINAL_ERA171_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosHandheldTerminalSmokeEra171Overall;
  proofStatus: PosHandheldTerminalSmokeEra171ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  kdsRoute: string;
  minTouchPx: number;
  capabilities: readonly string[];
  steps: PosHandheldTerminalSmokeEra171Step[];
  honestyNote: string;
};

export function auditPosHandheldTerminalSmokeEra171Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosHandheldTerminalSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_HANDHELD_TERMINAL_ERA171_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosHandheldTerminalSmokeEra171ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosHandheldTerminalSmokeEra171ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosHandheldTerminalSmokeEra171Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosHandheldTerminalSmokeEra171Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosHandheldTerminalSmokeEra171ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosHandheldTerminalSmokeEra171Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosHandheldTerminalSmokeEra171Step[] = [
    {
      id: "wiring_audit",
      label: "Table select → cart build → fire to KDS → tab sync → offline cash checkout",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 171 Handheld POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era96)",
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
          ? "Canonical era96 smoke PASSED"
          : liveSmokeOverall
            ? `era96 artifact overall: ${liveSmokeOverall}`
            : "No era96 artifact — run npm run smoke:pos-handheld-terminal-era96",
    },
  ];

  return {
    version: POS_HANDHELD_TERMINAL_ERA171_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    kdsRoute: POS_HANDHELD_TERMINAL_ERA171_KDS_ROUTE,
    minTouchPx: POS_HANDHELD_TERMINAL_ERA171_MIN_TOUCH_PX,
    capabilities: POS_HANDHELD_TERMINAL_ERA171_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live tableside proof requires physical handheld device on floor.",
  };
}

export function formatPosHandheldTerminalSmokeEra171ReportLines(
  summary: PosHandheldTerminalSmokeEra171Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era96): ${summary.liveSmokeOverall ?? "not run"}`,
    `KDS route: ${summary.kdsRoute}`,
    `Min touch target: ${summary.minTouchPx}px`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
