/**
 * Tablet POS terminal summary — Round 2 wiring audit (Era 168).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_TABLET_TERMINAL_ERA168_CANONICAL_SUMMARY_ARTIFACT,
  POS_TABLET_TERMINAL_ERA168_CAPABILITIES,
  POS_TABLET_TERMINAL_ERA168_MIN_TOUCH_PX,
  POS_TABLET_TERMINAL_ERA168_POLICY_ID,
} from "@/lib/pos/pos-tablet-terminal-era168-policy";
import { auditPosTabletTerminalSmokeWiring } from "@/lib/pos/pos-tablet-terminal-smoke-summary";

export const POS_TABLET_TERMINAL_ERA168_SMOKE_SUMMARY_VERSION =
  POS_TABLET_TERMINAL_ERA168_POLICY_ID;

export type PosTabletTerminalSmokeEra168Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosTabletTerminalSmokeEra168ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosTabletTerminalSmokeEra168Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosTabletTerminalSmokeEra168Summary = {
  version: typeof POS_TABLET_TERMINAL_ERA168_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosTabletTerminalSmokeEra168Overall;
  proofStatus: PosTabletTerminalSmokeEra168ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  minTouchPx: number;
  capabilities: readonly string[];
  steps: PosTabletTerminalSmokeEra168Step[];
  honestyNote: string;
};

export function auditPosTabletTerminalSmokeEra168Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosTabletTerminalSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_TABLET_TERMINAL_ERA168_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosTabletTerminalSmokeEra168ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosTabletTerminalSmokeEra168ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosTabletTerminalSmokeEra168Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosTabletTerminalSmokeEra168Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosTabletTerminalSmokeEra168ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosTabletTerminalSmokeEra168Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosTabletTerminalSmokeEra168Step[] = [
    {
      id: "wiring_audit",
      label: "Tablet POS → 44px targets → portrait/landscape → PWA manifest",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 168 Tablet POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era93)",
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
          ? "Canonical era93 smoke PASSED"
          : liveSmokeOverall
            ? `era93 artifact overall: ${liveSmokeOverall}`
            : "No era93 artifact — run npm run smoke:pos-tablet-terminal-era93",
    },
  ];

  return {
    version: POS_TABLET_TERMINAL_ERA168_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    minTouchPx: POS_TABLET_TERMINAL_ERA168_MIN_TOUCH_PX,
    capabilities: POS_TABLET_TERMINAL_ERA168_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Tablet POS wiring — live iPad/Android proof requires physical tablet hardware.",
  };
}

export function formatPosTabletTerminalSmokeEra168ReportLines(
  summary: PosTabletTerminalSmokeEra168Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era93): ${summary.liveSmokeOverall ?? "not run"}`,
    `Min touch target: ${summary.minTouchPx}px`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
