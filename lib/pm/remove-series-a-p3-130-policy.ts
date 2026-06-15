/**
 * Blueprint P3-130 — Remove Series A references from external surfaces.
 *
 * @see docs/remove-series-a-references.md
 */

export const REMOVE_SERIES_A_POLICY_ID = "remove-series-a-p3-130-v1" as const;

export const REMOVE_SERIES_A_DOC = "docs/remove-series-a-references.md" as const;

export const REMOVE_SERIES_A_AUDIT_ARTIFACT =
  "artifacts/series-a-reference-audit.json" as const;

export const REMOVE_SERIES_A_AUDIT_SCRIPT =
  "scripts/audit-remove-series-a-p3-130.ts" as const;

export const REMOVE_SERIES_A_NPM_SCRIPT = "audit:remove-series-a-p3-130" as const;

export const REMOVE_SERIES_A_UNIT_TEST = "tests/unit/remove-series-a-p3-130.test.ts" as const;

export const REMOVE_SERIES_A_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const REMOVE_SERIES_A_HOLD_DOC = "docs/series-a-hold-notice.md" as const;

export const REMOVE_SERIES_A_INTERNAL_DOCS = [
  "docs/series-a-narrative.md",
  REMOVE_SERIES_A_HOLD_DOC,
  REMOVE_SERIES_A_DOC,
] as const;

export const REMOVE_SERIES_A_DECK_SURFACES = [
  {
    id: "sales-deck-doc",
    path: "docs/sales-deck.md",
    label: "Sales deck markdown",
  },
  {
    id: "analyst-briefing-deck",
    path: "docs/analyst-briefing-deck.md",
    label: "Analyst briefing deck",
  },
  {
    id: "sales-deck-page",
    path: "app/deck/page.tsx",
    label: "Sales deck route",
  },
  {
    id: "sales-deck-print",
    path: "components/marketing/sales-deck-print.tsx",
    label: "Sales deck print component",
  },
] as const;

export const REMOVE_SERIES_A_LANDING_SURFACES = [
  { id: "home", path: "app/page.tsx", label: "Home landing" },
  { id: "pricing", path: "app/pricing/page.tsx", label: "Pricing page" },
  { id: "demo", path: "app/demo/page.tsx", label: "Demo page" },
  { id: "trust", path: "app/trust/page.tsx", label: "Trust page" },
] as const;

export const REMOVE_SERIES_A_EMAIL_SURFACES = [
  {
    id: "loi-outreach-email",
    path: "docs/loi-outreach-email.md",
    label: "LOI outreach email",
  },
  {
    id: "outreach-library",
    path: "docs/OUTREACH_LIBRARY.md",
    label: "Outreach library",
  },
  {
    id: "press-release-design-partner",
    path: "docs/press-release-first-design-partner.md",
    label: "Press release template",
  },
] as const;

export const REMOVE_SERIES_A_EXTERNAL_SURFACES = [
  ...REMOVE_SERIES_A_DECK_SURFACES,
  ...REMOVE_SERIES_A_LANDING_SURFACES,
  ...REMOVE_SERIES_A_EMAIL_SURFACES,
] as const;

export const REMOVE_SERIES_A_FORBIDDEN_PHRASES = [
  "raising series a",
  "series a open",
  "series a ready",
  "series a fundraise",
  "term sheet",
  "raising $",
  "investor intro",
  "series a pitch",
  "series a process",
] as const;

export const REMOVE_SERIES_A_ALLOWLIST_PATTERNS = [
  /not raising/i,
  /no series a/i,
  /not a series a/i,
  /series a hold/i,
  /do not.*series a/i,
  /forbidden.*series a/i,
  /without.*series a/i,
  /not fundraise/i,
  /internal only/i,
  /respect.*hold/i,
  /hold respected/i,
  /while hold active/i,
  /not.*series a fundraise/i,
] as const;

export const REMOVE_SERIES_A_REPLACEMENT_PHRASES = [
  "design partner intro",
  "paid pilot",
  "qualified beta",
  "0 signed LOIs",
] as const;

export const REMOVE_SERIES_A_HONESTY_MARKERS = [
  "Series A hold",
  "design partner",
  "0 signed LOIs",
  "not raising",
  "qualified beta",
] as const;

export const REMOVE_SERIES_A_RELATED_PATHS = [
  "docs/pilot-package-v1.md",
  "docs/forbidden-claims-training.md",
  ".github/workflows/verify-claims.yml",
] as const;

export const REMOVE_SERIES_A_WIRING_PATHS = [
  REMOVE_SERIES_A_DOC,
  "lib/pm/remove-series-a-p3-130-policy.ts",
  "lib/pm/remove-series-a-p3-130-operations.ts",
  "lib/pm/remove-series-a-p3-130-audit.ts",
  REMOVE_SERIES_A_AUDIT_ARTIFACT,
  REMOVE_SERIES_A_UNIT_TEST,
] as const;
