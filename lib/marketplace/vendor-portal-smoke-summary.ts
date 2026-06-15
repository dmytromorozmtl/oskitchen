/**
 * Vendor Portal 2.0 smoke summary — wiring audit (Era 117).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VENDOR_PORTAL_ERA117_MODULES,
  VENDOR_PORTAL_ERA117_POLICY_ID,
  VENDOR_PORTAL_ERA117_ROUTE,
  VENDOR_PORTAL_ERA117_SERVICE,
  VENDOR_PORTAL_ERA117_WIRING_PATHS,
} from "@/lib/marketplace/vendor-portal-era117-policy";

export const VENDOR_PORTAL_SMOKE_SUMMARY_VERSION = VENDOR_PORTAL_ERA117_POLICY_ID;

export type VendorPortalSmokeEra117Overall = "PASSED" | "FAILED" | "SKIPPED";

export type VendorPortalSmokeEra117ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type VendorPortalSmokeEra117Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type VendorPortalSmokeEra117Summary = {
  version: typeof VENDOR_PORTAL_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: VendorPortalSmokeEra117Overall;
  proofStatus: VendorPortalSmokeEra117ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  modules: readonly string[];
  steps: VendorPortalSmokeEra117Step[];
  honestyNote: string;
};

export function auditVendorPortalSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of VENDOR_PORTAL_ERA117_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === VENDOR_PORTAL_ERA117_SERVICE) {
      if (!src.includes("loadVendorPortalHub")) {
        failures.push("vendor-portal-service.ts missing loadVendorPortalHub");
      }
      if (!src.includes("loadVendorInvoices")) {
        failures.push("vendor-portal-service.ts missing loadVendorInvoices");
      }
      if (!src.includes("buildVendorPortalHub")) {
        failures.push("vendor-portal-service.ts missing buildVendorPortalHub");
      }
      if (!src.includes("marketplacePurchaseOrder")) {
        failures.push("vendor-portal-service.ts missing orders query");
      }
      if (!src.includes("vendorTransaction")) {
        failures.push("vendor-portal-service.ts missing invoice transactions");
      }
    }

    if (rel === "lib/marketplace/vendor-portal-builders.ts") {
      if (!src.includes("buildVendorOrdersModule")) {
        failures.push("vendor-portal-builders.ts missing buildVendorOrdersModule");
      }
      if (!src.includes("buildVendorInvoicesModule")) {
        failures.push("vendor-portal-builders.ts missing buildVendorInvoicesModule");
      }
      if (!src.includes("buildVendorAnalyticsModule")) {
        failures.push("vendor-portal-builders.ts missing buildVendorAnalyticsModule");
      }
      if (!src.includes("buildVendorPortalHub")) {
        failures.push("vendor-portal-builders.ts missing buildVendorPortalHub");
      }
    }

    if (rel === "lib/marketplace/vendor-portal-policy.ts") {
      if (!src.includes("VENDOR_PORTAL_POLICY_ID")) {
        failures.push("vendor-portal-policy.ts missing policy id");
      }
      if (!src.includes("VENDOR_PORTAL_MODULES")) {
        failures.push("vendor-portal-policy.ts missing modules");
      }
      if (!src.includes("vendor-portal-v2")) {
        failures.push("vendor-portal-policy.ts missing v2 policy id");
      }
    }

    if (rel === "app/vendor/(cabinet)/dashboard/page.tsx") {
      if (!src.includes("VendorPortalHub")) {
        failures.push("vendor dashboard page missing VendorPortalHub");
      }
      if (!src.includes("loadVendorPortalHub")) {
        failures.push("vendor dashboard page missing loadVendorPortalHub");
      }
      if (!src.includes("Vendor Portal 2.0")) {
        failures.push("vendor dashboard page missing Vendor Portal 2.0 copy");
      }
    }

    if (rel === "app/vendor/(cabinet)/orders/page.tsx") {
      if (!src.includes("loadVendorOrders")) {
        failures.push("vendor orders page missing loadVendorOrders");
      }
      if (!src.includes("vendor.orders.list")) {
        failures.push("vendor orders page missing RBAC operation");
      }
    }

    if (rel === "app/vendor/(cabinet)/invoices/page.tsx") {
      if (!src.includes("loadVendorInvoices")) {
        failures.push("vendor invoices page missing loadVendorInvoices");
      }
      if (!src.includes("VendorInvoicesClient")) {
        failures.push("vendor invoices page missing VendorInvoicesClient");
      }
    }

    if (rel === "app/vendor/(cabinet)/analytics/page.tsx") {
      if (!src.includes("loadVendorAnalytics")) {
        failures.push("vendor analytics page missing loadVendorAnalytics");
      }
      if (!src.includes("VendorAnalyticsClient")) {
        failures.push("vendor analytics page missing VendorAnalyticsClient");
      }
    }

    if (rel === "components/marketplace/vendor-portal-hub.tsx") {
      if (!src.includes("vendor-portal-hub")) {
        failures.push("vendor-portal-hub.tsx missing root test id");
      }
      if (!src.includes("Vendor Portal 2.0")) {
        failures.push("vendor-portal-hub.tsx missing title");
      }
      if (!src.includes("Orders inbox, commission invoices, and sales analytics")) {
        failures.push("vendor-portal-hub.tsx missing three-module copy");
      }
      if (!src.includes("hub.modules.map")) {
        failures.push("vendor-portal-hub.tsx missing module cards");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveVendorPortalSmokeEra117ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): VendorPortalSmokeEra117ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildVendorPortalSmokeEra117Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): VendorPortalSmokeEra117Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveVendorPortalSmokeEra117ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: VendorPortalSmokeEra117Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: VendorPortalSmokeEra117Step[] = [
    {
      id: "wiring_audit",
      label: "Orders + invoices + analytics → three modules → vendor hub",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 117 Vendor Portal 2.0 cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: VENDOR_PORTAL_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: VENDOR_PORTAL_ERA117_ROUTE,
    modules: VENDOR_PORTAL_ERA117_MODULES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires approved vendor account with marketplace orders and transactions.",
  };
}

export function formatVendorPortalSmokeEra117ReportLines(
  summary: VendorPortalSmokeEra117Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Modules: ${summary.modules.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
