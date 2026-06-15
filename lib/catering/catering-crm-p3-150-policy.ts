/**
 * Blueprint P3-150 — Catering CRM (Tripleseat parity baseline).
 *
 * @see docs/catering-crm-tripleseat.md
 */

export const CATERING_CRM_P3_150_POLICY_ID = "catering-crm-p3-150-v1" as const;

export const CATERING_CRM_P3_150_DOC = "docs/catering-crm-tripleseat.md" as const;

export const CATERING_CRM_P3_150_ARTIFACT =
  "artifacts/catering-crm-tripleseat-registry.json" as const;

export const CATERING_CRM_P3_150_AUDIT_SCRIPT =
  "scripts/audit-catering-crm-p3-150.ts" as const;

export const CATERING_CRM_P3_150_NPM_SCRIPT = "audit:catering-crm-p3-150" as const;

export const CATERING_CRM_P3_150_UNIT_TEST =
  "tests/unit/catering-crm-p3-150.test.ts" as const;

export const CATERING_CRM_P3_150_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CATERING_CRM_P3_150_COMPETITOR = "tripleseat" as const;

export const CATERING_CRM_P3_150_POSITIONING_LINE =
  "Production kitchen underneath catering sales — not Tripleseat venue CRM only." as const;

export const CATERING_CRM_P3_150_HEADLINE =
  "Catering CRM — Tripleseat parity baseline" as const;

export const CATERING_CRM_P3_150_ROUTE = "/dashboard/catering/crm" as const;

export const CATERING_CRM_P3_150_IMPLEMENTATION_REF = "catering-os-v1" as const;

export const CATERING_CRM_P3_150_SECONDARY_REF = "era113-catering-os-v1" as const;

export const CATERING_CRM_P3_150_CAPABILITY_COUNT = 6 as const;

export const CATERING_CRM_P3_150_CAPABILITY_IDS = [
  "catering_quotes",
  "quote_pipeline",
  "deposit_checkout",
  "event_sheets",
  "public_proposals",
  "quote_conversion",
] as const;

export type CateringCrmCapabilityId = (typeof CATERING_CRM_P3_150_CAPABILITY_IDS)[number];

export const CATERING_CRM_P3_150_TEST_IDS = [
  "catering-crm-tripleseat",
  "catering-crm-quotes",
  "catering-crm-pipeline",
  "catering-crm-deposits",
  "catering-crm-event-sheets",
  "catering-crm-proposals",
  "catering-crm-conversion",
] as const;

export const CATERING_CRM_P3_150_COMPONENT =
  "components/catering/catering-crm-panel.tsx" as const;

export const CATERING_CRM_P3_150_PAGE = "app/dashboard/catering/crm/page.tsx" as const;

export const CATERING_CRM_P3_150_LEGACY_CATERING_OS =
  "lib/catering/catering-os-policy.ts" as const;

export const CATERING_CRM_P3_150_LEGACY_QUOTES_ACTIONS =
  "actions/catering-quotes.ts" as const;

export const CATERING_CRM_P3_150_LEGACY_QUOTE_SERVICE =
  "services/catering/quote-service.ts" as const;

export const CATERING_CRM_P3_150_LEGACY_CONVERSION =
  "services/catering/quote-conversion-service.ts" as const;

export const CATERING_CRM_P3_150_LEGACY_DEPOSIT =
  "services/catering/catering-deposit-checkout-service.ts" as const;

export const CATERING_CRM_P3_150_LEGACY_QUOTE_DETAIL =
  "app/dashboard/catering-quotes/[quoteId]/page.tsx" as const;

export const CATERING_CRM_P3_150_RELATED_DOCS = [
  "page.tsx",
  "catering-os-era113-setup.md",
  "catering-quotes.ts",
  "quote-service.ts",
  "quote-conversion-service.ts",
  "catering-deposit-checkout-service.ts",
] as const;

export const CATERING_CRM_P3_150_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "verify",
] as const;

export const CATERING_CRM_P3_150_WIRING_PATHS = [
  CATERING_CRM_P3_150_DOC,
  "lib/catering/catering-crm-p3-150-policy.ts",
  "lib/catering/catering-crm-p3-150-content.ts",
  "lib/catering/catering-crm-p3-150-operations.ts",
  "lib/catering/catering-crm-p3-150-audit.ts",
  CATERING_CRM_P3_150_ARTIFACT,
  CATERING_CRM_P3_150_UNIT_TEST,
  CATERING_CRM_P3_150_COMPONENT,
  CATERING_CRM_P3_150_PAGE,
  CATERING_CRM_P3_150_LEGACY_CATERING_OS,
  CATERING_CRM_P3_150_LEGACY_QUOTES_ACTIONS,
  CATERING_CRM_P3_150_LEGACY_QUOTE_SERVICE,
  CATERING_CRM_P3_150_LEGACY_CONVERSION,
  CATERING_CRM_P3_150_LEGACY_DEPOSIT,
  CATERING_CRM_P3_150_LEGACY_QUOTE_DETAIL,
] as const;
