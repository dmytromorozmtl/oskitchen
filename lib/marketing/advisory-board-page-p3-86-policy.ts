/**
 * P3-86 — Advisory board page: real members only or honest recruiting mode.
 *
 * @see docs/advisory-board-page-p3-86.md
 * @see docs/CUSTOMER_ADVISORY_BOARD.md
 */

export const ADVISORY_BOARD_PAGE_P3_86_POLICY_ID = "advisory-board-page-p3-86-v1" as const;

export const ADVISORY_BOARD_PAGE_P3_86_DOC = "docs/advisory-board-page-p3-86.md" as const;

export const ADVISORY_BOARD_PAGE_P3_86_ARTIFACT =
  "artifacts/advisory-board-page-p3-86.json" as const;

export const ADVISORY_BOARD_PAGE_P3_86_CONTENT_MODULE =
  "lib/marketing/advisory-board-page-p3-86-content.ts" as const;

export const ADVISORY_BOARD_PAGE_P3_86_AUDIT_MODULE =
  "lib/marketing/advisory-board-page-p3-86-audit.ts" as const;

export const ADVISORY_BOARD_PAGE_P3_86_CHECK_NPM_SCRIPT =
  "check:advisory-board-page-p3-86" as const;

export const ADVISORY_BOARD_PAGE_P3_86_UNIT_TEST =
  "tests/unit/advisory-board-page-p3-86.test.ts" as const;

export const ADVISORY_BOARD_PAGE_P3_86_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const ADVISORY_BOARD_PAGE_P3_86_ROUTE = "app/advisory-board/page.tsx" as const;

export const ADVISORY_BOARD_PAGE_P3_86_PLAYBOOK_DOC = "docs/CUSTOMER_ADVISORY_BOARD.md" as const;

/** No fabricated board — application-only until real members opt in. */
export const ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE = "recruiting_application_only" as const;

export const ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT = 0 as const;

export const ADVISORY_BOARD_PAGE_P3_86_HONESTY_MARKERS = [
  "recruiting",
  "no published advisory board members",
  "explicit permission",
  "feedback program",
  "not a paid customer claim",
] as const;

export const ADVISORY_BOARD_PAGE_P3_86_FORBIDDEN_PATTERNS = [
  "our advisors include",
  "meet our advisory board",
  "board of directors",
  "former ceo of",
  "advisor-card",
  "advisory-board-member",
] as const;

export const ADVISORY_BOARD_PAGE_P3_86_WIRING_PATHS = [
  ADVISORY_BOARD_PAGE_P3_86_DOC,
  ADVISORY_BOARD_PAGE_P3_86_ARTIFACT,
  ADVISORY_BOARD_PAGE_P3_86_AUDIT_MODULE,
  ADVISORY_BOARD_PAGE_P3_86_CONTENT_MODULE,
  ADVISORY_BOARD_PAGE_P3_86_UNIT_TEST,
  ADVISORY_BOARD_PAGE_P3_86_CI_WORKFLOW,
  ADVISORY_BOARD_PAGE_P3_86_ROUTE,
  ADVISORY_BOARD_PAGE_P3_86_PLAYBOOK_DOC,
  "actions/scale.ts",
] as const;
