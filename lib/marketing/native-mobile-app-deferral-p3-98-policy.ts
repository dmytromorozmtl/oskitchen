/**
 * P3-98 — Native mobile app (iOS + Android) deferred until $1M ARR.
 *
 * @see docs/native-mobile-app-deferral-p3-98.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_POLICY_ID =
  "native-mobile-app-deferral-p3-98-v1" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_DOC =
  "docs/native-mobile-app-deferral-p3-98.md" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARTIFACT =
  "artifacts/native-mobile-app-deferral-p3-98.json" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_CONTENT_MODULE =
  "lib/marketing/native-mobile-app-deferral-p3-98-content.ts" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_AUDIT_MODULE =
  "lib/marketing/native-mobile-app-deferral-p3-98-audit.ts" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_CHECK_NPM_SCRIPT =
  "check:native-mobile-app-deferral-p3-98" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_UNIT_TEST =
  "tests/unit/native-mobile-app-deferral-p3-98.test.ts" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_ROADMAP_ITEM_ID = "native-mobile-app" as const;

/** Revisit gate — no native iOS/Android store apps before this ARR. */
export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARR_THRESHOLD = 1_000_000 as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const NATIVE_MOBILE_APP_DEFERRAL_P3_98_WIRING_PATHS = [
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_DOC,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_ARTIFACT,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_CONTENT_MODULE,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_AUDIT_MODULE,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_UNIT_TEST,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_CI_WORKFLOW,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_UPSTREAM_ROADMAP,
  NATIVE_MOBILE_APP_DEFERRAL_P3_98_UPSTREAM_PRODUCT_ROADMAP,
] as const;
