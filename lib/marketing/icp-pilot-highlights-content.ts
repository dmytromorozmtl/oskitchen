/**
 * Blueprint P1-23 — ICP pilot highlights (meal prep + ghost kitchen landings).
 *
 * Highlights: 18 LIVE integrations scaffold, KDS, profit engine — with honest caveats.
 */

export const ICP_PILOT_HIGHLIGHTS_POLICY_ID = "icp-pilot-highlights-p1-23-v1" as const;

/** G1 integration scaffold target — verify PASS per workspace in Integration Health. */
export const ICP_PILOT_LIVE_INTEGRATION_COUNT = 18 as const;

export const ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID = "icp-pilot-highlights" as const;

export const ICP_PILOT_HIGHLIGHTS_DISCLAIMER =
  "LIVE status is per workspace — confirm PASS in Integration Health during your trial; BETA and SKIPPED channels stay labeled honestly." as const;

export const ICP_PILOT_HIGHLIGHTS = [
  {
    id: "live-integrations",
    title: `${ICP_PILOT_LIVE_INTEGRATION_COUNT} LIVE integrations`,
    description:
      "Shopify, WooCommerce, DoorDash, Stripe, and the full channel scaffold — each adapter shows PASS, SKIPPED, or FAILED in Integration Health instead of fake green dashboards.",
    ctaLabel: "See Integration Health",
    ctaHref: "/integration-health-center",
  },
  {
    id: "kds",
    title: "Kitchen Display (KDS)",
    description:
      "Bump tickets from every channel into one kitchen screen — station routing, expo handoff, and prep checkpoints without proprietary hardware lock-in.",
    ctaLabel: "Explore KDS",
    ctaHref: "/dashboard/kitchen",
  },
  {
    id: "profit-engine",
    title: "Profit engine",
    description:
      "Brand-level P&L snapshots, food-cost signals, and AI purchasing suggestions — directional margin truth tied to today's orders, not a back-office export.",
    ctaLabel: "View profit tools",
    ctaHref: "/dashboard/analytics",
  },
] as const;

export type IcpPilotHighlight = (typeof ICP_PILOT_HIGHLIGHTS)[number];

export const ICP_PILOT_HIGHLIGHTS_WIRING_PATHS = [
  "lib/marketing/icp-pilot-highlights-content.ts",
  "components/marketing/icp-pilot-highlights-section.tsx",
] as const;
