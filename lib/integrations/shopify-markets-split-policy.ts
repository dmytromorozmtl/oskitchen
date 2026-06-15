import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 37 — split shopify-markets-panel into focused section modules.
 */

export const SHOPIFY_MARKETS_SPLIT_POLICY_ID = "shopify-markets-split-absolute-final-v1" as const;

export const SHOPIFY_MARKETS_PANEL_PATH =
  "components/dashboard/integrations/shopify-markets-panel.tsx" as const;

export const SHOPIFY_MARKETS_SECTIONS = [
  "components/dashboard/integrations/shopify-markets/shopify-markets-action-toolbar.tsx",
  "components/dashboard/integrations/shopify-markets/shopify-markets-routing-section.tsx",
  "components/dashboard/integrations/shopify-markets/shopify-markets-b2b-section.tsx",
  "components/dashboard/integrations/shopify-markets/shopify-markets-sync-section.tsx",
] as const;

export const SHOPIFY_MARKETS_SPLIT_BASELINE_LINES = 1477 as const;

export const SHOPIFY_MARKETS_SPLIT_CI_SCRIPTS = ["test:ci:shopify-markets-split"] as const;

export type ShopifyMarketsSplitAudit = {
  policyId: typeof SHOPIFY_MARKETS_SPLIT_POLICY_ID;
  sectionCount: number;
  sectionLineCounts: Record<(typeof SHOPIFY_MARKETS_SECTIONS)[number], number>;
  panelLineCount: number;
  panelUsesSectionComposition: boolean;
  passed: boolean;
};

function countLines(root: string, relativePath: string): number {
  return readFileSync(join(root, relativePath), "utf8").split("\n").length;
}

export function auditShopifyMarketsSplitFromRoot(root = process.cwd()): ShopifyMarketsSplitAudit {
  const panelSource = readFileSync(join(root, SHOPIFY_MARKETS_PANEL_PATH), "utf8");
  const sectionLineCounts = Object.fromEntries(
    SHOPIFY_MARKETS_SECTIONS.map((path) => [path, countLines(root, path)]),
  ) as ShopifyMarketsSplitAudit["sectionLineCounts"];

  const panelUsesSectionComposition =
    panelSource.includes("<ShopifyMarketsActionToolbar") &&
    panelSource.includes("<ShopifyMarketsRoutingSection") &&
    panelSource.includes("<ShopifyMarketsB2bSection") &&
    panelSource.includes("<ShopifyMarketsSyncSection");

  const panelLineCount = countLines(root, SHOPIFY_MARKETS_PANEL_PATH);

  return {
    policyId: SHOPIFY_MARKETS_SPLIT_POLICY_ID,
    sectionCount: SHOPIFY_MARKETS_SECTIONS.length,
    sectionLineCounts,
    panelLineCount,
    panelUsesSectionComposition,
    passed:
      SHOPIFY_MARKETS_SECTIONS.length === 4 &&
      panelUsesSectionComposition &&
      panelLineCount < SHOPIFY_MARKETS_SPLIT_BASELINE_LINES,
  };
}
