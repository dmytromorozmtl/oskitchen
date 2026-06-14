import {
  PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS,
  PUBLIC_CHANGELOG_P3_87_MIN_RELEASES,
} from "@/lib/marketing/public-changelog-p3-87-policy";

export type PublicChangelogMaturity = (typeof PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS)[number];

export type PublicChangelogItem = {
  id: string;
  label: string;
  maturity: PublicChangelogMaturity;
  detail: string;
};

export type PublicChangelogRelease = {
  id: string;
  version: string;
  publishedAt: string;
  title: string;
  summary: string;
  items: readonly PublicChangelogItem[];
};

/** Curated public changelog — shown on /changelog when DB has no published ReleaseNote rows. */
export const PUBLIC_CHANGELOG_RELEASES: readonly PublicChangelogRelease[] = [
  {
    id: "2026-06-16-operator-trust",
    version: "2026.06.16",
    publishedAt: "2026-06-16",
    title: "Operator trust, KB SEO, and partner prep",
    summary:
      "Marketing honesty gates, knowledge-base FAQ schema, and integration partner application bundles.",
    items: [
      {
        id: "kb-faq-schema",
        label: "Knowledge Base FAQ schema",
        maturity: "LIVE",
        detail: "FAQPage JSON-LD + visible FAQ section on /kb for Featured Snippet eligibility.",
      },
      {
        id: "advisory-board-honesty",
        label: "Advisory board recruiting page",
        maturity: "LIVE",
        detail: "Application-only /advisory-board — zero published members, no fabricated advisors.",
      },
      {
        id: "shopify-qb-partner-prep",
        label: "Shopify + QuickBooks partner listings",
        maturity: "PREVIEW",
        detail: "Marketplace/application prep artifacts — not yet listed or certified.",
      },
      {
        id: "pen-test-scheduled",
        label: "Pen test + QSA scheduling",
        maturity: "BETA",
        detail: "Cobalt engagement scheduled; enterprise promotion gates documented.",
      },
    ],
  },
  {
    id: "2026-06-14-integration-proofs",
    version: "2026.06.14",
    publishedAt: "2026-06-14",
    title: "Integration LIVE smoke and inventory proofs",
    summary: "Shopify, WooCommerce, and cross-channel proof artifacts wired to CI.",
    items: [
      {
        id: "shopify-kds-smoke",
        label: "Shopify webhook → KDS smoke",
        maturity: "LIVE",
        detail: "HMAC orders/create → WebhookEvent → KitchenTask → KDS bump artifact.",
      },
      {
        id: "woo-kds-smoke",
        label: "WooCommerce webhook → KDS smoke",
        maturity: "LIVE",
        detail: "Dev store webhook chain proof with CI gate.",
      },
      {
        id: "shopify-inventory-sync",
        label: "Shopify bi-directional inventory sync",
        maturity: "LIVE",
        detail: "Kitchen decrement + products/update inbound sync — dev store proof.",
      },
      {
        id: "shopify-realtime-inventory",
        label: "Shopify realtime inventory_levels/update",
        maturity: "BETA",
        detail: "Latency-budget proof on sandbox — per-tenant production uptime measured separately.",
      },
    ],
  },
  {
    id: "2026-06-01-pilot-foundation",
    version: "2026.06.01",
    publishedAt: "2026-06-01",
    title: "Commercial MVP foundation",
    summary: "Grouped navigation, operator surfaces, and honest maturity labeling across modules.",
    items: [
      {
        id: "storefront-pos-kds",
        label: "Storefront, POS, and KDS core",
        maturity: "LIVE",
        detail: "Order hub, kitchen display, and cash checkout paths for pilot operators.",
      },
      {
        id: "ai-invoice-scanner",
        label: "AI-assisted invoice capture",
        maturity: "BETA",
        detail: "PDF/photo line-item extraction — review required before posting.",
      },
      {
        id: "loyalty-earn-redeem",
        label: "Loyalty earn and redeem",
        maturity: "PREVIEW",
        detail: "POS + storefront wiring in progress — not a parity claim vs Square yet.",
      },
      {
        id: "offline-pos-card",
        label: "Offline POS card queue",
        maturity: "PREVIEW",
        detail: "Engineering preview only — QSA sign-off pending for card sales claims.",
      },
    ],
  },
] as const;

export function countPublicChangelogReleases(): number {
  return PUBLIC_CHANGELOG_RELEASES.length;
}

export function publicChangelogMaturityCounts(): Record<PublicChangelogMaturity, number> {
  const counts: Record<PublicChangelogMaturity, number> = { LIVE: 0, BETA: 0, PREVIEW: 0 };
  for (const release of PUBLIC_CHANGELOG_RELEASES) {
    for (const item of release.items) {
      counts[item.maturity] += 1;
    }
  }
  return counts;
}

export function publicChangelogHasAllMaturityLevels(): boolean {
  const counts = publicChangelogMaturityCounts();
  return PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS.every((level) => counts[level] > 0);
}

export function publicChangelogMeetsMinimumReleases(): boolean {
  return PUBLIC_CHANGELOG_RELEASES.length >= PUBLIC_CHANGELOG_P3_87_MIN_RELEASES;
}
