import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_FOOD_COST_MANAGER_ERA108_CANONICAL_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES,
  AI_FOOD_COST_MANAGER_ERA108_POLICY_ID,
  AI_FOOD_COST_MANAGER_ERA108_ROUTE,
  AI_FOOD_COST_MANAGER_ERA108_SERVICE,
  AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT,
  AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS,
} from "@/lib/ai/food-cost-manager-era108-policy";
import {
  auditAiFoodCostManagerSmokeWiring,
  buildAiFoodCostManagerSmokeEra108Summary,
  resolveAiFoodCostManagerSmokeEra108ProofStatus,
} from "@/lib/ai/food-cost-manager-smoke-summary";
import {
  AI_FOOD_COST_MANAGER_POLICY_ID,
  AI_FOOD_COST_MANAGER_SERVICE,
} from "@/lib/ai/food-cost-manager-policy";

const ROOT = process.cwd();

describe("ai food cost manager era108", () => {
  it("locks era108 policy and artifact path", () => {
    expect(AI_FOOD_COST_MANAGER_ERA108_POLICY_ID).toBe("era108-ai-food-cost-manager-v1");
    expect(AI_FOOD_COST_MANAGER_ERA108_SUMMARY_ARTIFACT).toBe(
      "artifacts/ai-food-cost-manager-smoke-summary.json",
    );
    expect(AI_FOOD_COST_MANAGER_ERA108_ROUTE).toBe("/dashboard/analytics/food-cost");
    expect(AI_FOOD_COST_MANAGER_ERA108_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era108 with canonical food cost manager policy", () => {
    expect(AI_FOOD_COST_MANAGER_ERA108_CANONICAL_POLICY_ID).toBe(AI_FOOD_COST_MANAGER_POLICY_ID);
    expect(AI_FOOD_COST_MANAGER_ERA108_SERVICE).toBe(AI_FOOD_COST_MANAGER_SERVICE);
  });

  it("audits in-repo AI Food Cost Manager wiring", () => {
    const audit = auditAiFoodCostManagerSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of AI_FOOD_COST_MANAGER_ERA108_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes real-time margin, profit per item, and price recommendation wiring", () => {
    const builders = readFileSync(join(ROOT, "lib/ai/food-cost-builders.ts"), "utf8");
    expect(builders).toContain("computeRealTimeMarginPercent");
    expect(builders).toContain("buildPriceRecommendation");

    const dashboard = readFileSync(
      join(ROOT, "components/dashboard/food-cost-dashboard.tsx"),
      "utf8",
    );
    expect(dashboard).toContain("food-cost-manager-daily-brief");
    expect(dashboard).toContain("realTimeMarginPercent");
    expect(dashboard).toContain("profitPerItem");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveAiFoodCostManagerSmokeEra108ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveAiFoodCostManagerSmokeEra108ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildAiFoodCostManagerSmokeEra108Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("price_recommendations");
  });
});
