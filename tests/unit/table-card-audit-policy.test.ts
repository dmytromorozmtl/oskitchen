import { describe, expect, it } from "vitest";

import {
  auditTableCard,
  auditTableCardModule,
  TABLE_CARD_AUDIT_POLICY_ID,
} from "@/lib/design/table-card-audit-policy";
import {
  TABLE_CARD_CRITICAL_MODULES,
  TABLE_CARD_PATTERNS_POLICY_ID,
  TABLE_CARD_SHELL_TEST_ID,
} from "@/lib/design/table-card-patterns";

describe("table card audit policy (DES-31)", () => {
  it("locks DES-31 policy id and critical module list", () => {
    expect(TABLE_CARD_PATTERNS_POLICY_ID).toBe("table-card-patterns-des31-v1");
    expect(TABLE_CARD_AUDIT_POLICY_ID).toBe(TABLE_CARD_PATTERNS_POLICY_ID);
    expect(TABLE_CARD_SHELL_TEST_ID).toBe("data-table-shell");
    expect(TABLE_CARD_CRITICAL_MODULES).toContain("components/dashboard/orders-table.tsx");
    expect(TABLE_CARD_CRITICAL_MODULES).toContain("app/dashboard/integrations/webhooks/page.tsx");
  });

  it("passes orders table with DataTableShell", () => {
    const audit = auditTableCardModule("components/dashboard/orders-table.tsx");
    expect(audit.usesTableCardPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes webhook events page with DataTableShell", () => {
    const audit = auditTableCardModule("app/dashboard/integrations/webhooks/page.tsx");
    expect(audit.usesTableCardPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditTableCard();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
