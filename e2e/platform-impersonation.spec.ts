import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import {
  PLATFORM_IMPERSONATION_AUDIT_ACTIONS,
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_E2E_POLICY_ID,
  PLATFORM_IMPERSONATION_MFA_ERROR,
  PLATFORM_IMPERSONATION_PROTECTED_TARGET_ERROR,
  PLATFORM_IMPERSONATION_TODAY_PATH,
  PLATFORM_USERS_PATH,
  isPlatformImpersonationAuditAction,
  isPlatformImpersonationStartAuditMetadata,
  platformImpersonationTtlHours,
  sanitizePlatformImpersonationRedirect,
} from "@/lib/platform/platform-impersonation-e2e-policy";
import { prisma } from "@/lib/prisma";

import {
  assertPlatformImpersonationStartAuditRow,
  runPlatformImpersonationBannerFlow,
} from "./helpers/platform-impersonation-flow";
import {
  seedImpersonationSessionForAuthedTarget,
  seedPlatformImpersonationSession,
  skipPlatformImpersonationIfNoDb,
  skipPlatformImpersonationIfNotAuthed,
} from "./helpers/platform-impersonation-ready";

/**
 * Platform impersonation E2E — MFA-gated start, TTL cookie, audit trail, tenant banner.
 *
 * @see docs/PLATFORM_IMPERSONATION.md
 * @see e2e/cross-tenant-isolation.spec.ts — impersonation audit DB probe
 */

test.describe("platform impersonation policy", () => {
  test("exports impersonation cookie, audit actions, and redirect contract", () => {
    expect(PLATFORM_IMPERSONATION_E2E_POLICY_ID).toBe("platform-impersonation-e2e-v1");
    expect(PLATFORM_IMPERSONATION_COOKIE).toBe("kos_imp_session");
    expect(PLATFORM_IMPERSONATION_AUDIT_ACTIONS.start).toBe("platform.impersonation.start");
    expect(PLATFORM_IMPERSONATION_AUDIT_ACTIONS.end).toBe("platform.impersonation.end");
    expect(isPlatformImpersonationAuditAction("platform.impersonation.start")).toBe(true);
    expect(isPlatformImpersonationAuditAction("platform.impersonation.end")).toBe(true);
    expect(isPlatformImpersonationAuditAction("platform.support.start")).toBe(false);
    expect(platformImpersonationTtlHours()).toBe(1);
    expect(PLATFORM_IMPERSONATION_TODAY_PATH).toBe("/dashboard/today");
    expect(PLATFORM_USERS_PATH).toBe("/platform/users");
    expect(PLATFORM_IMPERSONATION_MFA_ERROR).toContain("MFA");
    expect(PLATFORM_IMPERSONATION_PROTECTED_TARGET_ERROR).toContain("super-admin");
  });

  test("sanitizePlatformImpersonationRedirect allows tenant dashboard paths only", () => {
    expect(sanitizePlatformImpersonationRedirect("/dashboard/today")).toBe("/dashboard/today");
    expect(sanitizePlatformImpersonationRedirect("//evil.com")).toBe("/platform/dashboard");
    expect(sanitizePlatformImpersonationRedirect("/platform/users")).toBe("/platform/dashboard");
  });

  test("start audit metadata shape matches platform audit contract", () => {
    const metadata = {
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      reason: "support",
      targetUserId: "user-1",
    };
    expect(isPlatformImpersonationStartAuditMetadata(metadata)).toBe(true);
    expect(isPlatformImpersonationStartAuditMetadata({ sessionId: "x" })).toBe(false);
  });
});

test.describe("platform impersonation session lifecycle (database)", () => {
  test.beforeEach(() => {
    skipPlatformImpersonationIfNoDb();
  });

  test("active session persists until ended by owning admin", async () => {
    const suffix = randomUUID().slice(0, 8);
    const target = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `platform-imp-target-${suffix}@e2e.test`,
        fullName: "Impersonation Target",
        role: "OWNER",
      },
    });

    const fixture = await seedPlatformImpersonationSession("lifecycle", target.id, target.email);
    const otherAdmin = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `platform-imp-other-${suffix}@e2e.test`,
        fullName: "Other Admin",
        role: "OWNER",
      },
    });

    try {
      const active = await prisma.impersonationSession.findFirst({
        where: { id: fixture.sessionId, endedAt: null },
      });
      expect(active).not.toBeNull();
      expect(active?.adminUserId).toBe(fixture.adminUserId);
      expect(active?.targetUserId).toBe(target.id);

      const wrongEnd = await prisma.impersonationSession.updateMany({
        where: { id: fixture.sessionId, adminUserId: otherAdmin.id, endedAt: null },
        data: { endedAt: new Date() },
      });
      expect(wrongEnd.count).toBe(0);

      const correctEnd = await prisma.impersonationSession.updateMany({
        where: { id: fixture.sessionId, adminUserId: fixture.adminUserId, endedAt: null },
        data: { endedAt: new Date() },
      });
      expect(correctEnd.count).toBe(1);

      const ended = await prisma.impersonationSession.findFirst({
        where: { id: fixture.sessionId, endedAt: null },
      });
      expect(ended).toBeNull();
    } finally {
      await fixture.cleanup();
      await prisma.userProfile.deleteMany({ where: { id: { in: [target.id, otherAdmin.id] } } });
    }
  });

  test("platform.impersonation.start writes PLATFORM category audit row", async () => {
    const suffix = randomUUID().slice(0, 8);
    const target = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `platform-imp-audit-${suffix}@e2e.test`,
        fullName: "Impersonation Audit Target",
        role: "OWNER",
      },
    });

    const fixture = await seedPlatformImpersonationSession("audit", target.id, target.email);

    try {
      await assertPlatformImpersonationStartAuditRow(fixture);
    } finally {
      await fixture.cleanup();
      await prisma.userProfile.delete({ where: { id: target.id } }).catch(() => undefined);
    }
  });
});

test.describe("platform impersonation banner (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Platform impersonation banner runs in chromium-authed project only",
    );
    skipPlatformImpersonationIfNoDb();
    skipPlatformImpersonationIfNotAuthed();
  });

  test("authed target sees platform support banner when impersonation cookie is active", async ({
    page,
    baseURL,
  }) => {
    const fixture = await seedImpersonationSessionForAuthedTarget("http-banner");
    if (!fixture) {
      test.skip(true, "E2E login user not found in database — seed user or fix E2E_LOGIN_EMAIL.");
    }

    try {
      const result = await runPlatformImpersonationBannerFlow(page, fixture!, baseURL);
      expect(result.noticeVisible).toBe(true);
    } finally {
      await fixture!.cleanup();
    }
  });
});
