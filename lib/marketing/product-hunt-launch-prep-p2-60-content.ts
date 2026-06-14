import {
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_DRAFT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_MAKER_COMMENT,
} from "@/lib/marketing/product-hunt-launch-prep-p2-60-policy";

export type ProductHuntLaunchAsset = {
  id: string;
  label: string;
  archivePath: string;
  spec: string;
  honestyLabel: string | null;
};

/** Required Product Hunt launch assets (P2-60). */
export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_REQUIRED_ASSETS: readonly ProductHuntLaunchAsset[] =
  [
    {
      id: "logo",
      label: "Product icon",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/logo-240.png`,
      spec: "240×240 PNG",
      honestyLabel: null,
    },
    {
      id: "gallery-today",
      label: "Gallery 1 — Today Command Center",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/screenshots/today-command-center.png`,
      spec: "1270×760 screenshot",
      honestyLabel: "pilot_ready",
    },
    {
      id: "gallery-ihc",
      label: "Gallery 2 — Integration Health",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/screenshots/integration-health.png`,
      spec: "1270×760 screenshot",
      honestyLabel: "SKIPPED rows visible",
    },
    {
      id: "gallery-kds",
      label: "Gallery 3 — KDS queue",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/screenshots/kds-queue.png`,
      spec: "1270×760 screenshot",
      honestyLabel: "BETA",
    },
    {
      id: "gallery-storefront",
      label: "Gallery 4 — Storefront checkout",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/screenshots/storefront-checkout.png`,
      spec: "1270×760 screenshot",
      honestyLabel: "BETA",
    },
    {
      id: "gallery-briefing",
      label: "Gallery 5 — Owner briefing",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/screenshots/owner-briefing.png`,
      spec: "1270×760 screenshot",
      honestyLabel: "BETA",
    },
    {
      id: "hero-gif",
      label: "Hero GIF",
      archivePath: `${PRODUCT_HUNT_LAUNCH_PREP_P2_60_ARCHIVE_DIR}/hero.gif`,
      spec: "60s demo loop",
      honestyLabel: "no all-integrations-live claim",
    },
  ] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY = {
  tagline: "Kitchen ops for commissaries — honest BETA, pilot onboarding",
  taglineMaxChars: 60,
  shortDescription:
    "OS Kitchen unifies preorder storefront, production board, KDS, and owner briefing for ghost kitchens and meal-prep operators — software-first, no proprietary terminal lock-in. Qualified beta with design-partner pilots; book a fit call if you match our ICP. Module maturity: /trust",
  topics: ["SaaS", "Productivity"] as const,
  websiteUrl: "https://os-kitchen.com",
  trustUrl: "https://os-kitchen.com/trust",
  bookDemoUrl: "https://os-kitchen.com/book-demo?utm_campaign=product_hunt",
  pricingUrl: "https://os-kitchen.com/pricing",
} as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_PREP_CHECKLIST = [
  { phase: "T-30 days", action: "Draft tagline + short description; run forbidden-claims lint" },
  { phase: "T-30 days", action: "Capture 5 screenshot candidates with maturity labels" },
  { phase: "T-14 days", action: "Re-run LG1–LG8 defer gates; extend defer if pilots < 3" },
  { phase: "T-7 days", action: "Lock gallery assets + maker first comment draft" },
  { phase: "T-1 day", action: "lintProductHuntLaunchDeferCopy → 0 hits; staging smoke PASS" },
  { phase: "Launch day", action: "Publish 00:01 PT; maker comment within 5 min" },
  { phase: "T+7 days", action: "Retro: ICP signups, forbidden-claim incidents (must be 0)" },
] as const;

export const PRODUCT_HUNT_LAUNCH_PREP_P2_60_COPY_ARTIFACT_PATHS = [
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_DRAFT,
  PRODUCT_HUNT_LAUNCH_PREP_P2_60_MAKER_COMMENT,
] as const;

export function taglineWithinProductHuntLimit(tagline: string): boolean {
  return tagline.length <= PRODUCT_HUNT_LAUNCH_PREP_P2_60_LISTING_COPY.taglineMaxChars;
}
