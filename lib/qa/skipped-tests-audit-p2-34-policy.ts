/**
 * Blueprint P2-34 — Skipped tests audit (20 entries: fix or keep-gated).
 *
 * @see lib/qa/skipped-tests-inventory.ts
 * @see docs/skipped-tests-audit-p2-34.md
 * @see tests/unit/skipped-tests-audit-p2-34.test.ts
 */

export const SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID = "skipped-tests-audit-p2-34-v1" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT = 20 as const;

export const SKIPPED_TESTS_AUDIT_P2_34_DOC = "docs/skipped-tests-audit-p2-34.md" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_INVENTORY =
  "lib/qa/skipped-tests-inventory.ts" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_AUDIT_SCRIPT =
  "scripts/audit-skipped-tests-p2-34.ts" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_NPM_SCRIPT = "audit:skipped-tests-p2-34" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_UNIT_TEST =
  "tests/unit/skipped-tests-audit-p2-34.test.ts" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS = [
  "scan_skip_patterns",
  "resolve_twenty_entries",
  "apply_fix_or_delete",
  "verify_registry",
] as const;

export type SkippedTestDisposition = "fixed" | "keep-gated" | "deleted";

export type SkippedTestAuditEntry = {
  id: string;
  file: string;
  testName: string;
  priorSkipReason: string;
  disposition: SkippedTestDisposition;
  resolution: string;
};

/** Twenty audited skips — fixed via chromium-authed wiring or documented env gates. */
export const SKIPPED_TESTS_AUDIT_P2_34_ENTRIES: SkippedTestAuditEntry[] = [
  {
    id: "p2-34-01",
    file: "e2e/verticals/ghost-kitchen.spec.ts",
    testName: "brands command center reachable",
    priorSkipReason: "E2E_SESSION_COOKIE required",
    disposition: "fixed",
    resolution: "Moved to chromium-authed; removed session-cookie skip",
  },
  {
    id: "p2-34-02",
    file: "e2e/verticals/meal-prep.spec.ts",
    testName: "today command center loads",
    priorSkipReason: "E2E_SESSION_COOKIE required",
    disposition: "fixed",
    resolution: "Moved to chromium-authed; removed session-cookie skip",
  },
  {
    id: "p2-34-03",
    file: "e2e/verticals/cafe.spec.ts",
    testName: "POS terminal page loads",
    priorSkipReason: "E2E_SESSION_COOKIE required",
    disposition: "fixed",
    resolution: "Moved to chromium-authed; removed session-cookie skip",
  },
  {
    id: "p2-34-04",
    file: "e2e/real-time-profit.spec.ts",
    testName: "profit page loads mobile layout",
    priorSkipReason: "Requires authenticated session",
    disposition: "fixed",
    resolution: "chromium-authed storageState; removed login redirect skip",
  },
  {
    id: "p2-34-05",
    file: "e2e/real-time-profit.spec.ts",
    testName: "profit API returns snapshot shape",
    priorSkipReason: "API requires auth cookie",
    disposition: "fixed",
    resolution: "chromium-authed storageState; removed 401 skip",
  },
  {
    id: "p2-34-06",
    file: "e2e/real-time-profit.spec.ts",
    testName: "profit engine API returns 30s breakdown shape",
    priorSkipReason: "API requires auth cookie",
    disposition: "fixed",
    resolution: "chromium-authed storageState; removed 401 skip",
  },
  {
    id: "p2-34-07",
    file: "e2e/real-time-profit.spec.ts",
    testName: "profit engine breakdown on profit page",
    priorSkipReason: "Requires authenticated session",
    disposition: "fixed",
    resolution: "chromium-authed storageState; removed login redirect skip",
  },
  {
    id: "p2-34-08",
    file: "e2e/dynamic-pricing.spec.ts",
    testName: "page shows panel and toggle",
    priorSkipReason: "skipIfLoginRedirect",
    disposition: "fixed",
    resolution: "chromium-authed; removed skipIfLoginRedirect",
  },
  {
    id: "p2-34-09",
    file: "e2e/dynamic-pricing.spec.ts",
    testName: "API returns dashboard shape",
    priorSkipReason: "API requires auth cookie",
    disposition: "fixed",
    resolution: "chromium-authed; removed 401 skip",
  },
  {
    id: "p2-34-10",
    file: "e2e/invoice-scanner.spec.ts",
    testName: "invoice scanner page loads",
    priorSkipReason: "skipIfLoginRedirect",
    disposition: "fixed",
    resolution: "chromium-authed; removed skipIfLoginRedirect",
  },
  {
    id: "p2-34-11",
    file: "e2e/loyalty-2.0.spec.ts",
    testName: "program builder page renders when authed",
    priorSkipReason: "No authed session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-12",
    file: "e2e/gift-cards-system.spec.ts",
    testName: "loyalty gift cards hub renders when authed",
    priorSkipReason: "No authed session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-13",
    file: "e2e/menu-templates.spec.ts",
    testName: "templates page shows ten cuisine cards",
    priorSkipReason: "Requires authenticated session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-14",
    file: "e2e/menu-templates.spec.ts",
    testName: "preview modal lists template items",
    priorSkipReason: "Requires authenticated session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-15",
    file: "e2e/instant-payouts.spec.ts",
    testName: "instant payouts page renders when authed",
    priorSkipReason: "No authed session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-16",
    file: "e2e/qr-ordering.spec.ts",
    testName: "qr codes dashboard loads",
    priorSkipReason: "Requires authenticated session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-17",
    file: "e2e/handheld-ordering.spec.ts",
    testName: "loads table picker and product grid",
    priorSkipReason: "Unauthed chromium + POS register skip",
    disposition: "fixed",
    resolution: "chromium-authed; POS register skip retained when unset",
  },
  {
    id: "p2-34-18",
    file: "e2e/voice-ordering.spec.ts",
    testName: "settings voice page shows program copy when authed",
    priorSkipReason: "No authed session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-19",
    file: "e2e/white-label-pwa.spec.ts",
    testName: "settings branding shows PWA studio when authed",
    priorSkipReason: "No authed session",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
  {
    id: "p2-34-20",
    file: "e2e/referral-program.spec.ts",
    testName: "settings referrals page shows program copy when authed",
    priorSkipReason: "No authed session for referrals settings",
    disposition: "fixed",
    resolution: "chromium-authed; removed login redirect skip",
  },
];

export function countSkippedTestsAuditP2_34ByDisposition(
  disposition: SkippedTestDisposition,
): number {
  return SKIPPED_TESTS_AUDIT_P2_34_ENTRIES.filter((e) => e.disposition === disposition).length;
}
