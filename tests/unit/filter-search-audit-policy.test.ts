import { describe, expect, it } from "vitest";

import {
  auditFilterSearch,
  auditFilterSearchModule,
  FILTER_SEARCH_AUDIT_POLICY_ID,
} from "@/lib/design/filter-search-audit-policy";
import {
  FILTER_SEARCH_BAR_TEST_ID,
  FILTER_SEARCH_CRITICAL_MODULES,
  FILTER_SEARCH_PATTERNS_POLICY_ID,
} from "@/lib/design/filter-search-patterns";

describe("filter search audit policy (DES-30)", () => {
  it("locks DES-30 policy id and critical module list", () => {
    expect(FILTER_SEARCH_PATTERNS_POLICY_ID).toBe("filter-search-patterns-des30-v1");
    expect(FILTER_SEARCH_AUDIT_POLICY_ID).toBe(FILTER_SEARCH_PATTERNS_POLICY_ID);
    expect(FILTER_SEARCH_BAR_TEST_ID).toBe("filter-search-bar");
    expect(FILTER_SEARCH_CRITICAL_MODULES).toContain("components/dashboard/analytics-filter-bar.tsx");
    expect(FILTER_SEARCH_CRITICAL_MODULES).toContain("components/marketplace/catalog-filter-bar.tsx");
  });

  it("passes analytics filter bar with FilterSearchShell", () => {
    const audit = auditFilterSearchModule("components/dashboard/analytics-filter-bar.tsx");
    expect(audit.usesFilterSearchPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes marketplace catalog filter bar with FilterSearchShell", () => {
    const audit = auditFilterSearchModule("components/marketplace/catalog-filter-bar.tsx");
    expect(audit.usesFilterSearchPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditFilterSearch();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
