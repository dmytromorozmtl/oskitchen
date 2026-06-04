import { describe, expect, it } from "vitest";

import {
  auditEmptyState,
  auditEmptyStateModule,
  EMPTY_STATE_AUDIT_POLICY_ID,
} from "@/lib/design/empty-state-audit-policy";
import {
  EMPTY_STATE_CRITICAL_MODULES,
  EMPTY_STATE_PATTERNS_POLICY_ID,
  EMPTY_STATE_TEST_ID,
} from "@/lib/design/empty-state-patterns";

describe("empty state audit policy (DES-34)", () => {
  it("locks DES-34 policy id and critical module list", () => {
    expect(EMPTY_STATE_PATTERNS_POLICY_ID).toBe("empty-state-patterns-des34-v1");
    expect(EMPTY_STATE_AUDIT_POLICY_ID).toBe(EMPTY_STATE_PATTERNS_POLICY_ID);
    expect(EMPTY_STATE_TEST_ID).toBe("empty-state");
    expect(EMPTY_STATE_CRITICAL_MODULES).toContain("components/ui/empty-state.tsx");
    expect(EMPTY_STATE_CRITICAL_MODULES).toContain("app/dashboard/settings/voice/page.tsx");
  });

  it("passes Today command center with EmptyState", () => {
    const audit = auditEmptyStateModule("components/dashboard/today-command-center.tsx");
    expect(audit.usesEmptyStatePrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes voice settings with EmptyState inline", () => {
    const audit = auditEmptyStateModule("app/dashboard/settings/voice/page.tsx");
    expect(audit.usesEmptyStatePrimitive).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("passes full critical module audit against repo", () => {
    const report = auditEmptyState();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.passed)).toBe(true);
  });
});
