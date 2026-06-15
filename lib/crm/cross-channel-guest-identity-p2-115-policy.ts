/**
 * Blueprint P2-115 — Cross-channel guest identity (unified profiles POS/storefront/delivery).
 *
 * @see docs/cross-channel-guest-identity.md
 * @see app/dashboard/crm/cross-channel-guest-identity/page.tsx
 */

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_POLICY_ID =
  "cross-channel-guest-identity-p2-115-v1" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC =
  "docs/cross-channel-guest-identity.md" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_SERVICE =
  "services/crm/unified-profile-service.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_POLICY =
  "lib/crm/unified-profile-policy.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_BUILDERS =
  "lib/crm/unified-profile-builders.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_SOURCES =
  "lib/crm/customer-sources.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_PANEL =
  "components/crm/unified-customer-profile-panel.tsx" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_HUB_PAGE =
  "app/dashboard/customers/unified-profile/page.tsx" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CONTENT_PATH =
  "lib/crm/cross-channel-guest-identity-p2-115-content.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH =
  "lib/crm/cross-channel-guest-identity-p2-115-operations.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SERVICE_PATH =
  "services/crm/cross-channel-guest-identity-p2-115-service.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT =
  "components/crm/cross-channel-guest-identity-panel.tsx" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_PAGE =
  "app/dashboard/crm/cross-channel-guest-identity/page.tsx" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_ROUTE =
  "/dashboard/crm/cross-channel-guest-identity" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIFIED_ROUTE =
  "/dashboard/customers/unified-profile" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CAPABILITY_COUNT = 3 as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_TEST_IDS = [
  "cross-channel-guest-identity",
  "cross-channel-pos",
  "cross-channel-storefront",
  "cross-channel-delivery",
] as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
] as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_AUDIT_SCRIPT =
  "scripts/audit-cross-channel-guest-identity-p2-115.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_NPM_SCRIPT =
  "audit:cross-channel-guest-identity-p2-115" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIT_TEST =
  "tests/unit/cross-channel-guest-identity-p2-115.test.ts" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const CROSS_CHANNEL_GUEST_IDENTITY_P2_115_WIRING_PATHS = [
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_DOC,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_CONTENT_PATH,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_OPERATIONS_PATH,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_SERVICE_PATH,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_COMPONENT,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_PAGE,
  "lib/crm/cross-channel-guest-identity-p2-115-policy.ts",
  "lib/crm/cross-channel-guest-identity-p2-115-audit.ts",
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_UNIT_TEST,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_SERVICE,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_UNIFIED_POLICY,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_BUILDERS,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_SOURCES,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_PANEL,
  CROSS_CHANNEL_GUEST_IDENTITY_P2_115_LEGACY_HUB_PAGE,
] as const;
