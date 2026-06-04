import { describe, expect, it } from "vitest";

import {
  auditPermissionDenied,
  auditPermissionDeniedModule,
  PERMISSION_DENIED_AUDIT_POLICY_ID,
} from "@/lib/design/permission-denied-audit-policy";
import {
  PERMISSION_DENIED_CARD_TEST_ID,
  PERMISSION_DENIED_CRITICAL_MODULES,
  PERMISSION_DENIED_PATTERNS_POLICY_ID,
} from "@/lib/design/permission-denied-patterns";

describe("permission denied audit policy (DES-37)", () => {
  it("locks DES-37 policy id and critical module list", () => {
    expect(PERMISSION_DENIED_PATTERNS_POLICY_ID).toBe("permission-denied-patterns-des37-v1");
    expect(PERMISSION_DENIED_AUDIT_POLICY_ID).toBe(PERMISSION_DENIED_PATTERNS_POLICY_ID);
    expect(PERMISSION_DENIED_CARD_TEST_ID).toBe("permission-denied-card");
    expect(PERMISSION_DENIED_CRITICAL_MODULES).toContain("app/dashboard/pos/terminal/page.tsx");
    expect(PERMISSION_DENIED_CRITICAL_MODULES).toContain("app/dashboard/settings/pos/page.tsx");
  });

  it("passes POS terminal with PermissionDeniedSurfaceCard", () => {
    const audit = auditPermissionDeniedModule("app/dashboard/pos/terminal/page.tsx");
    expect(audit.usesPermissionDeniedPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes settings POS with PermissionDeniedSurfaceCard", () => {
    const audit = auditPermissionDeniedModule("app/dashboard/settings/pos/page.tsx");
    expect(audit.usesPermissionDeniedPrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditPermissionDenied();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
