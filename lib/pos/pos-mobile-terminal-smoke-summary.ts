/**
 * Mobile POS terminal smoke summary — wiring audit (Era 94).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX,
  POS_MOBILE_TERMINAL_ERA94_POLICY_ID,
  POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS,
} from "@/lib/pos/pos-mobile-terminal-era94-policy";

export const POS_MOBILE_TERMINAL_SMOKE_SUMMARY_VERSION = POS_MOBILE_TERMINAL_ERA94_POLICY_ID;

export type PosMobileTerminalSmokeEra94Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PosMobileTerminalSmokeEra94ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PosMobileTerminalSmokeEra94Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PosMobileTerminalSmokeEra94Summary = {
  version: typeof POS_MOBILE_TERMINAL_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PosMobileTerminalSmokeEra94Overall;
  proofStatus: PosMobileTerminalSmokeEra94ProofStatus;
  wiringCertPassed: boolean;
  minTouchPx: number;
  steps: PosMobileTerminalSmokeEra94Step[];
  honestyNote: string;
};

export function auditPosMobileTerminalSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of POS_MOBILE_TERMINAL_ERA94_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/pos/pos-mobile-gestures.ts") {
      if (!src.includes("detectPosSwipe")) {
        failures.push("pos-mobile-gestures.ts missing detectPosSwipe");
      }
      if (!src.includes("createPosSwipeHandlers")) {
        failures.push("pos-mobile-gestures.ts missing createPosSwipeHandlers");
      }
    }

    if (rel === "components/pos/pos-mobile-client.tsx") {
      if (!src.includes("createPosSwipeHandlers")) {
        failures.push("pos-mobile-client.tsx missing swipe handlers");
      }
      if (!src.includes("one-hand")) {
        failures.push("pos-mobile-client.tsx missing one-hand checkout copy");
      }
      if (!src.includes("pos-mobile-cart-sheet")) {
        failures.push("pos-mobile-client.tsx missing bottom cart sheet");
      }
    }

    if (rel === "lib/pos/pos-mobile-pos-policy.ts") {
      if (!src.includes("POS_MOBILE_SWIPE_MIN_DISTANCE_PX")) {
        failures.push("pos-mobile-pos-policy.ts missing swipe min distance");
      }
    }

    if (rel === "app/dashboard/pos/mobile/manifest.webmanifest/route.ts") {
      if (!src.includes("standalone")) {
        failures.push("mobile manifest missing standalone display mode");
      }
    }

    if (rel === "lib/pos/touch-targets.ts") {
      if (!src.includes("pos-mobile-client")) {
        failures.push("touch-targets.ts missing mobile client consumer");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolvePosMobileTerminalSmokeEra94ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PosMobileTerminalSmokeEra94ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPosMobileTerminalSmokeEra94Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): PosMobileTerminalSmokeEra94Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolvePosMobileTerminalSmokeEra94ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PosMobileTerminalSmokeEra94Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PosMobileTerminalSmokeEra94Step[] = [
    {
      id: "wiring_audit",
      label: "Mobile POS → swipe-to-add → one-hand checkout → PWA manifest",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 94 Mobile POS terminal cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: POS_MOBILE_TERMINAL_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    minTouchPx: POS_MOBILE_TERMINAL_ERA94_MIN_TOUCH_PX,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live phone proof requires physical mobile device.",
  };
}

export function formatPosMobileTerminalSmokeEra94ReportLines(
  summary: PosMobileTerminalSmokeEra94Summary,
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
