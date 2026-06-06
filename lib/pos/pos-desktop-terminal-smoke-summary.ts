/**
 * Desktop POS terminal smoke summary — wiring audit (Era 92).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_DESKTOP_TERMINAL_ERA92_POLICY_ID,
  POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS,
} from "@/lib/pos/pos-desktop-terminal-era92-policy";

export const POS_DESKTOP_TERMINAL_SMOKE_SUMMARY_VERSION = POS_DESKTOP_TERMINAL_ERA92_POLICY_ID;

export type PosDesktopTerminalSmokeEra92Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosDesktopTerminalSmokeEra92ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosDesktopTerminalSmokeEra92Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosDesktopTerminalSmokeEra92Summary = {
  version: typeof POS_DESKTOP_TERMINAL_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosDesktopTerminalSmokeEra92Overall;
  proofStatus: PosDesktopTerminalSmokeEra92ProofStatus;
  wiringCertPassed: boolean;
  steps: PosDesktopTerminalSmokeEra92Step[];
  honestyNote: string;
};

export function auditPosDesktopTerminalSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_DESKTOP_TERMINAL_ERA92_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/keyboard/shortcuts.ts") {
      if (!src.includes("toggle_customer_display")) {
        failures.push("shortcuts.ts missing toggle_customer_display action");
      }
      if (!src.includes("F8")) {
        failures.push("shortcuts.ts missing F8 customer display shortcut");
      }
    }

    if (rel === "lib/pos/pos-multi-monitor.ts") {
      if (!src.includes("openPosCustomerDisplayWindow")) {
        failures.push("pos-multi-monitor.ts missing openPosCustomerDisplayWindow");
      }
      if (!src.includes("BroadcastChannel")) {
        failures.push("pos-multi-monitor.ts missing BroadcastChannel sync");
      }
    }

    if (rel === "components/dashboard/pos-terminal-client.tsx") {
      if (!src.includes("desktopMode")) {
        failures.push("pos-terminal-client.tsx missing desktopMode");
      }
      if (!src.includes("matchPosShortcut")) {
        failures.push("pos-terminal-client.tsx missing matchPosShortcut wiring");
      }
    }

    if (rel === "app/dashboard/pos/terminal/page.tsx") {
      if (!src.includes("desktopMode")) {
        failures.push("terminal/page.tsx missing desktopMode prop");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosDesktopTerminalSmokeEra92ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosDesktopTerminalSmokeEra92ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosDesktopTerminalSmokeEra92Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosDesktopTerminalSmokeEra92Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosDesktopTerminalSmokeEra92ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosDesktopTerminalSmokeEra92Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosDesktopTerminalSmokeEra92Step[] = [
    {
      id: "wiring_audit",
      label: "Desktop POS → keyboard shortcuts → multi-monitor customer display",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 92 Desktop POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_DESKTOP_TERMINAL_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live multi-monitor proof requires extended display hardware.",
  };
}

export function formatPosDesktopTerminalSmokeEra92ReportLines(
  summary: PosDesktopTerminalSmokeEra92Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
