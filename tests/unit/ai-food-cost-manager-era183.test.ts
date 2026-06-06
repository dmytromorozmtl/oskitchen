import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AI_FOOD_COST_MANAGER_ERA108_POLICY_ID } from "@/lib/ai/food-cost-manager-era108-policy";
import {
  AI_FOOD_COST_MANAGER_ERA183_CANONICAL_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA183_CAPABILITIES,
  AI_FOOD_COST_MANAGER_ERA183_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA183_ROUTE,
  AI_FOOD_COST_MANAGER_ERA183_SERVICE,
  AI_FOOD_COST_MANAGER_ERA183_SUMMARY_ARTIFACT,
  AI_FOOD_COST_MANAGER_ERA183_WIRING_PATHS,
} from "@/lib/ai/food-cost-manager-era183-policy";
import {
  auditAiFoodCostManagerSmokeEra183Wiring,
  buildAiFoodCostManagerSmokeEra183Summary,
  resolveAiFoodCostManagerSmokeEra183ProofStatus,
} from "@/lib/ai/food-cost-manager-era183-smoke-summary";
import {
  AI_FOOD_COST_MANAGER_POLICY_ID,
  AI_FOOD_COST_MANAGER_SERVICE,
} from "@/lib/ai/food-cost-manager-policy";

const ROOT = process.cwd();

describe("ai food cost manager era183", () => {
  it("locks era183 policy and artifact path", () => {
    expect(AI_FOOD_COST_MANAGER_ERA183_POLICY_ID).toBe("era183-ai-food-cost-manager-v1");
    expect(AI_FOOD_COST_MANAGER_ERA183_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-food-cost-manager-era183-smoke-summary.json",
    );
    expect(AI_FOOD_COST_MANAGER_ERA183_ROUTE).toBe("/dashboard/analytics/food-cost");
    expect(AI_FOOD_COST_MANAGER_ERA183_WIRING_PATHS).toHaveLength(6);
    expect(AI_FOOD_COST_MANAGER_ERA183_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era183 with canonical AI Food Cost Manager policy", () => {
    expect(AI_FOOD_COST_MANAGER_ERA183_CANONICAL_POLICY_ID).toBe(
      AI_FOOD_COST_MANAGER_ERA108_POLICY_ID,
    );
    expect(AI_FOOD_COST_MANAGER_ERA183_SERVICE).toBe(AI_FOOD_COST_MANAGER_SERVICE);
    expect(AI_FOOD_COST_MANAGER_POLICY_ID).toBe("ai-food-cost-manager-v1");
  });

  it("audits in-repo AI Food Cost Manager Round 2 wiring", () => {
    const audit = auditAiFoodCostManagerSmokeEra183Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_FOOD_COST_MANAGER_ERA183_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes real-time margin, profit per item, and price recommendation wiring", () => {
    const service = readFileSync(join(ROOT, AI_FOOD_COST_MANAGER_ERA183_SERVICE), "utf8");
    expect(service).toContain("analyzeFoodCost");
    expect(service).toContain("generateFoodCostManagerDailyBrief");

    const builders = readFileSync(join(ROOT, "lib/ai/food-cost-builders.ts"), "utf8");
    expect(builders).toContain("computeRealTimeMarginPercent");
    expect(builders).toContain("computeProfitPerItem");
    expect(builders).toContain("buildPriceRecommendation");

    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/food-cost-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("food-cost-manager-daily-brief");
    expect(dashboard).toContain("realTimeMarginPercent");
    expect(dashboard).toContain("profitPerItem");
    expect(dashboard).toContain("priceRecommendation");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiFoodCostManagerSmokeEra183ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiFoodCostManagerSmokeEra183ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiFoodCostManagerSmokeEra183Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("real_time_margin");
    expect(summary.capabilities).toContain("per_item_profit");
    expect(summary.capabilities).toContain("price_recommendations");
  });
});
