import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditLoyaltyEarnRedeemP262 } from "@/lib/loyalty/loyalty-earn-redeem-p2-62-audit";
import {
  LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT,
  LOYALTY_PROGRAM_LIVE_P2_73_CUSTOMERS_PAGE,
  LOYALTY_PROGRAM_LIVE_P2_73_PANEL,
  LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID,
  LOYALTY_PROGRAM_LIVE_P2_73_POS_CHANNEL_TEST_ID,
  LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT,
  LOYALTY_PROGRAM_LIVE_P2_73_STOREFRONT_CHANNEL_TEST_ID,
  LOYALTY_PROGRAM_LIVE_P2_73_WIRING_PATHS,
} from "@/lib/loyalty/loyalty-program-live-p2-73-policy";
import { runLoyaltyProgramLiveBenchmarkP273 } from "@/lib/loyalty/loyalty-program-live-p2-73-scoring";

export type LoyaltyProgramLiveP273AuditSummary = {
  policyId: typeof LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID;
  wiringComplete: boolean;
  panelWired: boolean;
  customersPageWired: boolean;
  posCheckoutWired: boolean;
  storefrontCheckoutWired: boolean;
  upstreamP262Passed: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditLoyaltyProgramLiveP273(
  root = process.cwd(),
): LoyaltyProgramLiveP273AuditSummary {
  const wiringComplete = LOYALTY_PROGRAM_LIVE_P2_73_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let panelWired = false;
  if (existsSync(join(root, LOYALTY_PROGRAM_LIVE_P2_73_PANEL))) {
    const source = readFileSync(join(root, LOYALTY_PROGRAM_LIVE_P2_73_PANEL), "utf8");
    panelWired =
      source.includes('data-testid="loyalty-program-live-panel"') &&
      source.includes(`data-testid="${LOYALTY_PROGRAM_LIVE_P2_73_POS_CHANNEL_TEST_ID}"`) &&
      source.includes(`data-testid="${LOYALTY_PROGRAM_LIVE_P2_73_STOREFRONT_CHANNEL_TEST_ID}"`);
  }

  let customersPageWired = false;
  if (existsSync(join(root, LOYALTY_PROGRAM_LIVE_P2_73_CUSTOMERS_PAGE))) {
    const source = readFileSync(join(root, LOYALTY_PROGRAM_LIVE_P2_73_CUSTOMERS_PAGE), "utf8");
    customersPageWired =
      source.includes("LoyaltyProgramLivePanel") && source.includes("earn/redeem LIVE");
  }

  let posCheckoutWired = false;
  const posCheckoutPath = join(root, "services/pos/pos-checkout-service.ts");
  if (existsSync(posCheckoutPath)) {
    const source = readFileSync(posCheckoutPath, "utf8");
    posCheckoutWired =
      source.includes("earnLoyaltyPointsForOrder") && source.includes("redeemLoyaltyPoints");
  }

  let storefrontCheckoutWired = false;
  const storefrontPanelPath = join(root, "components/storefront/storefront-loyalty-checkout-panel.tsx");
  if (existsSync(storefrontPanelPath)) {
    const source = readFileSync(storefrontPanelPath, "utf8");
    storefrontCheckoutWired =
      source.includes('data-testid="storefront-loyalty-balance"') &&
      source.includes('data-testid="storefront-loyalty-redeem"');
  }

  const upstreamP262Passed = auditLoyaltyEarnRedeemP262(root).passed;
  const benchmark = runLoyaltyProgramLiveBenchmarkP273();
  const artifactPresent = existsSync(join(root, LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT));

  const passed =
    wiringComplete &&
    panelWired &&
    customersPageWired &&
    posCheckoutWired &&
    storefrontCheckoutWired &&
    upstreamP262Passed &&
    benchmark.passed &&
    artifactPresent &&
    benchmark.scenarioCount === LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT;

  return {
    policyId: LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID,
    wiringComplete,
    panelWired,
    customersPageWired,
    posCheckoutWired,
    storefrontCheckoutWired,
    upstreamP262Passed,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatLoyaltyProgramLiveP273AuditLines(
  summary: LoyaltyProgramLiveP273AuditSummary,
): string[] {
  return [
    `Loyalty program LIVE (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Live panel: ${summary.panelWired ? "yes" : "no"}`,
    `Customers page: ${summary.customersPageWired ? "wired" : "missing"}`,
    `POS checkout: ${summary.posCheckoutWired ? "wired" : "missing"}`,
    `Storefront checkout: ${summary.storefrontCheckoutWired ? "wired" : "missing"}`,
    `Upstream P2-62: ${summary.upstreamP262Passed ? "passed" : "failed"}`,
    `Flow benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
