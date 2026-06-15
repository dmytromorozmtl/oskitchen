/**
 * Virtual Brand Manager smoke summary — wiring audit (Era 115).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_MANAGER_ERA115_ROUTE,
  VIRTUAL_BRAND_MANAGER_ERA115_SERVICE,
  VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES,
  VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS,
} from "@/lib/enterprise/virtual-brand-manager-era115-policy";

export const VIRTUAL_BRAND_MANAGER_SMOKE_SUMMARY_VERSION =
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID;

export type VirtualBrandManagerSmokeEra115Overall = "PASSED" | "FAILED" | "SKIPPED";

export type VirtualBrandManagerSmokeEra115ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type VirtualBrandManagerSmokeEra115Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type VirtualBrandManagerSmokeEra115Summary = {
  version: typeof VIRTUAL_BRAND_MANAGER_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: VirtualBrandManagerSmokeEra115Overall;
  proofStatus: VirtualBrandManagerSmokeEra115ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  provisionTargetMinutes: number;
  templates: readonly string[];
  steps: VirtualBrandManagerSmokeEra115Step[];
  honestyNote: string;
};

export function auditVirtualBrandManagerSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === VIRTUAL_BRAND_MANAGER_ERA115_SERVICE) {
      if (!src.includes("loadVirtualBrandManagerDashboard")) {
        failures.push("virtual-brand-service.ts missing loadVirtualBrandManagerDashboard");
      }
      if (!src.includes("provisionVirtualBrand")) {
        failures.push("virtual-brand-service.ts missing provisionVirtualBrand");
      }
      if (!src.includes("buildVirtualBrandManagerDashboard")) {
        failures.push("virtual-brand-service.ts missing buildVirtualBrandManagerDashboard");
      }
      if (!src.includes("buildVirtualBrandProvisionResult")) {
        failures.push("virtual-brand-service.ts missing buildVirtualBrandProvisionResult");
      }
      if (!src.includes("GHOST_KITCHEN_BRAND")) {
        failures.push("virtual-brand-service.ts missing virtual concept kinds");
      }
    }

    if (rel === "lib/enterprise/virtual-brand-builders.ts") {
      if (!src.includes("buildVirtualBrandManagerDashboard")) {
        failures.push("virtual-brand-builders.ts missing buildVirtualBrandManagerDashboard");
      }
      if (!src.includes("buildVirtualBrandProvisionSteps")) {
        failures.push("virtual-brand-builders.ts missing buildVirtualBrandProvisionSteps");
      }
      if (!src.includes("buildVirtualBrandTemplateCards")) {
        failures.push("virtual-brand-builders.ts missing buildVirtualBrandTemplateCards");
      }
      if (!src.includes("buildVirtualBrandProvisionResult")) {
        failures.push("virtual-brand-builders.ts missing buildVirtualBrandProvisionResult");
      }
    }

    if (rel === "lib/enterprise/virtual-brand-policy.ts") {
      if (!src.includes("VIRTUAL_BRAND_POLICY_ID")) {
        failures.push("virtual-brand-policy.ts missing policy id");
      }
      if (!src.includes("VIRTUAL_BRAND_PROVISION_TARGET_MINUTES")) {
        failures.push("virtual-brand-policy.ts missing 5-minute provision target");
      }
    }

    if (rel === "actions/virtual-brand.ts") {
      if (!src.includes("provisionVirtualBrandQuick")) {
        failures.push("virtual-brand action missing provisionVirtualBrandQuick");
      }
      if (!src.includes("provisionVirtualBrand")) {
        failures.push("virtual-brand action missing provisionVirtualBrand import");
      }
    }

    if (rel === "app/dashboard/enterprise/virtual-brand/page.tsx") {
      if (!src.includes("VirtualBrandManagerPanel")) {
        failures.push("virtual-brand page missing VirtualBrandManagerPanel");
      }
      if (!src.includes("loadVirtualBrandManagerDashboard")) {
        failures.push("virtual-brand page missing loadVirtualBrandManagerDashboard");
      }
    }

    if (rel === "components/enterprise/virtual-brand-manager-panel.tsx") {
      if (!src.includes("virtual-brand-manager-panel")) {
        failures.push("virtual-brand-manager-panel.tsx missing root test id");
      }
      if (!src.includes("Virtual Brand Manager")) {
        failures.push("virtual-brand-manager-panel.tsx missing title");
      }
      if (!src.includes("provisionVirtualBrandQuick")) {
        failures.push("virtual-brand-manager-panel.tsx missing provision action");
      }
      if (!src.includes("provisionTargetMinutes")) {
        failures.push("virtual-brand-manager-panel.tsx missing provision target copy");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveVirtualBrandManagerSmokeEra115ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): VirtualBrandManagerSmokeEra115ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildVirtualBrandManagerSmokeEra115Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): VirtualBrandManagerSmokeEra115Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveVirtualBrandManagerSmokeEra115ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: VirtualBrandManagerSmokeEra115Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: VirtualBrandManagerSmokeEra115Step[] = [
    {
      id: "wiring_audit",
      label: "Template → provision → starter menu → storefront → launch checklist",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 115 Virtual Brand Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: VIRTUAL_BRAND_MANAGER_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: VIRTUAL_BRAND_MANAGER_ERA115_ROUTE,
    provisionTargetMinutes: VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES,
    templates: VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with menu clone sources and storefront settings.",
  };
}

export function formatVirtualBrandManagerSmokeEra115ReportLines(
  summary: VirtualBrandManagerSmokeEra115Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Provision target: ${summary.provisionTargetMinutes} minutes`,
    `Templates: ${summary.templates.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
