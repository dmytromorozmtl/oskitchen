/**
 * P2-64 — Catering BEO format: Banquet Event Order layout, menu, timeline (Tripleseat parity).
 *
 * @see docs/catering-beo-format-p2-64.md
 */

export const CATERING_BEO_FORMAT_P2_64_POLICY_ID = "catering-beo-format-p2-64-v1" as const;

export const CATERING_BEO_FORMAT_P2_64_DOC = "docs/catering-beo-format-p2-64.md" as const;

export const CATERING_BEO_FORMAT_P2_64_ARTIFACT =
  "artifacts/catering-beo-format-p2-64.json" as const;

export const CATERING_BEO_FORMAT_P2_64_BUILDER =
  "lib/catering/catering-beo-p2-64-builder.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_SERVICE =
  "services/catering/catering-beo-service.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_COMPONENT =
  "components/catering/catering-beo-document.tsx" as const;

export const CATERING_BEO_FORMAT_P2_64_PAGE =
  "app/dashboard/catering-quotes/[quoteId]/beo/page.tsx" as const;

export const CATERING_BEO_FORMAT_P2_64_QUOTE_DETAIL =
  "app/dashboard/catering-quotes/[quoteId]/page.tsx" as const;

export const CATERING_BEO_FORMAT_P2_64_CORPUS_MODULE =
  "lib/catering/catering-beo-p2-64-corpus.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_SCORING_MODULE =
  "lib/catering/catering-beo-p2-64-scoring.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_AUDIT_MODULE =
  "lib/catering/catering-beo-p2-64-audit.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_DOCUMENT_TEST_ID = "catering-beo-document" as const;

export const CATERING_BEO_FORMAT_P2_64_LAYOUT_TEST_ID = "catering-beo-layout" as const;

export const CATERING_BEO_FORMAT_P2_64_MENU_TEST_ID = "catering-beo-menu" as const;

export const CATERING_BEO_FORMAT_P2_64_TIMELINE_TEST_ID = "catering-beo-timeline" as const;

export const CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT = 10 as const;

export const CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT = 95 as const;

export const CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES = 4 as const;

export const CATERING_BEO_FORMAT_P2_64_CHECK_NPM_SCRIPT =
  "check:catering-beo-format-p2-64" as const;

export const CATERING_BEO_FORMAT_P2_64_CI_NPM_SCRIPT =
  "test:ci:catering-beo-format-p2-64" as const;

export const CATERING_BEO_FORMAT_P2_64_UNIT_TEST =
  "tests/unit/catering-beo-format-p2-64.test.ts" as const;

export const CATERING_BEO_FORMAT_P2_64_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const CATERING_BEO_FORMAT_P2_64_FLOW_STEPS = [
  "quote-to-beo",
  "layout-section",
  "menu-section",
  "timeline-section",
] as const;

export const CATERING_BEO_FORMAT_P2_64_TRIPLESEAT_PARITY_NOTE =
  "Banquet Event Order — layout, menu, and service timeline from accepted catering quotes; comparable to Tripleseat BEO, without claiming certified parity." as const;

export const CATERING_BEO_FORMAT_P2_64_WIRING_PATHS = [
  CATERING_BEO_FORMAT_P2_64_DOC,
  CATERING_BEO_FORMAT_P2_64_ARTIFACT,
  CATERING_BEO_FORMAT_P2_64_CORPUS_MODULE,
  CATERING_BEO_FORMAT_P2_64_SCORING_MODULE,
  CATERING_BEO_FORMAT_P2_64_AUDIT_MODULE,
  CATERING_BEO_FORMAT_P2_64_BUILDER,
  CATERING_BEO_FORMAT_P2_64_SERVICE,
  CATERING_BEO_FORMAT_P2_64_COMPONENT,
  CATERING_BEO_FORMAT_P2_64_PAGE,
  CATERING_BEO_FORMAT_P2_64_UNIT_TEST,
  CATERING_BEO_FORMAT_P2_64_CI_WORKFLOW,
  "lib/catering/catering-beo-p2-64-types.ts",
] as const;
