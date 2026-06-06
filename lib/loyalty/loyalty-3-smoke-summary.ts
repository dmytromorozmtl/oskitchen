/**
 * Loyalty 3.0 smoke summary — wiring audit (Era 122).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOYALTY_3_ERA122_PILLARS,
  LOYALTY_3_ERA122_POLICY_ID,
  LOYALTY_3_ERA122_ROUTE,
  LOYALTY_3_ERA122_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-3-era122-policy";
import { LOYALTY_3_SERVICE } from "@/lib/loyalty/loyalty-3-policy";

export const LOYALTY_3_SMOKE_SUMMARY_VERSION = LOYALTY_3_ERA122_POLICY_ID;

export type Loyalty3SmokeEra122Overall = "PASSED" | "FAILED" | "SKIPPED";

export type Loyalty3SmokeEra122ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type Loyalty3SmokeEra122Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type Loyalty3SmokeEra122Summary = {
  version: typeof LOYALTY_3_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: Loyalty3SmokeEra122Overall;
  proofStatus: Loyalty3SmokeEra122ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  pillars: readonly string[];
  steps: Loyalty3SmokeEra122Step[];
  honestyNote: string;
};

export function auditLoyalty3SmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of LOYALTY_3_ERA122_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === LOYALTY_3_SERVICE) {
      if (!src.includes("loadLoyalty3DashboardSnapshot")) {
        failures.push("loyalty-3.0-service.ts missing loadLoyalty3DashboardSnapshot");
      }
      if (!src.includes("loadCrossBrandLanes")) {
        failures.push("loyalty-3.0-service.ts missing cross-brand lane loader");
      }
      if (!src.includes("loadVipMembers")) {
        failures.push("loyalty-3.0-service.ts missing VIP member loader");
      }
      if (!src.includes("loadEventOpportunities")) {
        failures.push("loyalty-3.0-service.ts missing event opportunity loader");
      }
      if (!src.includes("loadReferralStats")) {
        failures.push("loyalty-3.0-service.ts missing referral stats loader");
      }
      if (!src.includes("resolveLoyalty3VipMultiplier")) {
        failures.push("loyalty-3.0-service.ts missing VIP multiplier resolver");
      }
    }

    if (rel === "lib/loyalty/loyalty-3-builders.ts") {
      if (!src.includes("buildLoyalty3CrossBrandLane")) {
        failures.push("loyalty-3-builders.ts missing buildLoyalty3CrossBrandLane");
      }
      if (!src.includes("buildLoyalty3VipMember")) {
        failures.push("loyalty-3-builders.ts missing buildLoyalty3VipMember");
      }
      if (!src.includes("buildLoyalty3EventOpportunity")) {
        failures.push("loyalty-3-builders.ts missing buildLoyalty3EventOpportunity");
      }
      if (!src.includes("buildLoyalty3ReferralStats")) {
        failures.push("loyalty-3-builders.ts missing buildLoyalty3ReferralStats");
      }
      if (!src.includes("buildLoyalty3DashboardSnapshot")) {
        failures.push("loyalty-3-builders.ts missing buildLoyalty3DashboardSnapshot");
      }
    }

    if (rel === "lib/loyalty/loyalty-3-policy.ts") {
      if (!src.includes("LOYALTY_3_POLICY_ID")) {
        failures.push("loyalty-3-policy.ts missing policy id");
      }
      if (!src.includes("LOYALTY_3_PATH")) {
        failures.push("loyalty-3-policy.ts missing route path");
      }
      if (!src.includes("LOYALTY_3_VIP_MULTIPLIER_DEFAULT")) {
        failures.push("loyalty-3-policy.ts missing VIP multiplier default");
      }
    }

    if (rel === "app/dashboard/loyalty/loyalty-3/page.tsx") {
      if (!src.includes("loadLoyalty3DashboardSnapshot")) {
        failures.push("loyalty-3 page missing loadLoyalty3DashboardSnapshot");
      }
      if (!src.includes("Loyalty3Panel")) {
        failures.push("loyalty-3 page missing Loyalty3Panel");
      }
      if (!src.includes("Cross-brand rewards, VIP earn multipliers, catering event bonuses, and referral tracking")) {
        failures.push("loyalty-3 page missing four-pillar copy");
      }
    }

    if (rel === "components/loyalty/loyalty-3-panel.tsx") {
      if (!src.includes("loyalty-3-panel")) {
        failures.push("loyalty-3-panel.tsx missing root test id");
      }
      if (!src.includes("Cross-brand lanes")) {
        failures.push("loyalty-3-panel.tsx missing cross-brand section");
      }
      if (!src.includes("VIP members")) {
        failures.push("loyalty-3-panel.tsx missing VIP section");
      }
      if (!src.includes("Event opportunities")) {
        failures.push("loyalty-3-panel.tsx missing event opportunities section");
      }
      if (!src.includes("Referrals")) {
        failures.push("loyalty-3-panel.tsx missing referrals section");
      }
    }

    if (rel === "actions/loyalty-3.ts") {
      if (!src.includes("saveLoyalty3ConfigAction")) {
        failures.push("loyalty-3.ts missing saveLoyalty3ConfigAction");
      }
      if (!src.includes("saveLoyalty3Config")) {
        failures.push("loyalty-3.ts missing saveLoyalty3Config service call");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveLoyalty3SmokeEra122ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): Loyalty3SmokeEra122ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildLoyalty3SmokeEra122Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): Loyalty3SmokeEra122Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveLoyalty3SmokeEra122ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: Loyalty3SmokeEra122Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: Loyalty3SmokeEra122Step[] = [
    {
      id: "wiring_audit",
      label: "Cross-brand pool → VIP multipliers → event bonuses → referrals",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 122 Loyalty 3.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: LOYALTY_3_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: LOYALTY_3_ERA122_ROUTE,
    pillars: LOYALTY_3_ERA122_PILLARS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires loyalty accounts, multi-brand orders, catering events, and referral conversions.",
  };
}

export function formatLoyalty3SmokeEra122ReportLines(
  summary: Loyalty3SmokeEra122Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Pillars: ${summary.pillars.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
