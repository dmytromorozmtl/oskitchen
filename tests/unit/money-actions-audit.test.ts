import { describe, expect, it } from "vitest";

import {
  MONEY_ACTION_AUDIT_REGISTRY,
  MONEY_ACTIONS_AUDIT_POLICY_ID,
  auditAllMoneyActions,
  auditMoneyActionEntry,
} from "@/lib/audit/money-actions-audit-policy";

describe("money actions audit (P1-31)", () => {
  it("locks policy id", () => {
    expect(MONEY_ACTIONS_AUDIT_POLICY_ID).toBe("money-actions-audit-p1-31-v1");
  });

  it("covers payment, refund, void, payout, marketplace PO", () => {
    const kinds = new Set(MONEY_ACTION_AUDIT_REGISTRY.map((entry) => entry.kind));
    expect(kinds.has("payment")).toBe(true);
    expect(kinds.has("refund")).toBe(true);
    expect(kinds.has("void")).toBe(true);
    expect(kinds.has("payout")).toBe(true);
    expect(kinds.has("marketplace_po")).toBe(true);
  });

  it.each(MONEY_ACTION_AUDIT_REGISTRY.map((entry) => [entry.kind, entry.servicePath, entry] as const))(
    "%s wired in %s",
    (_kind, _path, entry) => {
      const report = auditMoneyActionEntry(entry);
      expect(report.servicePresent, entry.servicePath).toBe(true);
      expect(report.auditWired, entry.servicePath).toBe(true);
    },
  );

  it("passes full registry audit", () => {
    const summary = auditAllMoneyActions();
    expect(summary.passed).toBe(true);
    expect(summary.reports.every((report) => report.passed)).toBe(true);
  });
});
