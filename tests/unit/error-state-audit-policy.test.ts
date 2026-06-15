import { describe, expect, it } from "vitest";

import {
  auditErrorState,
  auditErrorStateModule,
  ERROR_STATE_AUDIT_POLICY_ID,
} from "@/lib/design/error-state-audit-policy";
import {
  API_ERROR_STATE_TEST_ID,
  ERROR_STATE_CRITICAL_MODULES,
  ERROR_STATE_PATTERNS_POLICY_ID,
  ERROR_STATE_TEST_ID,
} from "@/lib/design/error-state-patterns";

describe("error state audit policy (DES-33)", () => {
  it("locks DES-33 policy id and critical module list", () => {
    expect(ERROR_STATE_PATTERNS_POLICY_ID).toBe("error-state-patterns-des33-v1");
    expect(ERROR_STATE_AUDIT_POLICY_ID).toBe(ERROR_STATE_PATTERNS_POLICY_ID);
    expect(ERROR_STATE_TEST_ID).toBe("error-state");
    expect(API_ERROR_STATE_TEST_ID).toBe("api-error-state");
    expect(ERROR_STATE_CRITICAL_MODULES).toContain("components/dashboard/today-page-load-error.tsx");
    expect(ERROR_STATE_CRITICAL_MODULES).toContain("app/dashboard/integrations/email-orders/error.tsx");
  });

  it("passes Today load error with ErrorState", () => {
    const audit = auditErrorStateModule("components/dashboard/today-page-load-error.tsx");
    expect(audit.usesErrorStatePrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes email orders route error with RouteError", () => {
    const audit = auditErrorStateModule("app/dashboard/integrations/email-orders/error.tsx");
    expect(audit.usesErrorStatePrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditErrorState();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
