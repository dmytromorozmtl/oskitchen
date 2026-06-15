/**
 * Blueprint P3-143 — Café mode POS (Square parity: 5-screen max).
 *
 * @see docs/cafe-mode-pos.md
 */

export const CAFE_MODE_P3_143_POLICY_ID = "cafe-mode-p3-143-v1" as const;

export const CAFE_MODE_P3_143_DOC = "docs/cafe-mode-pos.md" as const;

export const CAFE_MODE_P3_143_ARTIFACT = "artifacts/cafe-mode-pos-registry.json" as const;

export const CAFE_MODE_P3_143_AUDIT_SCRIPT = "scripts/audit-cafe-mode-p3-143.ts" as const;

export const CAFE_MODE_P3_143_NPM_SCRIPT = "audit:cafe-mode-p3-143" as const;

export const CAFE_MODE_P3_143_UNIT_TEST = "tests/unit/cafe-mode-p3-143.test.ts" as const;

export const CAFE_MODE_P3_143_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const CAFE_MODE_P3_143_COMPETITOR = "square" as const;

export const CAFE_MODE_P3_143_MAX_SCREENS = 5 as const;

export const CAFE_MODE_P3_143_ROUTE = "/dashboard/pos/cafe" as const;

export const CAFE_MODE_P3_143_QUERY_PARAM = "cafe" as const;

export const CAFE_MODE_P3_143_HEADLINE = "Café mode — 5 screens, counter-first" as const;

export const CAFE_MODE_P3_143_SCREEN_IDS = [
  "menu",
  "cart",
  "modifiers",
  "payment",
  "receipt",
] as const;

export type CafeModeP3_143ScreenId = (typeof CAFE_MODE_P3_143_SCREEN_IDS)[number];

export const CAFE_MODE_P3_143_COMPONENT = "components/pos/cafe-mode-terminal.tsx" as const;

export const CAFE_MODE_P3_143_NAV_COMPONENT = "components/pos/cafe-mode-screen-nav.tsx" as const;

export const CAFE_MODE_P3_143_PAGE = "app/dashboard/pos/cafe/page.tsx" as const;

export const CAFE_MODE_P3_143_RESOLVER_MODULE = "lib/pos/cafe-mode-p3-143.ts" as const;

export const CAFE_MODE_P3_143_RELATED_DOCS = [
  "docs/competitor-battle-cards/square.md",
  "docs/fifteen-minute-onboarding.md",
  "docs/software-first-pos-positioning.md",
  "docs/CAFE_MODE.md",
  "lib/design/single-onboarding-entry-policy.ts",
  "lib/pos/pos-cashier-speed-mode-era19-policy.ts",
] as const;

export const CAFE_MODE_P3_143_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "5-screen max",
] as const;

export const CAFE_MODE_P3_143_WIRING_PATHS = [
  CAFE_MODE_P3_143_DOC,
  "lib/pos/cafe-mode-p3-143-policy.ts",
  "lib/pos/cafe-mode-p3-143-content.ts",
  "lib/pos/cafe-mode-p3-143-operations.ts",
  "lib/pos/cafe-mode-p3-143-audit.ts",
  CAFE_MODE_P3_143_RESOLVER_MODULE,
  CAFE_MODE_P3_143_ARTIFACT,
  CAFE_MODE_P3_143_UNIT_TEST,
  CAFE_MODE_P3_143_COMPONENT,
  CAFE_MODE_P3_143_NAV_COMPONENT,
  CAFE_MODE_P3_143_PAGE,
] as const;
