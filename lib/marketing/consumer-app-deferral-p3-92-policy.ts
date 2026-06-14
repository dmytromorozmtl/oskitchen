/**
 * P3-92 — Consumer app (B2C diner app) deferred until 500+ paying operators.
 *
 * @see docs/consumer-app-deferral-p3-92.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const CONSUMER_APP_DEFERRAL_P3_92_POLICY_ID =
  "consumer-app-deferral-p3-92-v1" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_DOC = "docs/consumer-app-deferral-p3-92.md" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_ARTIFACT =
  "artifacts/consumer-app-deferral-p3-92.json" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_CONTENT_MODULE =
  "lib/marketing/consumer-app-deferral-p3-92-content.ts" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_AUDIT_MODULE =
  "lib/marketing/consumer-app-deferral-p3-92-audit.ts" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_CHECK_NPM_SCRIPT =
  "check:consumer-app-deferral-p3-92" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_UNIT_TEST =
  "tests/unit/consumer-app-deferral-p3-92.test.ts" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_ROADMAP_ITEM_ID = "consumer-app" as const;

/** Revisit gate — no native App Store / Play Store consumer app before this count. */
export const CONSUMER_APP_DEFERRAL_P3_92_CUSTOMER_THRESHOLD = 500 as const;

export const CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const CONSUMER_APP_DEFERRAL_P3_92_WIRING_PATHS = [
  CONSUMER_APP_DEFERRAL_P3_92_DOC,
  CONSUMER_APP_DEFERRAL_P3_92_ARTIFACT,
  CONSUMER_APP_DEFERRAL_P3_92_CONTENT_MODULE,
  CONSUMER_APP_DEFERRAL_P3_92_AUDIT_MODULE,
  CONSUMER_APP_DEFERRAL_P3_92_UNIT_TEST,
  CONSUMER_APP_DEFERRAL_P3_92_CI_WORKFLOW,
  CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_ROADMAP,
  CONSUMER_APP_DEFERRAL_P3_92_UPSTREAM_PRODUCT_ROADMAP,
] as const;
