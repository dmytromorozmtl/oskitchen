/**
 * Mobile POS terminal summary — Round 2 wiring audit (Era 169).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_MOBILE_TERMINAL_ERA169_CANONICAL_SUMMARY_ARTIFACT,
  POS_MOBILE_TERMINAL_ERA169_CAPABILITIES,
  POS_MOBILE_TERMINAL_ERA169_MIN_TOUCH_PX,
  POS_MOBILE_TERMINAL_ERA169_POLICY_ID,
} from "@/lib/pos/pos-mobile-terminal-era169-policy";
import { auditPosMobileTerminalSmokeWiring } from "@/lib/pos/pos-mobile-terminal-smoke-summary";

export const POS_MOBILE_TERMINAL_ERA169_SMOKE_SUMMARY_VERSION =
  POS_MOBILE_TERMINAL_ERA169_POLICY_ID;

export type PosMobileTerminalSmokeEra169Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosMobileTerminalSmokeEra169ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosMobileTerminalSmokeEra169Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosMobileTerminalSmokeEra169Summary = {
  version: typeof POS_MOBILE_TERMINAL_ERA169_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosMobileTerminalSmokeEra169Overall;
  proofStatus: PosMobileTerminalSmokeEra169ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  minTouchPx: number;
  capabilities: readonly string[];
  steps: PosMobileTerminalSmokeEra169Step[];
  honestyNote: string;
};

export function auditPosMobileTerminalSmokeEra169Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPosMobileTerminalSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, POS_MOBILE_TERMINAL_ERA169_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePosMobileTerminalSmokeEra169ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosMobileTerminalSmokeEra169ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosMobileTerminalSmokeEra169Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PosMobileTerminalSmokeEra169Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePosMobileTerminalSmokeEra169ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosMobileTerminalSmokeEra169Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosMobileTerminalSmokeEra169Step[] = [
    {
      id: "wiring_audit",
      label: "Mobile POS → swipe-to-add → one-hand checkout → PWA manifest",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 169 Mobile POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era94)",
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
          ? "Canonical era94 smoke PASSED"
          : liveSmokeOverall
            ? `era94 artifact overall: ${liveSmokeOverall}`
            : "No era94 artifact — run npm run smoke:pos-mobile-terminal-era94",
    },
  ];

  return {
    version: POS_MOBILE_TERMINAL_ERA169_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    minTouchPx: POS_MOBILE_TERMINAL_ERA169_MIN_TOUCH_PX,
    capabilities: POS_MOBILE_TERMINAL_ERA169_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Mobile POS wiring — live phone proof requires physical mobile device.",
  };
}

export function formatPosMobileTerminalSmokeEra169ReportLines(
  summary: PosMobileTerminalSmokeEra169Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era94): ${summary.liveSmokeOverall ?? "not run"}`,
    `Min touch target: ${summary.minTouchPx}px`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
