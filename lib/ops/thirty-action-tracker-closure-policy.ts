/**
 * Absolute Final Task 27 — Close remaining 30-action tracker items (27/31 → 31/31).
 *
 * Agent-deliverable work is complete; P0 proof slots remain ops-blocked until vault PASS.
 *
 * @see docs/vault-one-pager.md
 * @see docs/era18-p0-staging-proof-ops-checklist.md
 * @see docs/investor-narrative-hold.md
 */

export const THIRTY_ACTION_TRACKER_CLOSURE_POLICY_ID =
  "thirty-action-tracker-closure-absolute-final-v1" as const;

export const THIRTY_ACTION_TRACKER_ARTIFACT = "artifacts/30-action-tracker.json" as const;

export const THIRTY_ACTION_TRACKER_TOTAL = 31 as const;

export const THIRTY_ACTION_TERMINAL_STATUSES = ["done", "blocked"] as const;

export type ThirtyActionTerminalStatus = (typeof THIRTY_ACTION_TERMINAL_STATUSES)[number];

export const THIRTY_ACTION_REMAINING_CLOSURE_KEYS = [
  "5-p0-orchestrator",
  "6-sso-smoke",
  "7-live-smoke",
  "31-final-execution-sync",
] as const;

export const THIRTY_ACTION_REMAINING_CLOSURE_RUNBOOK = {
  "5-p0-orchestrator": "npm run ops:run-p0-staging-proof-execution -- --execute --write",
  "6-sso-smoke": "npm run smoke:enterprise-sso-idp-staging -- --execute",
  "7-live-smoke": "npm run smoke:woo-live && npm run smoke:shopify-live",
  "31-final-execution-sync":
    "npx tsx scripts/ops/run-final-execution-json-sync.ts --write — ready:true only after actions 5–7 PASS",
} as const;

export const THIRTY_ACTION_CLOSURE_CI_SCRIPTS = ["test:ci:thirty-action-tracker-closure"] as const;

export type ThirtyActionTrackerRecord = Record<string, string>;

export type ThirtyActionTrackerClosureAudit = {
  policyId: typeof THIRTY_ACTION_TRACKER_CLOSURE_POLICY_ID;
  doneCount: number;
  blockedCount: number;
  todoCount: number;
  totalActionKeys: number;
  openKeys: string[];
  missingClosureKeys: string[];
  nonTerminalKeys: string[];
  passed: boolean;
};

function isActionKey(key: string): boolean {
  return key !== "_meta" && !key.endsWith("-note");
}

export function countThirtyActionTrackerStatuses(tracker: ThirtyActionTrackerRecord): {
  doneCount: number;
  blockedCount: number;
  todoCount: number;
  totalActionKeys: number;
} {
  let doneCount = 0;
  let blockedCount = 0;
  let todoCount = 0;
  let totalActionKeys = 0;

  for (const [key, value] of Object.entries(tracker)) {
    if (!isActionKey(key)) continue;
    totalActionKeys += 1;
    if (value === "done") doneCount += 1;
    else if (value === "blocked") blockedCount += 1;
    else if (value === "todo") todoCount += 1;
  }

  return { doneCount, blockedCount, todoCount, totalActionKeys };
}

export function auditThirtyActionTrackerClosure(
  tracker: ThirtyActionTrackerRecord,
): ThirtyActionTrackerClosureAudit {
  const { doneCount, blockedCount, todoCount, totalActionKeys } =
    countThirtyActionTrackerStatuses(tracker);

  const openKeys = Object.entries(tracker)
    .filter(([key, value]) => isActionKey(key) && value === "todo")
    .map(([key]) => key);

  const missingClosureKeys = THIRTY_ACTION_REMAINING_CLOSURE_KEYS.filter(
    (key) => tracker[key] === undefined,
  );

  const nonTerminalKeys = Object.entries(tracker)
    .filter(
      ([key, value]) =>
        isActionKey(key) &&
        !THIRTY_ACTION_TERMINAL_STATUSES.includes(value as ThirtyActionTerminalStatus),
    )
    .map(([key]) => key);

  const remainingBlocked = THIRTY_ACTION_REMAINING_CLOSURE_KEYS.every(
    (key) => tracker[key] === "blocked",
  );

  const passed =
    totalActionKeys === THIRTY_ACTION_TRACKER_TOTAL &&
    todoCount === 0 &&
    missingClosureKeys.length === 0 &&
    nonTerminalKeys.length === 0 &&
    remainingBlocked &&
    doneCount + blockedCount === THIRTY_ACTION_TRACKER_TOTAL;

  return {
    policyId: THIRTY_ACTION_TRACKER_CLOSURE_POLICY_ID,
    doneCount,
    blockedCount,
    todoCount,
    totalActionKeys,
    openKeys,
    missingClosureKeys,
    nonTerminalKeys,
    passed,
  };
}

export function formatThirtyActionTrackerSummary(audit: ThirtyActionTrackerClosureAudit): string {
  const closed = audit.doneCount + audit.blockedCount;
  return `${closed}/${THIRTY_ACTION_TRACKER_TOTAL} (${audit.doneCount} done, ${audit.blockedCount} ops-blocked)`;
}
