/**
 * P1-27 — Trust page security details (webhook 59/59, uptime, residency, GDPR, PCI).
 *
 * @see docs/trust-page-security-p1-27.md
 */

export const TRUST_PAGE_SECURITY_P1_27_POLICY_ID = "trust-page-security-p1-27-v1" as const;

export const TRUST_PAGE_SECURITY_P1_27_DOC = "docs/trust-page-security-p1-27.md" as const;

export const TRUST_PAGE_SECURITY_P1_27_ARTIFACT = "artifacts/trust-page-security-p1-27.json" as const;

export const TRUST_PAGE_SECURITY_P1_27_CONTENT =
  "lib/marketing/trust-page-security-p1-27-content.ts" as const;

export const TRUST_PAGE_SECURITY_P1_27_COMPONENT =
  "components/marketing/trust-page-security-details-section.tsx" as const;

export const TRUST_PAGE_SECURITY_P1_27_PAGE = "app/trust/page.tsx" as const;

export const TRUST_PAGE_SECURITY_P1_27_TEST_ID = "trust-page-security-details-p1-27" as const;

export const TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT =
  "artifacts/webhook-signature-audit.json" as const;

export const TRUST_PAGE_SECURITY_P1_27_CHECK_NPM_SCRIPT =
  "check:trust-page-security-p1-27" as const;

export const TRUST_PAGE_SECURITY_P1_27_CI_NPM_SCRIPT =
  "test:ci:trust-page-security-p1-27" as const;

export const TRUST_PAGE_SECURITY_P1_27_UNIT_TEST =
  "tests/unit/trust-page-security-p1-27.test.ts" as const;

export const TRUST_PAGE_SECURITY_P1_27_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const TRUST_PAGE_SECURITY_P1_27_REQUIRED_TOPICS = [
  "webhook-security",
  "uptime",
  "data-residency",
  "gdpr",
  "pci",
] as const;

export const TRUST_PAGE_SECURITY_P1_27_WIRING_PATHS = [
  TRUST_PAGE_SECURITY_P1_27_DOC,
  TRUST_PAGE_SECURITY_P1_27_CONTENT,
  TRUST_PAGE_SECURITY_P1_27_COMPONENT,
  TRUST_PAGE_SECURITY_P1_27_PAGE,
  TRUST_PAGE_SECURITY_P1_27_UNIT_TEST,
  TRUST_PAGE_SECURITY_P1_27_ARTIFACT,
  TRUST_PAGE_SECURITY_P1_27_CI_WORKFLOW,
  TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT,
] as const;
