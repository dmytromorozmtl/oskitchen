import { describe, expect, it } from "vitest";

import {
  PLATFORM_IMPERSONATION_AUDIT_ACTIONS,
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_E2E_POLICY_ID,
  PLATFORM_IMPERSONATION_END_BUTTON,
  PLATFORM_IMPERSONATION_MFA_ERROR,
  PLATFORM_IMPERSONATION_NOTICE_TITLE,
  PLATFORM_IMPERSONATION_TODAY_PATH,
  isPlatformImpersonationAuditAction,
  isPlatformImpersonationStartAuditMetadata,
  platformImpersonationTtlHours,
  sanitizePlatformImpersonationRedirect,
} from "@/lib/platform/platform-impersonation-e2e-policy";

describe("platform impersonation E2E policy (QA-25)", () => {
  it("exports policy id, cookie, routes, and UI copy", () => {
    expect(PLATFORM_IMPERSONATION_E2E_POLICY_ID).toBe("platform-impersonation-e2e-v1");
    expect(PLATFORM_IMPERSONATION_COOKIE).toBe("kos_imp_session");
    expect(PLATFORM_IMPERSONATION_TODAY_PATH).toBe("/dashboard/today");
    expect(PLATFORM_IMPERSONATION_NOTICE_TITLE).toBe("Platform support view");
    expect(PLATFORM_IMPERSONATION_END_BUTTON).toBe("End impersonation");
    expect(platformImpersonationTtlHours()).toBe(1);
  });

  it("recognizes platform impersonation audit actions", () => {
    expect(isPlatformImpersonationAuditAction(PLATFORM_IMPERSONATION_AUDIT_ACTIONS.start)).toBe(
      true,
    );
    expect(isPlatformImpersonationAuditAction(PLATFORM_IMPERSONATION_AUDIT_ACTIONS.end)).toBe(true);
    expect(isPlatformImpersonationAuditAction("orders.create")).toBe(false);
  });

  it("validates start audit metadata and MFA error copy", () => {
    expect(
      isPlatformImpersonationStartAuditMetadata({
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        reason: "support",
        targetUserId: "user-1",
      }),
    ).toBe(true);
    expect(PLATFORM_IMPERSONATION_MFA_ERROR).toMatch(/MFA/i);
  });

  it("blocks open redirects after impersonation start", () => {
    expect(sanitizePlatformImpersonationRedirect("/dashboard/go-live/projects/x")).toBe(
      "/dashboard/go-live/projects/x",
    );
    expect(sanitizePlatformImpersonationRedirect("https://evil.test/phish")).toBe(
      "/platform/dashboard",
    );
  });
});
