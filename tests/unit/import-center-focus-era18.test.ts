import { describe, expect, it } from "vitest";

import {
  IMPORT_CENTER_FOCUS_ERA18_BACKLOG_ID,
  IMPORT_CENTER_FOCUS_ERA18_POLICY_ID,
  IMPORT_CENTER_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/import-center/import-center-focus-era18-policy";
import {
  buildImportCenterFocusSnapshot,
  pickImportCenterAttentionItems,
  resolveImportJobRowNextAction,
} from "@/lib/import-center/import-center-focus-era18";

describe("import-center-focus-era18 policy", () => {
  it("registers era18 import center focus proof", () => {
    expect(IMPORT_CENTER_FOCUS_ERA18_POLICY_ID).toBe("era18-import-center-focus-v1");
    expect(IMPORT_CENTER_FOCUS_ERA18_PROOF_STATUS).toBe("import_center_focus_attention_wired");
    expect(IMPORT_CENTER_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-037");
  });
});

describe("pickImportCenterAttentionItems", () => {
  it("prioritizes failed imports and ready-to-commit jobs", () => {
    const items = pickImportCenterAttentionItems(
      buildImportCenterFocusSnapshot({
        failedCount: 2,
        pendingValidation: 1,
        readyToCommit: 3,
        rowsWithErrorsThisMonth: 0,
        rollbackEligibleJobs: 0,
      }),
    );

    expect(items[0]?.id).toBe("failed-imports");
    expect(items[1]?.id).toBe("ready-to-commit");
    expect(items[0]?.tone).toBe("urgent");
  });

  it("returns empty when pipeline is clear", () => {
    expect(
      pickImportCenterAttentionItems(
        buildImportCenterFocusSnapshot({
          failedCount: 0,
          pendingValidation: 0,
          readyToCommit: 0,
          rowsWithErrorsThisMonth: 0,
          rollbackEligibleJobs: 0,
        }),
      ),
    ).toEqual([]);
  });
});

describe("resolveImportJobRowNextAction", () => {
  it("returns urgent review for failed jobs", () => {
    expect(
      resolveImportJobRowNextAction({
        id: "job-1",
        status: "FAILED",
        errorRows: 0,
        hasCompletedRollback: false,
      }),
    ).toEqual({
      label: "Review failed import",
      href: "/dashboard/import-center/jobs/job-1",
      tone: "urgent",
    });
  });

  it("returns commit action for validated jobs", () => {
    expect(
      resolveImportJobRowNextAction({
        id: "job-2",
        status: "VALIDATED",
        errorRows: 0,
        hasCompletedRollback: false,
      }),
    ).toMatchObject({ label: "Commit validated rows", tone: "urgent" });
  });

  it("returns null for successfully imported jobs without row errors", () => {
    expect(
      resolveImportJobRowNextAction({
        id: "job-3",
        status: "IMPORTED",
        errorRows: 0,
        hasCompletedRollback: false,
      }),
    ).toBeNull();
  });
});
