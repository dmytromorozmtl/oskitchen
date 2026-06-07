/**
 * Absolute Final Task 82 — "Own your channel" upsell flow.
 *
 * @see app/own-your-channel/page.tsx
 * @see lib/marketing/commission-comparison-calculator-content.ts
 */

export const OWN_YOUR_CHANNEL_UPSELL_ABSOLUTE_FINAL_POLICY_ID =
  "own-your-channel-upsell-absolute-final-v1" as const;

export const OWN_YOUR_CHANNEL_UPSELL_ROUTE = "/own-your-channel" as const;

export const OWN_YOUR_CHANNEL_UPSELL_PAGE_PATH = "app/own-your-channel/page.tsx" as const;

export const OWN_YOUR_CHANNEL_UPSELL_COMPONENT_PATH =
  "components/marketing/own-your-channel-upsell-flow.tsx" as const;

export const OWN_YOUR_CHANNEL_UPSELL_CONTENT_PATH =
  "lib/marketing/own-your-channel-upsell-content.ts" as const;

export const OWN_YOUR_CHANNEL_UPSELL_STRIP_PATH =
  "components/dashboard/analytics/own-your-channel-upsell-strip.tsx" as const;

export const OWN_YOUR_CHANNEL_COMMISSION_CALCULATOR_PATH =
  "components/marketing/commission-comparison-calculator.tsx" as const;

export const OWN_YOUR_CHANNEL_DELIVERY_COMMISSION_PANEL_PATH =
  "components/dashboard/analytics/delivery-commission-panel.tsx" as const;

export const OWN_YOUR_CHANNEL_REQUIRED_MARKERS = [
  'data-testid="own-your-channel-upsell-flow"',
  "OwnYourChannelUpsellFlow",
] as const;

export const OWN_YOUR_CHANNEL_HONESTY_MARKERS = [
  "BETA",
  "SKIPPED",
  "not guaranteed",
  "settlement statement",
  "partner-gated",
] as const;

export const OWN_YOUR_CHANNEL_WIRING_PATHS = [
  OWN_YOUR_CHANNEL_UPSELL_PAGE_PATH,
  OWN_YOUR_CHANNEL_UPSELL_COMPONENT_PATH,
  OWN_YOUR_CHANNEL_UPSELL_CONTENT_PATH,
  OWN_YOUR_CHANNEL_UPSELL_STRIP_PATH,
  OWN_YOUR_CHANNEL_COMMISSION_CALCULATOR_PATH,
  OWN_YOUR_CHANNEL_DELIVERY_COMMISSION_PANEL_PATH,
  "lib/marketing/own-your-channel-upsell-absolute-final-policy.ts",
  "lib/marketing/own-your-channel-upsell-audit.ts",
  "tests/unit/own-your-channel-upsell-absolute-final.test.ts",
] as const;

export const OWN_YOUR_CHANNEL_UPSELL_UNIT_TEST =
  "tests/unit/own-your-channel-upsell-absolute-final.test.ts" as const;

export const OWN_YOUR_CHANNEL_UPSELL_CI_SCRIPTS = [
  "test:ci:own-your-channel-upsell",
  "test:ci:own-your-channel-upsell:cert",
] as const;

export const OWN_YOUR_CHANNEL_UPSTREAM_POLICIES = [
  "commission-comparison-calculator-absolute-final-v1",
  "delivery-commission-tracking-absolute-final-v1",
] as const;
