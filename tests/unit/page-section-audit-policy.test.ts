import { describe, expect, it } from "vitest";

import {
  auditPageSection,
  auditPageSectionModule,
  PAGE_SECTION_AUDIT_POLICY_ID,
} from "@/lib/design/page-section-audit-policy";
import {
  PAGE_SECTION_CRITICAL_MODULES,
  PAGE_SECTION_EXCEPTION_MODULES,
  PAGE_SECTION_PATTERNS_POLICY_ID,
} from "@/lib/design/page-section-patterns";

describe("page section audit policy (DES-29)", () => {
  it("locks DES-29 policy id and critical module list", () => {
    expect(PAGE_SECTION_PATTERNS_POLICY_ID).toBe("page-section-patterns-des29-v1");
    expect(PAGE_SECTION_AUDIT_POLICY_ID).toBe(PAGE_SECTION_PATTERNS_POLICY_ID);
    expect(PAGE_SECTION_CRITICAL_MODULES).toContain("app/dashboard/marketplace/page.tsx");
    expect(PAGE_SECTION_EXCEPTION_MODULES).toContain("app/dashboard/today/page.tsx");
  });

  it("passes marketplace hub with PageSection scaffold", () => {
    const audit = auditPageSectionModule("app/dashboard/marketplace/page.tsx");
    expect(audit.usesPageSection).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes Today profit with PageSection blocks", () => {
    const audit = auditPageSectionModule("app/dashboard/today/profit/page.tsx");
    expect(audit.usesPageSection).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditPageSection();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
