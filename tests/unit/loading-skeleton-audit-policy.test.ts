import { describe, expect, it } from "vitest";

import {
  auditLoadingSkeleton,
  auditLoadingSkeletonModule,
  LOADING_SKELETON_AUDIT_POLICY_ID,
} from "@/lib/design/loading-skeleton-audit-policy";
import {
  LOADING_SKELETON_CRITICAL_MODULES,
  LOADING_SKELETON_PATTERNS_POLICY_ID,
} from "@/lib/design/loading-skeleton-patterns";

describe("loading skeleton audit policy (DES-28)", () => {
  it("locks DES-28 policy id and critical loading modules", () => {
    expect(LOADING_SKELETON_PATTERNS_POLICY_ID).toBe("loading-skeleton-patterns-des28-v1");
    expect(LOADING_SKELETON_AUDIT_POLICY_ID).toBe(LOADING_SKELETON_PATTERNS_POLICY_ID);
    expect(LOADING_SKELETON_CRITICAL_MODULES).toContain("app/dashboard/today/loading.tsx");
    expect(LOADING_SKELETON_CRITICAL_MODULES).toContain("app/dashboard/pos/terminal/loading.tsx");
    expect(LOADING_SKELETON_CRITICAL_MODULES).toContain(
      "app/dashboard/marketplace/checkout/loading.tsx",
    );
  });

  it("passes Today loading with DashboardPageSkeleton", () => {
    const audit = auditLoadingSkeletonModule("app/dashboard/today/loading.tsx");
    expect(audit.usesSkeletonPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes POS terminal loading with POSCheckoutSkeleton", () => {
    const audit = auditLoadingSkeletonModule("app/dashboard/pos/terminal/loading.tsx");
    expect(audit.isException).toBe(false);
    expect(audit.usesSkeletonPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical loading module audit against repo", () => {
    const report = auditLoadingSkeleton();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
