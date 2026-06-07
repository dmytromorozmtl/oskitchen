/**
 * Absolute Final Tasks 131–145 — shared GTM / sales / content tokens for P3 features 86–100.
 *
 * @see lib/marketing/absolute-final-pm-marketing-full-scale-policy.ts
 * @see docs/multi-currency-gtm-scale.md
 */

export const PM_GTM_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-pm-marketing-full-scale-v1" as const;

export const PM_GTM_DOC_MARKER_PREFIX = "pm-gtm:" as const;

export const PM_GTM_DOC_HERO_MARKER = "pm-gtm-hero-banner" as const;

export const PM_GTM_DOC_ICP_MARKER = "pm-gtm-icp-profile" as const;

export const PM_GTM_DOC_DEMO_MARKER = "pm-gtm-demo-hook" as const;

export const PM_GTM_DOC_OBJECTIONS_MARKER = "pm-gtm-objection-handling" as const;

export const PM_GTM_DOC_PRICING_MARKER = "pm-gtm-pricing-talk-track" as const;

export const PM_GTM_DOC_CTA_MARKER = "pm-gtm-primary-cta" as const;

export const PM_GTM_DOC_HONESTY_MARKER = "pm-gtm-honesty-guardrails" as const;

export const PM_GTM_DOC_DARK_MODE_MARKER = "pm-gtm-dark-mode-note" as const;

export const PM_GTM_DOC_REQUIRED_MARKERS = [
  `${PM_GTM_DOC_MARKER_PREFIX} ${PM_GTM_ABSOLUTE_FINAL_POLICY_ID}`,
  PM_GTM_DOC_HERO_MARKER,
  PM_GTM_DOC_ICP_MARKER,
  PM_GTM_DOC_DEMO_MARKER,
  PM_GTM_DOC_OBJECTIONS_MARKER,
  PM_GTM_DOC_PRICING_MARKER,
  PM_GTM_DOC_CTA_MARKER,
  PM_GTM_DOC_HONESTY_MARKER,
] as const;

export const PM_GTM_TOKEN_NAMES = [
  "PM_GTM_DOC_HERO_MARKER",
  "PM_GTM_DOC_ICP_MARKER",
  "PM_GTM_DOC_DEMO_MARKER",
  "PM_GTM_DOC_OBJECTIONS_MARKER",
  "PM_GTM_DOC_PRICING_MARKER",
  "PM_GTM_DOC_CTA_MARKER",
  "PM_GTM_DOC_HONESTY_MARKER",
] as const;

export function docUsesPmGtmTokens(source: string): boolean {
  return PM_GTM_DOC_REQUIRED_MARKERS.every((marker) => source.includes(marker));
}

export function componentUsesPmGtmTokens(source: string): boolean {
  return (
    source.includes("absolute-final-pm-marketing-full-scale-tokens") &&
    PM_GTM_TOKEN_NAMES.some((name) => source.includes(name))
  );
}
