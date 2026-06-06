/**
 * Tablet POS terminal smoke summary — wiring audit (Era 93).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX,
  POS_TABLET_TERMINAL_ERA93_POLICY_ID,
  POS_TABLET_TERMINAL_ERA93_WIRING_PATHS,
} from "@/lib/pos/pos-tablet-terminal-era93-policy";

export const POS_TABLET_TERMINAL_SMOKE_SUMMARY_VERSION = POS_TABLET_TERMINAL_ERA93_POLICY_ID;

export type PosTabletTerminalSmokeEra93Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosTabletTerminalSmokeEra93ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosTabletTerminalSmokeEra93Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosTabletTerminalSmokeEra93Summary = {
  version: typeof POS_TABLET_TERMINAL_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosTabletTerminalSmokeEra93Overall;
  proofStatus: PosTabletTerminalSmokeEra93ProofStatus;
  wiringCertPassed: boolean;
  minTouchPx: number;
  steps: PosTabletTerminalSmokeEra93Step[];
  honestyNote: string;
};

export function auditPosTabletTerminalSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_TABLET_TERMINAL_ERA93_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/pos/pos-tablet-pos-policy.ts") {
      if (!src.includes("POS_TABLET_POS_MIN_TOUCH_PX")) {
        failures.push("pos-tablet-pos-policy.ts missing POS_TABLET_POS_MIN_TOUCH_PX");
      }
      if (!src.includes("portrait")) {
        failures.push("pos-tablet-pos-policy.ts missing portrait orientation mode");
      }
    }

    if (rel === "lib/pos/pos-tablet-layout.ts") {
      if (!src.includes("pos-tablet-portrait")) {
        failures.push("pos-tablet-layout.ts missing portrait shell class");
      }
      if (!src.includes("pos-tablet-landscape")) {
        failures.push("pos-tablet-layout.ts missing landscape shell class");
      }
    }

    if (rel === "components/pos/pos-tablet-client.tsx") {
      if (!src.includes("tabletMode")) {
        failures.push("pos-tablet-client.tsx missing tabletMode prop");
      }
      if (!src.includes("subscribeTabletOrientation")) {
        failures.push("pos-tablet-client.tsx missing orientation subscription");
      }
    }

    if (rel === "app/dashboard/pos/tablet/manifest.webmanifest/route.ts") {
      if (!src.includes("standalone")) {
        failures.push("tablet manifest missing standalone display mode");
      }
    }

    if (rel === "lib/pos/touch-targets.ts") {
      if (!src.includes("pos-tablet-client")) {
        failures.push("touch-targets.ts missing tablet client consumer");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosTabletTerminalSmokeEra93ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosTabletTerminalSmokeEra93ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosTabletTerminalSmokeEra93Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosTabletTerminalSmokeEra93Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosTabletTerminalSmokeEra93ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosTabletTerminalSmokeEra93Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosTabletTerminalSmokeEra93Step[] = [
    {
      id: "wiring_audit",
      label: "Tablet POS → 44px targets → portrait/landscape → PWA manifest",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 93 Tablet POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_TABLET_TERMINAL_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    minTouchPx: POS_TABLET_TERMINAL_ERA93_MIN_TOUCH_PX,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live iPad/Android proof requires physical tablet hardware.",
  };
}

export function formatPosTabletTerminalSmokeEra93ReportLines(
  summary: PosTabletTerminalSmokeEra93Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Min touch target: ${summary.minTouchPx}px`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
