import { describe, expect, it } from "vitest";

import { canViewSensitiveAuditDetailFromGrants } from "@/lib/audit/audit-permissions";
import { stripSensitiveDetailForViewer } from "@/services/audit/audit-query-service";

const sampleRow = {
  id: "log-1",
  beforeJson: { status: "draft" },
  afterJson: { status: "live" },
  diffJson: { status: ["draft", "live"] },
  metadataJson: { route: "/api/test" },
};

describe("audit sensitive detail RBAC", () => {
  it("requires audit.export for sensitive detail via canonical grants", () => {
    expect(canViewSensitiveAuditDetailFromGrants(new Set(["reports.read.audit"]), false)).toBe(false);
    expect(canViewSensitiveAuditDetailFromGrants(new Set(["audit.export"]), false)).toBe(true);
    expect(canViewSensitiveAuditDetailFromGrants(new Set(), true)).toBe(true);
  });

  it("redacts before/after/diff when viewSensitive is false", () => {
    const out = stripSensitiveDetailForViewer(sampleRow, false);
    expect(out?.metadataJson).toEqual(sampleRow.metadataJson);
    expect(out?.beforeJson).toBeUndefined();
    expect(out?.afterJson).toBeUndefined();
    expect(out?.diffJson).toBeUndefined();
  });

  it("preserves before/after/diff when viewSensitive is true", () => {
    const out = stripSensitiveDetailForViewer(sampleRow, true);
    expect(out).toEqual(sampleRow);
  });
});
