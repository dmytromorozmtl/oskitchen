import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import {
  auditMarketplaceEmptyStatesPolicy,
  getMarketplaceEmptyStateDefinition,
  MARKETPLACE_EMPTY_STATE_SCENARIOS,
  MARKETPLACE_EMPTY_STATE_WIRED_MODULES,
  MARKETPLACE_EMPTY_STATES_POLICY_ID,
} from "@/lib/marketplace/marketplace-empty-states-policy";

const ROOT = process.cwd();

describe("marketplace empty states (P1-25)", () => {
  it("locks policy with primary CTAs and value props for every scenario", () => {
    expect(MARKETPLACE_EMPTY_STATES_POLICY_ID).toBe("marketplace-empty-states-p1-25-v1");
    const audit = auditMarketplaceEmptyStatesPolicy();
    expect(audit.passed).toBe(true);
    expect(audit.scenarioCount).toBe(MARKETPLACE_EMPTY_STATE_SCENARIOS.length);
  });

  it.each(MARKETPLACE_EMPTY_STATE_SCENARIOS)(
    "scenario %s defines engaging copy and CTA href",
    (scenario) => {
      const def = getMarketplaceEmptyStateDefinition(scenario);
      expect(def.primaryLabel.length).toBeGreaterThan(0);
      expect(def.primaryHref.startsWith("/dashboard/marketplace")).toBe(true);
      expect(def.valueProps.length).toBeGreaterThanOrEqual(2);
      expect(def.title.length).toBeGreaterThan(10);
      expect(def.description.length).toBeGreaterThan(20);
    },
  );

  it.each(MARKETPLACE_EMPTY_STATE_WIRED_MODULES)(
    "wired module %s imports MarketplaceEmptyState or policy",
    (modulePath) => {
      expect(existsSync(join(ROOT, modulePath)), modulePath).toBe(true);
      const source = readFileSync(join(ROOT, modulePath), "utf8");
      expect(
        source.includes("MarketplaceEmptyState") ||
          source.includes("MarketplaceLaneEmptyState") ||
          source.includes("getMarketplaceEmptyStateDefinition"),
      ).toBe(true);
    },
  );
});
