/**
 * Blueprint P1-67 — Marketplace empty states design (illustration + value prop + CTA).
 *
 * @see components/marketplace/marketplace-empty-state.tsx
 * @see components/marketplace/marketplace-empty-state-illustration.tsx
 */

import { cn } from "@/lib/utils";
import type { MarketplaceEmptyStateScenario } from "@/lib/marketplace/marketplace-empty-states-policy";
import {
  DESIGN_TOKEN_CAPTION_CLASS,
  DESIGN_TOKEN_SECTION_GAP_CLASS,
} from "@/lib/design/design-token-pass-policy";

export const MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID =
  "marketplace-empty-states-design-p1-67-v1" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE =
  "components/marketplace/marketplace-empty-state.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE =
  "components/marketplace/marketplace-empty-state-illustration.tsx" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID =
  "marketplace-empty-illustration" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID =
  "marketplace-empty-value-props" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID = "marketplace-empty-cta" as const;

/** Core empty scenarios — no vendors, orders, or catalog products. */
export const MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS = [
  "vendors_empty",
  "orders_empty",
  "catalog_empty",
  "cart_empty",
] as const satisfies readonly MarketplaceEmptyStateScenario[];

export type MarketplaceEmptyStateIllustrationKind =
  | "vendors"
  | "orders"
  | "catalog"
  | "cart"
  | "discovery";

export const MARKETPLACE_EMPTY_STATE_ILLUSTRATION_BY_SCENARIO: Record<
  MarketplaceEmptyStateScenario,
  MarketplaceEmptyStateIllustrationKind
> = {
  vendors_empty: "vendors",
  featured_vendors: "vendors",
  orders_empty: "orders",
  orders_filtered: "orders",
  pending_actions: "orders",
  catalog_empty: "catalog",
  catalog_filtered: "catalog",
  lane_products: "catalog",
  cart_empty: "cart",
  order_again: "cart",
  recommendations: "discovery",
  popular_region: "discovery",
  new_arrivals: "discovery",
  dashboard_unavailable: "vendors",
};

/** Illustration frame — soft gradient plate behind SVG art. */
export const MARKETPLACE_EMPTY_STATE_ILLUSTRATION_FRAME_CLASS = cn(
  "relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl",
  "border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-muted/30",
  "shadow-sm sm:mx-0",
);

export const MARKETPLACE_EMPTY_STATE_ILLUSTRATION_INLINE_FRAME_CLASS = cn(
  MARKETPLACE_EMPTY_STATE_ILLUSTRATION_FRAME_CLASS,
  "h-24 w-24",
);

export const MARKETPLACE_EMPTY_STATE_VALUE_PROP_LIST_CLASS = cn(
  "space-y-2 text-left",
  DESIGN_TOKEN_CAPTION_CLASS,
);

export const MARKETPLACE_EMPTY_STATE_VALUE_PROP_BULLET_CLASS =
  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" as const;

export const MARKETPLACE_EMPTY_STATE_CTA_ROW_CLASS = cn(
  "flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap",
  DESIGN_TOKEN_SECTION_GAP_CLASS,
);

export const MARKETPLACE_EMPTY_STATES_DESIGN_AUDIT_SCRIPT =
  "scripts/audit-marketplace-empty-states-design.ts" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_NPM_SCRIPT =
  "audit:marketplace-empty-states-design" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_UNIT_TEST =
  "tests/unit/marketplace-empty-states-design.test.ts" as const;

export const MARKETPLACE_EMPTY_STATES_DESIGN_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export function resolveMarketplaceEmptyStateIllustrationKind(
  scenario: MarketplaceEmptyStateScenario,
): MarketplaceEmptyStateIllustrationKind {
  return MARKETPLACE_EMPTY_STATE_ILLUSTRATION_BY_SCENARIO[scenario];
}
