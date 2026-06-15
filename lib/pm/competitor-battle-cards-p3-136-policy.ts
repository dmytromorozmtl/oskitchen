/**
 * Blueprint P3-136 — Competitor battle cards PM (21 × one-page).
 *
 * @see docs/competitor-battle-cards-pm.md
 */

export const COMPETITOR_BATTLE_CARDS_P3_136_POLICY_ID =
  "competitor-battle-cards-p3-136-v1" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_DOC =
  "docs/competitor-battle-cards-pm.md" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_ARTIFACT =
  "artifacts/competitor-battle-cards-pm-registry.json" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_AUDIT_SCRIPT =
  "scripts/audit-competitor-battle-cards-p3-136.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_NPM_SCRIPT =
  "audit:competitor-battle-cards-p3-136" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_UNIT_TEST =
  "tests/unit/competitor-battle-cards-p3-136.test.ts" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_CARD_COUNT = 21 as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_FRAMEWORK = "WIN-TRAP-REDIRECT" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_IMPLEMENTATION_REF =
  "competitor-battle-cards-p1-85-v1" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_LIVE_AUDIT_NPM =
  "audit:competitor-battle-cards-p1-85" as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_REQUIRED_SECTIONS = [
  "They win",
  "Trap",
  "Our redirect",
  "ICP fit",
  "Talk track",
  "Honesty",
] as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_RELATED_DOCS = [
  "docs/competitor-battle-cards-index.md",
  "docs/competitive-battle-cards.md",
  "docs/forbidden-claims-audit.md",
  "docs/sales-limitation-sheet.md",
  "lib/marketing/competitor-battle-cards-p1-85-policy.ts",
] as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_HONESTY_MARKERS = [
  "0 signed LOIs",
  "not affiliated",
  "BETA",
  "verify",
  "typical",
  "baseline",
] as const;

export const COMPETITOR_BATTLE_CARDS_P3_136_WIRING_PATHS = [
  COMPETITOR_BATTLE_CARDS_P3_136_DOC,
  "lib/pm/competitor-battle-cards-p3-136-policy.ts",
  "lib/pm/competitor-battle-cards-p3-136-operations.ts",
  "lib/pm/competitor-battle-cards-p3-136-audit.ts",
  COMPETITOR_BATTLE_CARDS_P3_136_ARTIFACT,
  COMPETITOR_BATTLE_CARDS_P3_136_UNIT_TEST,
] as const;
