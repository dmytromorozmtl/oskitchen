/**
 * Blueprint P1-73 — Integration Health marketing (dedicated landing section, explainer).
 *
 * @see docs/integration-health-marketing-explainer.md
 * @see components/marketing/integration-health-marketing-explainer-section.tsx
 */

export const INTEGRATION_HEALTH_MARKETING_POLICY_ID =
  "integration-health-marketing-p1-73-v1" as const;

export const INTEGRATION_HEALTH_MARKETING_DOC =
  "docs/integration-health-marketing-explainer.md" as const;

export const INTEGRATION_HEALTH_MARKETING_CONTENT_PATH =
  "lib/marketing/integration-health-marketing-content.ts" as const;

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT =
  "components/marketing/integration-health-marketing-explainer-section.tsx" as const;

export const INTEGRATION_HEALTH_MARKETING_LANDING_PAGE =
  "app/integration-health-center/page.tsx" as const;

export const INTEGRATION_HEALTH_MARKETING_LANDING_COMPONENT =
  "components/marketing/integration-health-center-marketing-landing.tsx" as const;

export const INTEGRATION_HEALTH_MARKETING_HOME_MOAT =
  "components/marketing/landing-integration-health-moat.tsx" as const;

export const INTEGRATION_HEALTH_MARKETING_ROUTE = "/integration-health-center" as const;

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_TEST_ID =
  "integration-health-marketing-explainer" as const;

export const INTEGRATION_HEALTH_MARKETING_EXPLAINER_HEADLINE =
  "Integration Health — operational truth before rush hour" as const;

export const INTEGRATION_HEALTH_MARKETING_HONESTY_MARKERS = [
  "SKIPPED",
  "BETA",
  "not fake green",
  "not guaranteed uptime",
] as const;

export const INTEGRATION_HEALTH_MARKETING_AUDIT_SCRIPT =
  "scripts/audit-integration-health-marketing.ts" as const;

export const INTEGRATION_HEALTH_MARKETING_NPM_SCRIPT =
  "audit:integration-health-marketing" as const;

export const INTEGRATION_HEALTH_MARKETING_UNIT_TEST =
  "tests/unit/integration-health-marketing.test.ts" as const;

export const INTEGRATION_HEALTH_MARKETING_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INTEGRATION_HEALTH_MARKETING_WIRING_PATHS = [
  INTEGRATION_HEALTH_MARKETING_DOC,
  INTEGRATION_HEALTH_MARKETING_CONTENT_PATH,
  INTEGRATION_HEALTH_MARKETING_EXPLAINER_COMPONENT,
  INTEGRATION_HEALTH_MARKETING_LANDING_PAGE,
  INTEGRATION_HEALTH_MARKETING_LANDING_COMPONENT,
  INTEGRATION_HEALTH_MARKETING_HOME_MOAT,
  "lib/marketing/integration-health-marketing-policy.ts",
  "lib/marketing/integration-health-marketing-audit.ts",
  INTEGRATION_HEALTH_MARKETING_UNIT_TEST,
] as const;
