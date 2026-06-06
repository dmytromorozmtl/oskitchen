/**
 * Supplier Marketplace smoke summary — wiring audit (Era 116).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SUPPLIER_MARKETPLACE_ERA116_LANES,
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID,
  SUPPLIER_MARKETPLACE_ERA116_ROUTE,
  SUPPLIER_MARKETPLACE_ERA116_SERVICE,
  SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS,
} from "@/lib/marketplace/supplier-marketplace-era116-policy";

export const SUPPLIER_MARKETPLACE_SMOKE_SUMMARY_VERSION =
  SUPPLIER_MARKETPLACE_ERA116_POLICY_ID;

export type SupplierMarketplaceSmokeEra116Overall = "PASSED" | "FAILED" | "SKIPPED";

export type SupplierMarketplaceSmokeEra116ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type SupplierMarketplaceSmokeEra116Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type SupplierMarketplaceSmokeEra116Summary = {
  version: typeof SUPPLIER_MARKETPLACE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: SupplierMarketplaceSmokeEra116Overall;
  proofStatus: SupplierMarketplaceSmokeEra116ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  lanes: readonly string[];
  steps: SupplierMarketplaceSmokeEra116Step[];
  honestyNote: string;
};

export function auditSupplierMarketplaceSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of SUPPLIER_MARKETPLACE_ERA116_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === SUPPLIER_MARKETPLACE_ERA116_SERVICE) {
      if (!src.includes("loadSupplierMarketplaceDashboard")) {
        failures.push("supplier-marketplace-service.ts missing loadSupplierMarketplaceDashboard");
      }
      if (!src.includes("buildSupplierMarketplaceDashboard")) {
        failures.push("supplier-marketplace-service.ts missing buildSupplierMarketplaceDashboard");
      }
      if (!src.includes("buildSupplierLaneSnapshot")) {
        failures.push("supplier-marketplace-service.ts missing buildSupplierLaneSnapshot");
      }
      if (!src.includes("loadRecentReorderForLane")) {
        failures.push("supplier-marketplace-service.ts missing one-click reorder loader");
      }
      if (!src.includes("SUPPLIER_MARKETPLACE_LANES")) {
        failures.push("supplier-marketplace-service.ts missing lane iteration");
      }
    }

    if (rel === "lib/marketplace/supplier-marketplace-builders.ts") {
      if (!src.includes("buildSupplierLaneSnapshot")) {
        failures.push("supplier-marketplace-builders.ts missing buildSupplierLaneSnapshot");
      }
      if (!src.includes("buildSupplierMarketplaceDashboard")) {
        failures.push("supplier-marketplace-builders.ts missing buildSupplierMarketplaceDashboard");
      }
      if (!src.includes("buildSupplierLaneCatalogHref")) {
        failures.push("supplier-marketplace-builders.ts missing buildSupplierLaneCatalogHref");
      }
    }

    if (rel === "lib/marketplace/supplier-marketplace-policy.ts") {
      if (!src.includes("SUPPLIER_MARKETPLACE_POLICY_ID")) {
        failures.push("supplier-marketplace-policy.ts missing policy id");
      }
      if (!src.includes("SUPPLIER_MARKETPLACE_LANES")) {
        failures.push("supplier-marketplace-policy.ts missing lanes");
      }
      if (!src.includes("SUPPLIER_LANE_CATEGORY_SLUGS")) {
        failures.push("supplier-marketplace-policy.ts missing category slug map");
      }
    }

    if (rel === "actions/marketplace/supplier-reorder.ts") {
      if (!src.includes("oneClickReorderMarketplaceItemAction")) {
        failures.push("supplier-reorder action missing oneClickReorderMarketplaceItemAction");
      }
    }

    if (rel === "app/dashboard/marketplace/page.tsx") {
      if (!src.includes("SupplierMarketplaceLanes")) {
        failures.push("marketplace page missing SupplierMarketplaceLanes");
      }
      if (!src.includes("loadSupplierMarketplaceDashboard")) {
        failures.push("marketplace page missing loadSupplierMarketplaceDashboard");
      }
      if (!src.includes("Supplier Marketplace")) {
        failures.push("marketplace page missing Supplier Marketplace title");
      }
    }

    if (rel === "components/marketplace/supplier-marketplace-lanes.tsx") {
      if (!src.includes("supplier-marketplace-lanes")) {
        failures.push("supplier-marketplace-lanes.tsx missing root test id");
      }
      if (!src.includes("Food, packaging, and equipment")) {
        failures.push("supplier-marketplace-lanes.tsx missing three-lane copy");
      }
      if (!src.includes("SupplierOneClickReorderButton")) {
        failures.push("supplier-marketplace-lanes.tsx missing one-click reorder button");
      }
      if (!src.includes("dashboard.lanes.map")) {
        failures.push("supplier-marketplace-lanes.tsx missing lane cards");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveSupplierMarketplaceSmokeEra116ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): SupplierMarketplaceSmokeEra116ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildSupplierMarketplaceSmokeEra116Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): SupplierMarketplaceSmokeEra116Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveSupplierMarketplaceSmokeEra116ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: SupplierMarketplaceSmokeEra116Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: SupplierMarketplaceSmokeEra116Step[] = [
    {
      id: "wiring_audit",
      label: "Food + packaging + equipment lanes → catalog → one-click reorder",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 116 Supplier Marketplace cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: SUPPLIER_MARKETPLACE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: SUPPLIER_MARKETPLACE_ERA116_ROUTE,
    lanes: SUPPLIER_MARKETPLACE_ERA116_LANES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires seeded marketplace categories, vendor products, and purchase history.",
  };
}

export function formatSupplierMarketplaceSmokeEra116ReportLines(
  summary: SupplierMarketplaceSmokeEra116Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Lanes: ${summary.lanes.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
