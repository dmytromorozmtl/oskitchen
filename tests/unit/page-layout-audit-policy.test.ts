import { describe, expect, it } from "vitest";

import {
  PAGE_LAYOUT_CRITICAL_MODULES,
  PAGE_LAYOUT_EXCEPTION_MODULES,
  PAGE_LAYOUT_PATTERNS_POLICY_ID,
} from "@/lib/design/page-layout-patterns";
import { auditPageLayout, auditPageLayoutModule, PAGE_LAYOUT_AUDIT_POLICY_ID } from "@/lib/design/page-layout-audit-policy";

describe("page layout audit policy (DES-27)", () => {
  it("locks DES-27 policy id and critical module list", () => {
    expect(PAGE_LAYOUT_PATTERNS_POLICY_ID).toBe("page-layout-patterns-des27-v1");
    expect(PAGE_LAYOUT_AUDIT_POLICY_ID).toBe(PAGE_LAYOUT_PATTERNS_POLICY_ID);
    expect(PAGE_LAYOUT_CRITICAL_MODULES).toContain("app/dashboard/integrations/health/page.tsx");
    expect(PAGE_LAYOUT_EXCEPTION_MODULES).toContain("app/dashboard/today/page.tsx");
  });

  it("passes integration health with PageHeader and PageShell", () => {
    const audit = auditPageLayoutModule("app/dashboard/integrations/health/page.tsx");
    expect(audit.usesPageHeader).toBe(true);
    expect(audit.usesPageShell).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("allows documented layout exceptions for Today and POS terminal", () => {
    for (const modulePath of PAGE_LAYOUT_EXCEPTION_MODULES) {
      const audit = auditPageLayoutModule(modulePath);
      expect(audit.isException).toBe(true);
      expect(audit.passed).toBe(true);
    }
  });

  it("passes full critical module audit against repo", () => {
    const report = auditPageLayout();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
