/**
 * Blueprint P1-68 — VoiceOver / NVDA accessibility sweep (Today, POS, KDS).
 *
 * @see components/a11y/voiceover-live-region.tsx
 * @see components/dashboard/today-command-center.tsx
 * @see components/dashboard/pos-terminal/cart-panel.tsx
 * @see components/kitchen/kds-daily-service.tsx
 */

export const A11Y_VOICEOVER_SWEEP_POLICY_ID = "a11y-voiceover-sweep-p1-68-v1" as const;

export const A11Y_VOICEOVER_SWEEP_ASSISTIVE_TECH = ["VoiceOver", "NVDA"] as const;

export const A11Y_VOICEOVER_SWEEP_SURFACES = ["today", "pos", "kds"] as const;

export type A11yVoiceoverSweepSurface = (typeof A11Y_VOICEOVER_SWEEP_SURFACES)[number];

export const A11Y_VOICEOVER_LIVE_REGION_MODULE =
  "components/a11y/voiceover-live-region.tsx" as const;

export const A11Y_VOICEOVER_TODAY_MODULE =
  "components/dashboard/today-command-center.tsx" as const;

export const A11Y_VOICEOVER_POS_CART_MODULE =
  "components/dashboard/pos-terminal/cart-panel.tsx" as const;

export const A11Y_VOICEOVER_POS_PAYMENT_MODULE =
  "components/dashboard/pos-terminal/payment-panel.tsx" as const;

export const A11Y_VOICEOVER_KDS_MODULE = "components/kitchen/kds-daily-service.tsx" as const;

/** Today page title — referenced by sticky header aria-labelledby. */
export const TODAY_VOICEOVER_PAGE_TITLE_ID = "today-page-title" as const;

export const TODAY_VOICEOVER_HEADER_LABEL = "Today operational overview" as const;

export const TODAY_VOICEOVER_SR_NAV_HINT =
  "Tab through metrics, blockers, and actions. Skip link jumps to main dashboard content." as const;

export const TODAY_VOICEOVER_SR_HINT_TEST_ID = "today-voiceover-nav-hint" as const;

/** KDS shell region label for screen readers. */
export const KDS_VOICEOVER_SHELL_ARIA_LABEL = "Kitchen display system" as const;

export const KDS_VOICEOVER_LIVE_REGION_TEST_ID = "kds-voiceover-live-region" as const;

export function kdsVoiceoverBumpAnnouncement(ticketLabel: string): string {
  return `Order ${ticketLabel} bumped to expo`;
}

/** POS cart + checkout landmark labels. */
export const POS_VOICEOVER_CART_REGION_LABEL =
  "Point of sale cart, register, and checkout" as const;

export const POS_VOICEOVER_PAYMENT_REGION_LABEL = "Payment method selection" as const;

export const A11Y_VOICEOVER_SWEEP_WIRED_MODULES = [
  A11Y_VOICEOVER_LIVE_REGION_MODULE,
  A11Y_VOICEOVER_TODAY_MODULE,
  A11Y_VOICEOVER_POS_CART_MODULE,
  A11Y_VOICEOVER_POS_PAYMENT_MODULE,
  A11Y_VOICEOVER_KDS_MODULE,
] as const;

export const A11Y_VOICEOVER_SWEEP_AUDIT_SCRIPT =
  "scripts/audit-a11y-voiceover-sweep.ts" as const;

export const A11Y_VOICEOVER_SWEEP_NPM_SCRIPT = "audit:a11y-voiceover-sweep" as const;

export const A11Y_VOICEOVER_SWEEP_UNIT_TEST = "tests/unit/a11y-voiceover-sweep.test.ts" as const;

export const A11Y_VOICEOVER_SWEEP_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;
