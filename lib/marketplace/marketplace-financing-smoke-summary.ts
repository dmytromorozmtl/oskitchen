/**
 * Marketplace Financing smoke summary — wiring audit (Era 119).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_FINANCING_ERA119_POLICY_ID,
  MARKETPLACE_FINANCING_ERA119_PRODUCTS,
  MARKETPLACE_FINANCING_ERA119_ROUTE,
  MARKETPLACE_FINANCING_ERA119_SERVICE,
  MARKETPLACE_FINANCING_ERA119_WIRING_PATHS,
} from "@/lib/marketplace/marketplace-financing-era119-policy";

export const MARKETPLACE_FINANCING_SMOKE_SUMMARY_VERSION =
  MARKETPLACE_FINANCING_ERA119_POLICY_ID;

export type MarketplaceFinancingSmokeEra119Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MarketplaceFinancingSmokeEra119ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MarketplaceFinancingSmokeEra119Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MarketplaceFinancingSmokeEra119Summary = {
  version: typeof MARKETPLACE_FINANCING_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MarketplaceFinancingSmokeEra119Overall;
  proofStatus: MarketplaceFinancingSmokeEra119ProofStatus;
  wiringCertPassed: boolean;
  route: string;
  products: readonly string[];
  steps: MarketplaceFinancingSmokeEra119Step[];
  honestyNote: string;
};

export function auditMarketplaceFinancingSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of MARKETPLACE_FINANCING_ERA119_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === MARKETPLACE_FINANCING_ERA119_SERVICE) {
      if (!src.includes("loadMarketplaceFinancingSnapshot")) {
        failures.push("financing.ts missing loadMarketplaceFinancingSnapshot");
      }
      if (!src.includes("buildMarketplaceFinancingSnapshot")) {
        failures.push("financing.ts missing buildMarketplaceFinancingSnapshot");
      }
      if (!src.includes("buildNetTermsTermProducts")) {
        failures.push("financing.ts missing buildNetTermsTermProducts");
      }
      if (!src.includes("buildEarlyPaymentOffers")) {
        failures.push("financing.ts missing buildEarlyPaymentOffers");
      }
      if (!src.includes("buildFactoringOffers")) {
        failures.push("financing.ts missing buildFactoringOffers");
      }
      if (!src.includes("setMarketplaceNetTermsDays")) {
        failures.push("financing.ts missing setMarketplaceNetTermsDays");
      }
    }

    if (rel === "lib/marketplace/financing-builders.ts") {
      if (!src.includes("buildNetTermsTermProducts")) {
        failures.push("financing-builders.ts missing buildNetTermsTermProducts");
      }
      if (!src.includes("buildEarlyPaymentOffers")) {
        failures.push("financing-builders.ts missing buildEarlyPaymentOffers");
      }
      if (!src.includes("buildFactoringOffers")) {
        failures.push("financing-builders.ts missing buildFactoringOffers");
      }
      if (!src.includes("buildMarketplaceFinancingSnapshot")) {
        failures.push("financing-builders.ts missing buildMarketplaceFinancingSnapshot");
      }
    }

    if (rel === "lib/marketplace/financing-policy.ts") {
      if (!src.includes("MARKETPLACE_FINANCING_POLICY_ID")) {
        failures.push("financing-policy.ts missing policy id");
      }
      if (!src.includes("MARKETPLACE_NET_TERMS_OPTIONS")) {
        failures.push("financing-policy.ts missing net terms options");
      }
      if (!src.includes("MARKETPLACE_EARLY_PAYMENT_DISCOUNT_PERCENT")) {
        failures.push("financing-policy.ts missing early payment discount");
      }
      if (!src.includes("MARKETPLACE_FACTORING_MIN_EXPOSURE_USD")) {
        failures.push("financing-policy.ts missing factoring threshold");
      }
    }

    if (rel === "actions/marketplace/financing.ts") {
      if (!src.includes("selectMarketplaceNetTermsAction")) {
        failures.push("financing action missing selectMarketplaceNetTermsAction");
      }
      if (!src.includes("setMarketplaceNetTermsDays")) {
        failures.push("financing action missing setMarketplaceNetTermsDays");
      }
    }

    if (rel === "app/dashboard/marketplace/financing/page.tsx") {
      if (!src.includes("MarketplaceFinancingPanel")) {
        failures.push("financing page missing MarketplaceFinancingPanel");
      }
      if (!src.includes("loadMarketplaceFinancingSnapshot")) {
        failures.push("financing page missing loadMarketplaceFinancingSnapshot");
      }
      if (!src.includes("Marketplace Financing")) {
        failures.push("financing page missing title");
      }
    }

    if (rel === "components/marketplace/marketplace-financing-panel.tsx") {
      if (!src.includes("marketplace-financing-panel")) {
        failures.push("marketplace-financing-panel.tsx missing root test id");
      }
      if (!src.includes("selectMarketplaceNetTermsAction")) {
        failures.push("marketplace-financing-panel.tsx missing net terms action");
      }
      if (!src.includes("Net terms — 30 / 60 / 90")) {
        failures.push("marketplace-financing-panel.tsx missing net terms section");
      }
      if (!src.includes("Early payment")) {
        failures.push("marketplace-financing-panel.tsx missing early payment section");
      }
      if (!src.includes("Invoice factoring")) {
        failures.push("marketplace-financing-panel.tsx missing factoring section");
      }
    }
  }

  return { ok: failures.length === 0, failures };
}

export function resolveMarketplaceFinancingSmokeEra119ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MarketplaceFinancingSmokeEra119ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMarketplaceFinancingSmokeEra119Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
}): MarketplaceFinancingSmokeEra119Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveMarketplaceFinancingSmokeEra119ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MarketplaceFinancingSmokeEra119Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MarketplaceFinancingSmokeEra119Step[] = [
    {
      id: "wiring_audit",
      label: "Net-30/60/90 + early payment + factoring → financing snapshot",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 119 Marketplace Financing cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: MARKETPLACE_FINANCING_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    route: MARKETPLACE_FINANCING_ERA119_ROUTE,
    products: MARKETPLACE_FINANCING_ERA119_PRODUCTS,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires credit line, net-terms POs, and payment schedules.",
  };
}

export function formatMarketplaceFinancingSmokeEra119ReportLines(
  summary: MarketplaceFinancingSmokeEra119Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Route: ${summary.route}`,
    `Products: ${summary.products.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
