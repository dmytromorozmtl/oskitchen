/**
 * Unified Customer Profile smoke summary — wiring audit (Era 121).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  UNIFIED_PROFILE_ERA121_POLICY_ID,
  UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS,
  UNIFIED_PROFILE_ERA121_ROUTE,
  UNIFIED_PROFILE_ERA121_WIRING_PATHS,
} from "@/lib/crm/unified-profile-era121-policy";
import { UNIFIED_PROFILE_SERVICE } from "@/lib/crm/unified-profile-policy";

export const UNIFIED_PROFILE_SMOKE_SUMMARY_VERSION = UNIFIED_PROFILE_ERA121_POLICY_ID;

export type UnifiedProfileSmokeEra121Overall = "PASSED" | "FAILED" | "SKIPPED";

export type UnifiedProfileSmokeEra121ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type UnifiedProfileSmokeEra121Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type UnifiedProfileSmokeEra121Summary = {
  version: typeof UNIFIED_PROFILE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: UnifiedProfileSmokeEra121Overall;
  proofStatus: UnifiedProfileSmokeEra121ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  sections: readonly string[];
  steps: UnifiedProfileSmokeEra121Step[];
  honestyNote: string;
};

export function auditUnifiedProfileSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of UNIFIED_PROFILE_ERA121_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === UNIFIED_PROFILE_SERVICE) {
      if (!src.includes("loadUnifiedCustomerProfileSnapshot")) {
        failures.push("unified-profile-service.ts missing loadUnifiedCustomerProfileSnapshot");
      }
      if (!src.includes("loadUnifiedProfileHubSnapshot")) {
        failures.push("unified-profile-service.ts missing loadUnifiedProfileHubSnapshot");
      }
      if (!src.includes("buildUnifiedCustomerProfileSnapshot")) {
        failures.push("unified-profile-service.ts missing buildUnifiedCustomerProfileSnapshot");
      }
      if (!src.includes("buildUnifiedProfileHubSnapshot")) {
        failures.push("unified-profile-service.ts missing buildUnifiedProfileHubSnapshot");
      }
      if (!src.includes("listOrdersForCustomer")) {
        failures.push("unified-profile-service.ts missing order history loader");
      }
    }

    if (rel === "lib/crm/unified-profile-builders.ts") {
      if (!src.includes("buildUnifiedCustomerProfileSnapshot")) {
        failures.push("unified-profile-builders.ts missing buildUnifiedCustomerProfileSnapshot");
      }
      if (!src.includes("buildUnifiedProfileHubSnapshot")) {
        failures.push("unified-profile-builders.ts missing buildUnifiedProfileHubSnapshot");
      }
      if (!src.includes("buildUnifiedProfileOrderRow")) {
        failures.push("unified-profile-builders.ts missing buildUnifiedProfileOrderRow");
      }
      if (!src.includes("buildUnifiedProfileLoyaltySnapshot")) {
        failures.push("unified-profile-builders.ts missing buildUnifiedProfileLoyaltySnapshot");
      }
      if (!src.includes("buildUnifiedProfileTimelineRow")) {
        failures.push("unified-profile-builders.ts missing buildUnifiedProfileTimelineRow");
      }
    }

    if (rel === "lib/crm/unified-profile-policy.ts") {
      if (!src.includes("UNIFIED_PROFILE_POLICY_ID")) {
        failures.push("unified-profile-policy.ts missing policy id");
      }
      if (!src.includes("UNIFIED_PROFILE_PATH")) {
        failures.push("unified-profile-policy.ts missing route path");
      }
      if (!src.includes("UNIFIED_PROFILE_ORDER_LIMIT")) {
        failures.push("unified-profile-policy.ts missing order limit");
      }
    }

    if (rel === "app/dashboard/customers/unified-profile/page.tsx") {
      if (!src.includes("loadUnifiedProfileHubSnapshot")) {
        failures.push("unified-profile hub page missing loadUnifiedProfileHubSnapshot");
      }
      if (!src.includes("Unified Customer Profiles")) {
        failures.push("unified-profile hub page missing title copy");
      }
      if (!src.includes("Orders, dietary preferences, activity history, and loyalty")) {
        failures.push("unified-profile hub page missing four-pillar copy");
      }
      if (!src.includes("Top customers")) {
        failures.push("unified-profile hub page missing top customers list");
      }
    }

    if (rel === "app/dashboard/customers/unified-profile/[customerId]/page.tsx") {
      if (!src.includes("loadUnifiedCustomerProfileSnapshot")) {
        failures.push("unified-profile detail page missing loadUnifiedCustomerProfileSnapshot");
      }
      if (!src.includes("UnifiedCustomerProfilePanel")) {
        failures.push("unified-profile detail page missing UnifiedCustomerProfilePanel");
      }
      if (!src.includes("Unified profile")) {
        failures.push("unified-profile detail page missing unified profile copy");
      }
    }

    if (rel === "components/crm/unified-customer-profile-panel.tsx") {
      if (!src.includes("unified-customer-profile-panel")) {
        failures.push("unified-customer-profile-panel.tsx missing root test id");
      }
      if (!src.includes("Order history")) {
        failures.push("unified-customer-profile-panel.tsx missing order history section");
      }
      if (!src.includes("Identity &amp; preferences")) {
        failures.push("unified-customer-profile-panel.tsx missing preferences section");
      }
      if (!src.includes("Activity history")) {
        failures.push("unified-customer-profile-panel.tsx missing activity history section");
      }
      if (!src.includes("Loyalty")) {
        failures.push("unified-customer-profile-panel.tsx missing loyalty section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveUnifiedProfileSmokeEra121ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): UnifiedProfileSmokeEra121ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildUnifiedProfileSmokeEra121Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): UnifiedProfileSmokeEra121Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveUnifiedProfileSmokeEra121ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: UnifiedProfileSmokeEra121Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: UnifiedProfileSmokeEra121Step[] = [
    {
      id: "wiring_audit",
      label: "Orders → preferences → history → loyalty unified customer view",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 121 Unified Customer Profile cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: UNIFIED_PROFILE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: UNIFIED_PROFILE_ERA121_ROUTE,
    sections: UNIFIED_PROFILE_ERA121_PROFILE_SECTIONS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires tenant customers with orders, loyalty accounts, and timeline events.",
  };
}

export function formatUnifiedProfileSmokeEra121ReportLines(
  summary: UnifiedProfileSmokeEra121Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Sections: ${summary.sections.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
