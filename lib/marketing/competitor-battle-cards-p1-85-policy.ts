/**
 * Blueprint P1-85 — Competitor battle cards (21 competitors × one page).
 *
 * @see docs/competitor-battle-cards-index.md
 * @see docs/competitor-battle-cards/
 */

import { COMPETITOR_PARITY_21_SLUGS } from "@/lib/competitor/absolute-final-competitor-parity-policy";

export const COMPETITOR_BATTLE_CARDS_P1_85_POLICY_ID =
  "competitor-battle-cards-p1-85-v1" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC =
  "docs/competitor-battle-cards-index.md" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_DIR = "docs/competitor-battle-cards" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_CONTENT_PATH =
  "lib/marketing/competitor-battle-cards-p1-85-content.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_MARKDOWN_PATH =
  "lib/marketing/competitor-battle-cards-p1-85-markdown.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_PARENT_DOC =
  "docs/competitive-battle-cards.md" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_COUNT = 21 as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_SLUGS = COMPETITOR_PARITY_21_SLUGS;

export type CompetitorBattleCardP1_85Slug =
  (typeof COMPETITOR_BATTLE_CARDS_P1_85_SLUGS)[number];

export const COMPETITOR_BATTLE_CARDS_P1_85_FRAMEWORK = "WIN-TRAP-REDIRECT" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_REQUIRED_SECTIONS = [
  "They win",
  "Trap",
  "Our redirect",
  "ICP fit",
  "Talk track",
  "Honesty",
] as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_HONESTY_MARKERS = [
  "wins",
  "verify",
  "BETA",
  "typical",
  "not affiliated",
] as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_AUDIT_SCRIPT =
  "scripts/audit-competitor-battle-cards-p1-85.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_MATERIALIZE_SCRIPT =
  "scripts/materialize-competitor-battle-cards-p1-85.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_NPM_SCRIPT =
  "audit:competitor-battle-cards-p1-85" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_UNIT_TEST =
  "tests/unit/competitor-battle-cards-p1-85.test.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P1_85_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export function competitorBattleCardDocPath(slug: CompetitorBattleCardP1_85Slug): string {
  return `${COMPETITOR_BATTLE_CARDS_P1_85_DIR}/${slug}.md`;
}

export const COMPETITOR_BATTLE_CARDS_P1_85_WIRING_PATHS = [
  COMPETITOR_BATTLE_CARDS_P1_85_INDEX_DOC,
  COMPETITOR_BATTLE_CARDS_P1_85_CONTENT_PATH,
  COMPETITOR_BATTLE_CARDS_P1_85_MARKDOWN_PATH,
  COMPETITOR_BATTLE_CARDS_P1_85_PARENT_DOC,
  "lib/marketing/competitor-battle-cards-p1-85-policy.ts",
  "lib/marketing/competitor-battle-cards-p1-85-audit.ts",
  COMPETITOR_BATTLE_CARDS_P1_85_UNIT_TEST,
  COMPETITOR_BATTLE_CARDS_P1_85_MATERIALIZE_SCRIPT,
  ...COMPETITOR_BATTLE_CARDS_P1_85_SLUGS.map((slug) => competitorBattleCardDocPath(slug)),
] as const;
