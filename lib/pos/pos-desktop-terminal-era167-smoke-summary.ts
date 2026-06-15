/**
 * Desktop POS terminal summary — Round 2 wiring audit (Era 167).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_DESKTOP_TERMINAL_ERA167_CANONICAL_SUMMARY_ARTIFACT,
  POS_DESKTOP_TERMINAL_ERA167_CAPABILITIES,
  POS_DESKTOP_TERMINAL_ERA167_POLICY_ID,
} from "@/lib/pos/pos-desktop-terminal-era167-policy";
import { auditPosDesktopTerminalSmokeWiring } from "@/lib/pos/pos-desktop-terminal-smoke-summary";

export const POS_DESKTOP_TERMINAL_ERA167_SMOKE_SUMMARY_VERSION =
  POS_DESKTOP_TERMINAL_ERA167_POLICY_ID;

export type PosDesktopTerminalSmokeEra167Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosDesktopTerminalSmokeEra167ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosDesktopTerminalSmokeEra167Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosDesktopTerminalSmokeEra167Summary = {
  version: typeof POS_DESKTOP_TERMINAL_ERA167_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosDesktopTerminalSmokeEra167Overall;
  proofStatus: PosDesktopTerminalSmokeEra167ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: PosDesktopTerminalSmokeEra167Step[];
  honestyNote: string;
};

export function auditPosDesktopTerminalSmokeEra167Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosDesktopTerminalSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_DESKTOP_TERMINAL_ERA167_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosDesktopTerminalSmokeEra167ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosDesktopTerminalSmokeEra167ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosDesktopTerminalSmokeEra167Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosDesktopTerminalSmokeEra167Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosDesktopTerminalSmokeEra167ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosDesktopTerminalSmokeEra167Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosDesktopTerminalSmokeEra167Step[] = [
    {
      id: "wiring_audit",
      label: "Desktop POS → keyboard shortcuts → multi-monitor customer display",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 167 Desktop POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era92)",
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
          ? "Canonical era92 smoke PASSED"
          : liveSmokeOverall
            ? `era92 artifact overall: ${liveSmokeOverall}`
            : "No era92 artifact — run npm run smoke:pos-desktop-terminal-era92",
    },
  ];

  return {
    version: POS_DESKTOP_TERMINAL_ERA167_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: POS_DESKTOP_TERMINAL_ERA167_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Desktop POS keyboard shortcuts + multi-monitor wiring — live proof requires extended display hardware.",
  };
}

export function formatPosDesktopTerminalSmokeEra167ReportLines(
  summary: PosDesktopTerminalSmokeEra167Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era92): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
