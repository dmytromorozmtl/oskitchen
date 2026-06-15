/**
 * Mobile-First Redesign smoke summary — wiring audit (Era 133).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MOBILE_FIRST_REDESIGN_ERA133_DIMENSIONS,
  MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID,
  MOBILE_FIRST_REDESIGN_ERA133_SERVICE,
  MOBILE_FIRST_REDESIGN_ERA133_WIRING_PATHS,
} from "@/lib/design/mobile-first-redesign-era133-policy";
import { MOBILE_FIRST_PATTERN_IMPORT } from "@/lib/design/mobile-first-redesign-policy";

export const MOBILE_FIRST_REDESIGN_SMOKE_SUMMARY_VERSION =
  MOBILE_FIRST_REDESIGN_ERA133_POLICY_ID;

export type MobileFirstRedesignSmokeEra133Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MobileFirstRedesignSmokeEra133ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MobileFirstRedesignSmokeEra133Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MobileFirstRedesignSmokeEra133Summary = {
  version: typeof MOBILE_FIRST_REDESIGN_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MobileFirstRedesignSmokeEra133Overall;
  proofStatus: MobileFirstRedesignSmokeEra133ProofStatus;
  wiringCertPassed: boolean;
  dimensions: readonly string[];
  steps: MobileFirstRedesignSmokeEra133Step[];
  honestyNote: string;
};

export function auditMobileFirstRedesignSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MOBILE_FIRST_REDESIGN_ERA133_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MOBILE_FIRST_REDESIGN_ERA133_SERVICE) {
      if (!src.includes("loadMobileFirstRedesignSnapshot")) {
        failures.push("mobile-first-redesign-service.ts missing loadMobileFirstRedesignSnapshot");
      }
      if (!src.includes("auditMobileFirstRedesign")) {
        failures.push("mobile-first-redesign-service.ts missing auditMobileFirstRedesign");
      }
      if (!src.includes("mobileFirstRedesignSummary")) {
        failures.push("mobile-first-redesign-service.ts missing mobileFirstRedesignSummary");
      }
      if (!src.includes("healthScore")) {
        failures.push("mobile-first-redesign-service.ts missing healthScore");
      }
    }

    if (rel === "lib/design/mobile-first-redesign-policy.ts") {
      if (!src.includes("MOBILE_FIRST_REDESIGN_POLICY_ID")) {
        failures.push("mobile-first-redesign-policy.ts missing policy id");
      }
      if (!src.includes("MOBILE_FIRST_VIEWPORT_PX")) {
        failures.push("mobile-first-redesign-policy.ts missing viewport constant");
      }
      if (!src.includes("MOBILE_FIRST_TOUCH_FLOOR_PX")) {
        failures.push("mobile-first-redesign-policy.ts missing touch floor constant");
      }
      if (!src.includes("MOBILE_FIRST_SWIPE_MIN_PX")) {
        failures.push("mobile-first-redesign-policy.ts missing swipe constant");
      }
      if (!src.includes("375")) {
        failures.push("mobile-first-redesign-policy.ts missing 375px baseline");
      }
    }

    if (rel === "lib/design/mobile-first-redesign-patterns.ts") {
      if (!src.includes("createDashboardSwipeHandlers")) {
        failures.push("mobile-first-redesign-patterns.ts missing swipe handlers");
      }
      if (!src.includes("dashboardChromeButtonClass")) {
        failures.push("mobile-first-redesign-patterns.ts missing chrome button class");
      }
      if (!src.includes("min-h-11")) {
        failures.push("mobile-first-redesign-patterns.ts missing 44px touch floor");
      }
      if (!src.includes("detectPosSwipe")) {
        failures.push("mobile-first-redesign-patterns.ts missing swipe detection");
      }
    }

    if (rel === "lib/design/mobile-first-redesign-audit-policy.ts") {
      if (!src.includes("auditMobileFirstRedesign")) {
        failures.push("mobile-first-redesign-audit-policy.ts missing auditMobileFirstRedesign");
      }
      if (!src.includes("findMobileFirstSmButtonViolations")) {
        failures.push("mobile-first-redesign-audit-policy.ts missing sm button audit");
      }
      if (!src.includes("MOBILE_FIRST_REDESIGN_MODULES")) {
        failures.push("mobile-first-redesign-audit-policy.ts missing module list");
      }
    }

    if (rel === "components/dashboard/dashboard-shell.tsx") {
      if (!src.includes(MOBILE_FIRST_PATTERN_IMPORT)) {
        failures.push("dashboard-shell.tsx missing mobile-first pattern import");
      }
      if (!src.includes("createDashboardSwipeHandlers")) {
        failures.push("dashboard-shell.tsx missing swipe-to-dismiss nav");
      }
      if (!src.includes("dashboardChromeNavTriggerClass")) {
        failures.push("dashboard-shell.tsx missing nav trigger touch class");
      }
      if (!src.includes("dashboardMainMobileClass")) {
        failures.push("dashboard-shell.tsx missing mobile main padding");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveMobileFirstRedesignSmokeEra133ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MobileFirstRedesignSmokeEra133ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMobileFirstRedesignSmokeEra133Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): MobileFirstRedesignSmokeEra133Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveMobileFirstRedesignSmokeEra133ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MobileFirstRedesignSmokeEra133Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MobileFirstRedesignSmokeEra133Step[] = [
    {
      id: "wiring_audit",
      label: "375px viewport → 44px touch → swipe nav dismiss",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 133 Mobile-First Redesign cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MOBILE_FIRST_REDESIGN_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    dimensions: MOBILE_FIRST_REDESIGN_ERA133_DIMENSIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring and static module audit — live proof requires 375px device or emulator verification.",
  };
}

export function formatMobileFirstRedesignSmokeEra133ReportLines(
  summary: MobileFirstRedesignSmokeEra133Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Dimensions: ${summary.dimensions.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
