/**
 * Absolute Final Task 149 — full security audit (OWASP Top 10 2021).
 *
 * @see docs/SECURITY_REVIEW.md
 * @see tests/unit/absolute-final-owasp-top-10-security.test.ts
 */

export const OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID =
  "absolute-final-owasp-top-10-v1" as const;

export const OWASP_TOP_10_VERSION = "2021" as const;

export const OWASP_TOP_10_DOC_PATH = "docs/SECURITY_REVIEW.md" as const;

export const OWASP_TOP_10_CATEGORY_COUNT = 10 as const;

export type OwaspTop10Category = {
  id: string;
  name: string;
  controlPaths: readonly string[];
};

/** OWASP Top 10 2021 — mapped to existing KitchenOS security controls. */
export const OWASP_TOP_10_CATEGORIES: readonly OwaspTop10Category[] = [
  {
    id: "A01",
    name: "Broken Access Control",
    controlPaths: [
      "lib/security/rbac-matrix-e2e-policy.ts",
      "e2e/rbac-matrix.spec.ts",
      "tests/unit/mutation-access.test.ts",
      "middleware.ts",
    ],
  },
  {
    id: "A02",
    name: "Cryptographic Failures",
    controlPaths: [
      "lib/security/timing-safe.ts",
      "lib/security/pii-field.ts",
      "lib/security/sensitive-redaction.ts",
    ],
  },
  {
    id: "A03",
    name: "Injection",
    controlPaths: [
      "tests/unit/mutation-access.test.ts",
      "lib/api/middleware-api-rate-limit.ts",
    ],
  },
  {
    id: "A04",
    name: "Insecure Design",
    controlPaths: [
      "lib/security/mutation-origin-guard.ts",
      "lib/security/csrf-server-actions-e2e-policy.ts",
      "e2e/csrf-server-actions.spec.ts",
    ],
  },
  {
    id: "A05",
    name: "Security Misconfiguration",
    controlPaths: [
      ".github/workflows/ci.yml",
      ".github/workflows/deploy-prod-gate.yml",
      "tests/unit/npm-audit-ci-gate.test.ts",
    ],
  },
  {
    id: "A06",
    name: "Vulnerable and Outdated Components",
    controlPaths: [
      "tests/unit/npm-audit-ci-gate.test.ts",
      "docs/DEPENDENCY_SECURITY_UPDATE_PROCESS.md",
    ],
  },
  {
    id: "A07",
    name: "Identification and Authentication Failures",
    controlPaths: [
      "middleware.ts",
      "lib/security/cron-auth.ts",
    ],
  },
  {
    id: "A08",
    name: "Software and Data Integrity Failures",
    controlPaths: [
      "lib/security/webhook-security-matrix.ts",
      "lib/security/webhook-security-era16-policy.ts",
      "tests/unit/webhook-security-matrix.test.ts",
    ],
  },
  {
    id: "A09",
    name: "Security Logging and Monitoring Failures",
    controlPaths: [
      "tests/unit/cron-execution-evidence.test.ts",
      "app/dashboard/security/audit-logs/page.tsx",
    ],
  },
  {
    id: "A10",
    name: "Server-Side Request Forgery",
    controlPaths: [
      "docs/pen-test-plan.md",
      "lib/security/mutation-origin-guard.ts",
    ],
  },
] as const;

export const OWASP_TOP_10_WIRING_PATHS = [
  OWASP_TOP_10_DOC_PATH,
  "lib/security/absolute-final-owasp-top-10-policy.ts",
  "lib/security/absolute-final-owasp-top-10-audit.ts",
  "lib/security/rbac-matrix-e2e-policy.ts",
  "lib/security/mutation-origin-guard.ts",
  "lib/security/csrf-server-actions-e2e-policy.ts",
  "lib/security/webhook-security-matrix.ts",
  "lib/security/webhook-security-era16-policy.ts",
  "lib/security/cron-auth.ts",
  "lib/security/timing-safe.ts",
  "lib/api/middleware-api-rate-limit.ts",
  "scripts/lib/api-mutation-rate-limit-audit.ts",
  "tests/unit/absolute-final-owasp-top-10-security.test.ts",
  "tests/unit/npm-audit-ci-gate.test.ts",
  "tests/unit/mutation-access.test.ts",
  "tests/unit/webhook-security-matrix.test.ts",
  "tests/unit/api-mutation-rate-limit.test.ts",
  "tests/unit/rate-limit-response.test.ts",
  "e2e/rbac-matrix.spec.ts",
  "e2e/csrf-server-actions.spec.ts",
  ".github/workflows/ci.yml",
  ".github/workflows/deploy-prod-gate.yml",
  "docs/pen-test-plan.md",
  "docs/DEPENDENCY_SECURITY_UPDATE_PROCESS.md",
  "middleware.ts",
] as const;

export const OWASP_TOP_10_UNIT_TEST =
  "tests/unit/absolute-final-owasp-top-10-security.test.ts" as const;

export const OWASP_TOP_10_CI_SCRIPTS = [
  "test:ci:owasp-top-10-absolute-final",
  "test:ci:owasp-top-10-absolute-final:cert",
] as const;

export const OWASP_TOP_10_MANUAL_GATE_NOTE =
  "Automated wiring cert only — not a penetration test; run docs/pen-test-plan.md before enterprise procurement." as const;

export const OWASP_TOP_10_BLOCKED_CONTROLS = [
  "Sentry production DSN (Task 2 blocked until sentryServer.ok)",
] as const;
