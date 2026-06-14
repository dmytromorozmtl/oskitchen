/**
 * P3-95 — Native iOS operator app (App Store) deferred.
 *
 * @see docs/native-ios-app-deferral-p3-95.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const NATIVE_IOS_APP_DEFERRAL_P3_95_POLICY_ID =
  "native-ios-app-deferral-p3-95-v1" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_DOC = "docs/native-ios-app-deferral-p3-95.md" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_ARTIFACT =
  "artifacts/native-ios-app-deferral-p3-95.json" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_CONTENT_MODULE =
  "lib/marketing/native-ios-app-deferral-p3-95-content.ts" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_AUDIT_MODULE =
  "lib/marketing/native-ios-app-deferral-p3-95-audit.ts" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_CHECK_NPM_SCRIPT =
  "check:native-ios-app-deferral-p3-95" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_UNIT_TEST =
  "tests/unit/native-ios-app-deferral-p3-95.test.ts" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_ROADMAP_ITEM_ID = "native-ios-app" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const NATIVE_IOS_APP_DEFERRAL_P3_95_WIRING_PATHS = [
  NATIVE_IOS_APP_DEFERRAL_P3_95_DOC,
  NATIVE_IOS_APP_DEFERRAL_P3_95_ARTIFACT,
  NATIVE_IOS_APP_DEFERRAL_P3_95_CONTENT_MODULE,
  NATIVE_IOS_APP_DEFERRAL_P3_95_AUDIT_MODULE,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UNIT_TEST,
  NATIVE_IOS_APP_DEFERRAL_P3_95_CI_WORKFLOW,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_ROADMAP,
  NATIVE_IOS_APP_DEFERRAL_P3_95_UPSTREAM_PRODUCT_ROADMAP,
] as const;
