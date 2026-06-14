/**
 * P3-87 — Public /changelog updates with LIVE / BETA / PREVIEW maturity labels.
 *
 * @see docs/public-changelog-updates-p3-87.md
 */

export const PUBLIC_CHANGELOG_P3_87_POLICY_ID = "public-changelog-updates-p3-87-v1" as const;

export const PUBLIC_CHANGELOG_P3_87_DOC = "docs/public-changelog-updates-p3-87.md" as const;

export const PUBLIC_CHANGELOG_P3_87_ARTIFACT = "artifacts/public-changelog-updates-p3-87.json" as const;

export const PUBLIC_CHANGELOG_P3_87_CONTENT_MODULE =
  "lib/marketing/public-changelog-p3-87-content.ts" as const;

export const PUBLIC_CHANGELOG_P3_87_AUDIT_MODULE =
  "lib/marketing/public-changelog-p3-87-audit.ts" as const;

export const PUBLIC_CHANGELOG_P3_87_COMPONENT =
  "components/marketing/public-changelog-entries.tsx" as const;

export const PUBLIC_CHANGELOG_P3_87_CHECK_NPM_SCRIPT =
  "check:public-changelog-p3-87" as const;

export const PUBLIC_CHANGELOG_P3_87_UNIT_TEST =
  "tests/unit/public-changelog-p3-87.test.ts" as const;

export const PUBLIC_CHANGELOG_P3_87_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const PUBLIC_CHANGELOG_P3_87_ROUTE = "app/changelog/page.tsx" as const;

export const PUBLIC_CHANGELOG_P3_87_ROOT_CHANGELOG = "CHANGELOG.md" as const;

export const PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS = ["LIVE", "BETA", "PREVIEW"] as const;

export const PUBLIC_CHANGELOG_P3_87_MIN_RELEASES = 3 as const;

export const PUBLIC_CHANGELOG_P3_87_WIRING_PATHS = [
  PUBLIC_CHANGELOG_P3_87_DOC,
  PUBLIC_CHANGELOG_P3_87_ARTIFACT,
  PUBLIC_CHANGELOG_P3_87_AUDIT_MODULE,
  PUBLIC_CHANGELOG_P3_87_CONTENT_MODULE,
  PUBLIC_CHANGELOG_P3_87_COMPONENT,
  PUBLIC_CHANGELOG_P3_87_UNIT_TEST,
  PUBLIC_CHANGELOG_P3_87_CI_WORKFLOW,
  PUBLIC_CHANGELOG_P3_87_ROUTE,
  PUBLIC_CHANGELOG_P3_87_ROOT_CHANGELOG,
  "docs/CHANGELOG_RELEASE_NOTES_FINAL.md",
] as const;
