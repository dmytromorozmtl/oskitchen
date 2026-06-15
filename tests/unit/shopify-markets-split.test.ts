import { describe, expect, it } from "vitest";

import {
  SHOPIFY_MARKETS_PANEL_PATH,
  SHOPIFY_MARKETS_SECTIONS,
  SHOPIFY_MARKETS_SPLIT_BASELINE_LINES,
  SHOPIFY_MARKETS_SPLIT_POLICY_ID,
  auditShopifyMarketsSplitFromRoot,
} from "@/lib/integrations/shopify-markets-split-policy";

describe("shopify markets split absolute final (Task 37)", () => {
  it("locks split policy id and four section modules", () => {
    expect(SHOPIFY_MARKETS_SPLIT_POLICY_ID).toBe("shopify-markets-split-absolute-final-v1");
    expect(SHOPIFY_MARKETS_SECTIONS).toHaveLength(4);
    expect(SHOPIFY_MARKETS_PANEL_PATH).toBe(
      "components/dashboard/integrations/shopify-markets-panel.tsx",
    );
  });

  it("composes panel from action, routing, B2B, and sync sections", () => {
    const audit = auditShopifyMarketsSplitFromRoot();
    expect(audit.panelUsesSectionComposition).toBe(true);
    expect(audit.sectionCount).toBe(4);
  });

  it("shrinks shopify-markets-panel below the pre-split baseline", () => {
    const audit = auditShopifyMarketsSplitFromRoot();
    expect(audit.panelLineCount).toBeLessThan(SHOPIFY_MARKETS_SPLIT_BASELINE_LINES);
    expect(audit.passed).toBe(true);
  });
});
