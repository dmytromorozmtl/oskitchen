/**
 * Absolute Final Task 95 — white-label storefront depth (ChowNow parity).
 *
 * @see app/dashboard/storefront/white-label/page.tsx
 * @see components/dashboard/storefront/white-label-storefront-depth-panel.tsx
 */

export const WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID =
  "white-label-storefront-depth-absolute-final-v1" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_ROUTE =
  "/dashboard/storefront/white-label" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH =
  "app/dashboard/storefront/white-label/page.tsx" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH =
  "components/dashboard/storefront/white-label-storefront-depth-panel.tsx" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_SERVICE_PATH =
  "services/storefront/white-label-storefront-depth-service.ts" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_CONTENT_PATH =
  "lib/storefront/white-label-storefront-depth-content.ts" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_STRIP_PATH =
  "components/dashboard/storefront/white-label-storefront-depth-strip.tsx" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_SETTINGS_PAGE =
  "app/dashboard/settings/white-label/page.tsx" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS = [
  "branded_theme_tokens",
  "custom_domain_routing",
  "commission_free_direct_ordering",
  "catering_group_pages",
  "branded_pwa_install",
] as const;

export type WhiteLabelDepthMaturity = "LIVE" | "BETA" | "SKIPPED" | "ROADMAP";

export type WhiteLabelDepthCapability = {
  id: string;
  pillar: (typeof WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS)[number];
  label: string;
  chowNowLabel: string;
  maturity: WhiteLabelDepthMaturity;
  detail: string;
  manageHref: string;
};

export type WhiteLabelStorefrontDepthSummary = {
  liveCount: number;
  betaCount: number;
  skippedCount: number;
  roadmapCount: number;
  readinessPercent: number;
  hasLogo: boolean;
  hasBrandColor: boolean;
  hasCustomDomain: boolean;
  pwaPublished: boolean;
  storefrontUrl: string | null;
  previewThemeColor: string;
};

export type WhiteLabelStorefrontDepthModel = {
  policyId: typeof WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID;
  restaurantName: string;
  summary: WhiteLabelStorefrontDepthSummary;
  capabilities: WhiteLabelDepthCapability[];
  refreshedAt: string;
};

export const WHITE_LABEL_STOREFRONT_DEPTH_REQUIRED_MARKERS = [
  'data-testid="white-label-storefront-depth-panel"',
  "WhiteLabelStorefrontDepthPanel",
] as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS = [
  "BETA",
  "SKIPPED",
  "ChowNow parity",
  "DNS is not automatic",
  "Do not promise custom domains",
] as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_WIRING_PATHS = [
  WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_SERVICE_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_CONTENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_STRIP_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_SETTINGS_PAGE,
  "lib/storefront/white-label-storefront-depth-absolute-final-policy.ts",
  "lib/storefront/white-label-storefront-depth-audit.ts",
  "tests/unit/white-label-storefront-depth-absolute-final.test.ts",
] as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_UNIT_TEST =
  "tests/unit/white-label-storefront-depth-absolute-final.test.ts" as const;

export const WHITE_LABEL_STOREFRONT_DEPTH_CI_SCRIPTS = [
  "test:ci:white-label-storefront-depth",
  "test:ci:white-label-storefront-depth:cert",
] as const;

export function countWhiteLabelDepthByMaturity(
  capabilities: readonly WhiteLabelDepthCapability[],
): Pick<
  WhiteLabelStorefrontDepthSummary,
  "liveCount" | "betaCount" | "skippedCount" | "roadmapCount"
> {
  return {
    liveCount: capabilities.filter((c) => c.maturity === "LIVE").length,
    betaCount: capabilities.filter((c) => c.maturity === "BETA").length,
    skippedCount: capabilities.filter((c) => c.maturity === "SKIPPED").length,
    roadmapCount: capabilities.filter((c) => c.maturity === "ROADMAP").length,
  };
}

export function computeWhiteLabelDepthReadinessPercent(
  capabilities: readonly WhiteLabelDepthCapability[],
): number {
  if (capabilities.length === 0) return 0;
  const weighted = capabilities.reduce((sum, cap) => {
    if (cap.maturity === "LIVE") return sum + 100;
    if (cap.maturity === "BETA") return sum + 70;
    if (cap.maturity === "ROADMAP") return sum + 20;
    return sum;
  }, 0);
  return Math.round(weighted / capabilities.length);
}

export function resolveWhiteLabelCustomDomainConfigured(
  customDomain: string | null | undefined,
  primaryDomainMode: string | null | undefined,
): boolean {
  const domain = customDomain?.trim() ?? "";
  if (!domain) return false;
  return primaryDomainMode === "custom" || primaryDomainMode === "CUSTOM";
}
