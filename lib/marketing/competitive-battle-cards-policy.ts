import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * MKT-26 — competitive battle cards policy (seven core competitors).
 *
 * @see docs/competitive-battle-cards.md
 * @see docs/competitor-comparison-honest.md
 * @see lib/marketing/compare-content.ts
 */

export const COMPETITIVE_BATTLE_CARDS_POLICY_ID =
  "competitive-battle-cards-mkt26-v1" as const;

export const COMPETITIVE_BATTLE_CARDS_DOC = "docs/competitive-battle-cards.md" as const;

export const BATTLE_CARD_FRAMEWORK = "WIN-TRAP-REDIRECT" as const;

/** Seven canonical battle cards — ids BC1–BC7. */
export const COMPETITIVE_BATTLE_CARDS = [
  {
    id: "BC1",
    slug: "toast",
    label: "Toast",
    comparePath: "/compare/toast",
    icpFit: "full-service dining room with hardware budget",
  },
  {
    id: "BC2",
    slug: "square",
    label: "Square",
    comparePath: "/compare/square",
    icpFit: "counter-first SMB with payments-led stack",
  },
  {
    id: "BC3",
    slug: "lightspeed",
    label: "Lightspeed",
    comparePath: "/compare/kitchenos-vs-lightspeed",
    icpFit: "hospitality POS at multi-site scale",
  },
  {
    id: "BC4",
    slug: "deliverect",
    label: "Deliverect",
    comparePath: "/compare/deliverect",
    icpFit: "aggregator middleware only — kitchen elsewhere",
  },
  {
    id: "BC5",
    slug: "shopify-woocommerce",
    label: "Shopify / WooCommerce + spreadsheets",
    comparePath: "/compare/meal-prep-software",
    icpFit: "storefront-only with manual kitchen ops",
  },
  {
    id: "BC6",
    slug: "touchbistro",
    label: "TouchBistro",
    comparePath: "/compare/touchbistro",
    icpFit: "iPad dining-room POS, low kitchen complexity",
  },
  {
    id: "BC7",
    slug: "spreadsheets-status-quo",
    label: "Spreadsheets / status quo",
    comparePath: "/compare/meal-prep-software",
    icpFit: "under ~40 meals/week, errors cheap to fix",
  },
] as const;

export type CompetitiveBattleCardId = (typeof COMPETITIVE_BATTLE_CARDS)[number]["id"];

export const COMPETITIVE_BATTLE_CARDS_PRIMARY_CTA = {
  label: "Book competitive walkthrough",
  href: "/book-demo?utm_source=battle-card&utm_medium=sales&utm_campaign=competitive-battle-cards-mkt26",
} as const;

export const COMPETITIVE_BATTLE_CARDS_FORBIDDEN_CLAIMS = [
  "we beat toast on everything",
  "replace square overnight",
  "better than lightspeed in every way",
  "deliverect parity",
  "live doordash today",
  "live uber eats today",
  "thousands of customers",
  "soc 2 certified",
  "enterprise-ready day one",
  "guaranteed savings",
] as const;

export const COMPETITIVE_BATTLE_CARDS_DOC_REQUIRED_HEADINGS = [
  "Battle card framework (WIN-TRAP-REDIRECT)",
  "Seven battle cards",
  "Quick reference matrix",
  "Forbidden battle card claims",
  "Pre-call checklist",
] as const;

export type CompetitiveBattleCardsDocAudit = {
  docPath: typeof COMPETITIVE_BATTLE_CARDS_DOC;
  missingHeadings: string[];
  battleCardCount: number;
  passed: boolean;
};

export function listCompetitiveBattleCardIds(): CompetitiveBattleCardId[] {
  return COMPETITIVE_BATTLE_CARDS.map((card) => card.id);
}

export function getBattleCardById(id: CompetitiveBattleCardId) {
  return COMPETITIVE_BATTLE_CARDS.find((card) => card.id === id);
}

export function getBattleCardBySlug(slug: string) {
  return COMPETITIVE_BATTLE_CARDS.find((card) => card.slug === slug);
}

export function auditCompetitiveBattleCardsDoc(
  root = process.cwd(),
): CompetitiveBattleCardsDocAudit {
  const source = readFileSync(join(root, COMPETITIVE_BATTLE_CARDS_DOC), "utf8");
  const missingHeadings = COMPETITIVE_BATTLE_CARDS_DOC_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const battleCardCount = COMPETITIVE_BATTLE_CARDS.filter((card) =>
    source.includes(`### ${card.id} —`),
  ).length;

  return {
    docPath: COMPETITIVE_BATTLE_CARDS_DOC,
    missingHeadings,
    battleCardCount,
    passed:
      missingHeadings.length === 0 &&
      battleCardCount === COMPETITIVE_BATTLE_CARDS.length,
  };
}

export type CompetitiveBattleCardsLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintBattleCardCopy(source: string): CompetitiveBattleCardsLint {
  const lower = source.toLowerCase();
  const forbiddenHits = COMPETITIVE_BATTLE_CARDS_FORBIDDEN_CLAIMS.filter((phrase) =>
    lower.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}
