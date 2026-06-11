/**
 * Blueprint P1-71 — Forbidden claims audit for top marketing routes.
 *
 * Scans /, /pricing, /demo, /trust, /shopify for governance blocklist hits
 * and required honesty markers per route.
 *
 * @see docs/forbidden-claims-audit.md
 * @see artifacts/forbidden-claims-marketing-pages-audit.json
 */

export const FORBIDDEN_CLAIMS_AUDIT_POLICY_ID =
  "forbidden-claims-audit-p1-71-v1" as const;

export const FORBIDDEN_CLAIMS_AUDIT_DOC = "docs/forbidden-claims-audit.md" as const;

export const FORBIDDEN_CLAIMS_AUDIT_ARTIFACT =
  "artifacts/forbidden-claims-marketing-pages-audit.json" as const;

export const FORBIDDEN_CLAIMS_AUDIT_AUDIT_SCRIPT =
  "scripts/audit-forbidden-claims-marketing-pages.ts" as const;

export const FORBIDDEN_CLAIMS_AUDIT_NPM_SCRIPT =
  "audit:forbidden-claims-marketing-pages" as const;

export const FORBIDDEN_CLAIMS_AUDIT_UNIT_TEST =
  "tests/unit/forbidden-claims-audit.test.ts" as const;

export const FORBIDDEN_CLAIMS_AUDIT_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export type ForbiddenClaimsAuditRoute = {
  route: string;
  pageModule: string;
  /** At least one marker must appear in combined route copy. */
  honestyMarkers: readonly string[];
  /** Source modules scanned for forbidden phrases. */
  scanModules: readonly string[];
};

export const FORBIDDEN_CLAIMS_AUDIT_ROUTES: readonly ForbiddenClaimsAuditRoute[] = [
  {
    route: "/",
    pageModule: "app/page.tsx",
    honestyMarkers: ["partner-gated", "not live today", "Integration Health"],
    scanModules: [
      "app/page.tsx",
      "components/marketing/home-landing.tsx",
      "components/marketing/landing-integration-health-moat.tsx",
    ],
  },
  {
    route: "/pricing",
    pageModule: "app/pricing/page.tsx",
    honestyMarkers: [
      "Conservative estimate",
      "not as a guaranteed",
      "no hardware lock-in",
    ],
    scanModules: [
      "app/pricing/page.tsx",
      "components/marketing/pricing-page.tsx",
      "components/marketing/pilot-pricing-section.tsx",
      "lib/marketing/public-pricing-content.ts",
      "lib/marketing/pricing-faq.ts",
    ],
  },
  {
    route: "/demo",
    pageModule: "app/demo/page.tsx",
    honestyMarkers: ["demo", "No signup", "temp workspace"],
    scanModules: [
      "app/demo/page.tsx",
      "components/demo/demo-launch-button.tsx",
      "components/demo/demo-import-form.tsx",
    ],
  },
  {
    route: "/trust",
    pageModule: "app/trust/page.tsx",
    honestyMarkers: ["not formal SOC 2", "BETA", "SKIPPED"],
    scanModules: [
      "app/trust/page.tsx",
      "components/marketing/trust-maturity-labels-section.tsx",
      "components/marketing/public-page.tsx",
    ],
  },
  {
    route: "/shopify",
    pageModule: "app/shopify/page.tsx",
    honestyMarkers: [
      "beta",
      "not listed on Shopify App Store",
      "Honest scope",
    ],
    scanModules: [
      "app/shopify/page.tsx",
      "components/marketing/shopify-bundle-landing.tsx",
      "lib/marketing/shopify-bundle-content.ts",
    ],
  },
] as const;

/** Doc must reference every audited route. */
export const FORBIDDEN_CLAIMS_AUDIT_DOC_ROUTE_MARKERS = FORBIDDEN_CLAIMS_AUDIT_ROUTES.map(
  (entry) => entry.route,
);

export const FORBIDDEN_CLAIMS_AUDIT_UPSTREAM_POLICY =
  "lib/governance/marketing-claims-governance-policy.ts" as const;
