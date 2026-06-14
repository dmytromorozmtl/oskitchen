/**
 * P3-97 — Proprietary dispatch / driver network deferred.
 *
 * @see docs/dispatch-network-deferral-p3-97.md
 * @see lib/marketing/public-roadmap-content.ts
 */

export const DISPATCH_NETWORK_DEFERRAL_P3_97_POLICY_ID =
  "dispatch-network-deferral-p3-97-v1" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_DOC =
  "docs/dispatch-network-deferral-p3-97.md" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_ARTIFACT =
  "artifacts/dispatch-network-deferral-p3-97.json" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_CONTENT_MODULE =
  "lib/marketing/dispatch-network-deferral-p3-97-content.ts" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_AUDIT_MODULE =
  "lib/marketing/dispatch-network-deferral-p3-97-audit.ts" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_CHECK_NPM_SCRIPT =
  "check:dispatch-network-deferral-p3-97" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_UNIT_TEST =
  "tests/unit/dispatch-network-deferral-p3-97.test.ts" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_ROADMAP_ITEM_ID = "dispatch-network" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_ROADMAP =
  "lib/marketing/public-roadmap-content.ts" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_PRODUCT_ROADMAP =
  "docs/PRODUCT_ROADMAP_2026.md" as const;

export const DISPATCH_NETWORK_DEFERRAL_P3_97_WIRING_PATHS = [
  DISPATCH_NETWORK_DEFERRAL_P3_97_DOC,
  DISPATCH_NETWORK_DEFERRAL_P3_97_ARTIFACT,
  DISPATCH_NETWORK_DEFERRAL_P3_97_CONTENT_MODULE,
  DISPATCH_NETWORK_DEFERRAL_P3_97_AUDIT_MODULE,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UNIT_TEST,
  DISPATCH_NETWORK_DEFERRAL_P3_97_CI_WORKFLOW,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_ROADMAP,
  DISPATCH_NETWORK_DEFERRAL_P3_97_UPSTREAM_PRODUCT_ROADMAP,
] as const;
