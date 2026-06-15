import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditThirtyActionTrackerClosure,
  formatThirtyActionTrackerSummary,
  THIRTY_ACTION_REMAINING_CLOSURE_KEYS,
  THIRTY_ACTION_REMAINING_CLOSURE_RUNBOOK,
  THIRTY_ACTION_TRACKER_ARTIFACT,
  THIRTY_ACTION_TRACKER_CLOSURE_POLICY_ID,
  THIRTY_ACTION_TRACKER_TOTAL,
} from "@/lib/ops/thirty-action-tracker-closure-policy";

const ROOT = process.cwd();

describe("30-action tracker closure (Task 27)", () => {
  it("locks absolute-final closure policy id and artifact path", () => {
    expect(THIRTY_ACTION_TRACKER_CLOSURE_POLICY_ID).toBe(
      "thirty-action-tracker-closure-absolute-final-v1",
    );
    expect(THIRTY_ACTION_TRACKER_ARTIFACT).toBe("artifacts/30-action-tracker.json");
    expect(THIRTY_ACTION_TRACKER_TOTAL).toBe(31);
    expect(THIRTY_ACTION_REMAINING_CLOSURE_KEYS).toHaveLength(4);
  });

  it("passes audit on canonical tracker — 31/31 closed (27 done + 4 ops-blocked)", () => {
    const source = readFileSync(join(ROOT, THIRTY_ACTION_TRACKER_ARTIFACT), "utf8");
    const tracker = JSON.parse(source) as Record<string, string>;
    const audit = auditThirtyActionTrackerClosure(tracker);

    expect(audit.openKeys, audit.openKeys.join("; ")).toEqual([]);
    expect(audit.missingClosureKeys, audit.missingClosureKeys.join("; ")).toEqual([]);
    expect(audit.nonTerminalKeys, audit.nonTerminalKeys.join("; ")).toEqual([]);
    expect(audit.doneCount).toBe(27);
    expect(audit.blockedCount).toBe(4);
    expect(audit.todoCount).toBe(0);
    expect(audit.totalActionKeys).toBe(31);
    expect(audit.passed).toBe(true);
    expect(formatThirtyActionTrackerSummary(audit)).toBe("31/31 (27 done, 4 ops-blocked)");
  });

  it("documents runbook commands for each remaining ops-blocked slot", () => {
    for (const key of THIRTY_ACTION_REMAINING_CLOSURE_KEYS) {
      expect(THIRTY_ACTION_REMAINING_CLOSURE_RUNBOOK[key]).toBeTruthy();
    }
    const source = readFileSync(join(ROOT, THIRTY_ACTION_TRACKER_ARTIFACT), "utf8");
    for (const key of THIRTY_ACTION_REMAINING_CLOSURE_KEYS) {
      expect(source).toContain(`"${key}"`);
      expect(source).toContain(`"${key}-note"`);
    }
  });

  it("requires investor hold until final-execution-sync unblocks", () => {
    const holdDoc = readFileSync(join(ROOT, "docs/investor-narrative-hold.md"), "utf8");
    const vaultDoc = readFileSync(join(ROOT, "docs/vault-one-pager.md"), "utf8");
    expect(holdDoc).toContain("HOLD");
    expect(vaultDoc).toContain("final-execution-report.json");
    expect(vaultDoc).toContain("actions 5–7 PASS");
  });
});
