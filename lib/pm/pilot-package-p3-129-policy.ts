/**
 * Blueprint P3-129 — Pilot package v1 (Today + POS + KDS + Quick Start + 3 LIVE).
 *
 * @see docs/pilot-package-v1.md
 */

export const PILOT_PACKAGE_POLICY_ID = "pilot-package-p3-129-v1" as const;

export const PILOT_PACKAGE_DOC = "docs/pilot-package-v1.md" as const;

export const PILOT_PACKAGE_ARTIFACT = "artifacts/pilot-package-v1.json" as const;

export const PILOT_PACKAGE_AUDIT_SCRIPT = "scripts/audit-pilot-package-p3-129.ts" as const;

export const PILOT_PACKAGE_NPM_SCRIPT = "audit:pilot-package-p3-129" as const;

export const PILOT_PACKAGE_UNIT_TEST = "tests/unit/pilot-package-p3-129.test.ts" as const;

export const PILOT_PACKAGE_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const PILOT_PACKAGE_CORE_MODULE_COUNT = 4 as const;

export const PILOT_PACKAGE_LIVE_INTEGRATION_COUNT = 3 as const;

export const PILOT_PACKAGE_INTEGRATION_REGISTRY = "lib/integrations/integration-registry.ts" as const;

export const PILOT_PACKAGE_CORE_MODULES = [
  {
    id: "today",
    label: "Today command center",
    path: "/dashboard/today",
    pagePath: "app/dashboard/today/page.tsx",
    maturity: "pilot_ready",
  },
  {
    id: "pos",
    label: "POS terminal",
    path: "/dashboard/pos",
    pagePath: "app/dashboard/pos/page.tsx",
    maturity: "beta",
  },
  {
    id: "kds",
    label: "Kitchen KDS",
    path: "/dashboard/kitchen",
    pagePath: "app/dashboard/kitchen/page.tsx",
    maturity: "pilot_ready",
  },
  {
    id: "quick_start",
    label: "Quick Start wizard",
    path: "/dashboard/quick-start",
    pagePath: "app/dashboard/quick-start/page.tsx",
    maturity: "beta",
  },
] as const;

export const PILOT_PACKAGE_LIVE_INTEGRATIONS = [
  {
    id: "stripe",
    registryId: "stripe",
    label: "Stripe payments",
    setupRoute: "/dashboard/integrations/stripe",
    pilotRole: "payments_and_payouts",
  },
  {
    id: "shopify",
    registryId: "shopify",
    label: "Shopify commerce",
    setupRoute: "/dashboard/integrations/shopify",
    pilotRole: "order_ingest_webhook",
  },
  {
    id: "doordash",
    registryId: "doordash",
    label: "DoorDash delivery",
    setupRoute: "/dashboard/integrations/doordash",
    pilotRole: "delivery_channel_webhook",
  },
] as const;

export const PILOT_PACKAGE_RELATED_DOCS = [
  "docs/loi-pipeline.md",
  "docs/weekly-go-no-go-log.md",
  "docs/era20-first-paid-pilot-package-2026-05-28.md",
  "artifacts/pilot-gono-go-summary.json",
  "lib/integrations/integration-registry.ts",
] as const;

export const PILOT_PACKAGE_HONESTY_MARKERS = [
  "BETA",
  "pilot_ready",
  "0 signed LOIs",
  "verify",
  "qualified beta",
  "not production-certified",
] as const;

export const PILOT_PACKAGE_WIRING_PATHS = [
  PILOT_PACKAGE_DOC,
  "lib/pm/pilot-package-p3-129-policy.ts",
  "lib/pm/pilot-package-p3-129-operations.ts",
  "lib/pm/pilot-package-p3-129-audit.ts",
  PILOT_PACKAGE_ARTIFACT,
  PILOT_PACKAGE_UNIT_TEST,
] as const;
