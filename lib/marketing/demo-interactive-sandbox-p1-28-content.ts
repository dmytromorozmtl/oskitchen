/**
 * P1-28 — Test credentials + LIVE integration markers for /demo interactive sandbox.
 *
 * @see docs/demo-interactive-sandbox-p1-28.md
 */

import { DEMO_SESSION_HOURS } from "@/lib/demo/demo-session";

export const DEMO_P1_28_GUEST_CREDENTIALS = {
  title: "Guest sandbox credentials",
  emailPattern: "guest-{id}@demo.os-kitchen.app",
  sessionHours: DEMO_SESSION_HOURS,
  launchMethod: "Click Launch Demo — magic link auto-signs you in. No password to remember.",
  seededData:
    "50 orders · 5 staff · 3 vendors · 20 SKUs · 30-day analytics · simulated channel rows",
} as const;

export const DEMO_P1_28_STAGING_LIVE_SMOKE = {
  title: "LIVE integration smokes (staging dev stores)",
  envFile: ".env.smoke.local",
  envKeys: [
    "WOO_STORE_URL",
    "WOO_CONSUMER_KEY",
    "WOO_CONSUMER_SECRET",
    "SHOPIFY_STORE_DOMAIN",
    "SHOPIFY_ACCESS_TOKEN",
    "SHOPIFY_WEBHOOK_SECRET",
  ] as const,
  note: "Engineering certification path — WooCommerce + Shopify webhook→KDS smokes PASS with dev store credentials. DoorDash/Uber Eats remain partner-gated.",
} as const;

export type DemoP128LiveIntegrationProof = {
  channelId: string;
  label: string;
  artifact: string | null;
  smokeScript: string | null;
};

/** Channels with engineering LIVE smoke proof or native LIVE surfaces. */
export const DEMO_P1_28_LIVE_INTEGRATION_PROOFS: readonly DemoP128LiveIntegrationProof[] = [
  {
    channelId: "shopify",
    label: "Shopify",
    artifact: "artifacts/shopify-webhook-kds-live-smoke.json",
    smokeScript: "smoke:shopify-live",
  },
  {
    channelId: "woocommerce",
    label: "WooCommerce",
    artifact: "artifacts/woocommerce-webhook-kds-live-smoke.json",
    smokeScript: "smoke:woo-live",
  },
  {
    channelId: "storefront",
    label: "Owned storefront",
    artifact: null,
    smokeScript: null,
  },
  {
    channelId: "pos",
    label: "In-store POS",
    artifact: null,
    smokeScript: null,
  },
] as const;

export const DEMO_P1_28_HEADLINE =
  "Try the interactive sandbox — test credentials included" as const;

export const DEMO_P1_28_SUBLINE =
  "Launch a 2-hour guest workspace or explore the simulated Integration Health panel below. LIVE WooCommerce + Shopify smokes are certified on staging dev stores — marketplace channels stay honest SKIPPED until partner credentials are wired." as const;

export function isDemoP128LiveChannel(channelId: string): boolean {
  return DEMO_P1_28_LIVE_INTEGRATION_PROOFS.some((p) => p.channelId === channelId);
}

export function getDemoP128LiveProof(
  channelId: string,
): DemoP128LiveIntegrationProof | undefined {
  return DEMO_P1_28_LIVE_INTEGRATION_PROOFS.find((p) => p.channelId === channelId);
}
