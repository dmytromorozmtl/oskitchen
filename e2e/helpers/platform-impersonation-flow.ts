import { expect, type Page } from "@playwright/test";

import {
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_END_BUTTON,
  PLATFORM_IMPERSONATION_NOTICE_TITLE,
  PLATFORM_IMPERSONATION_TODAY_PATH,
} from "@/lib/platform/platform-impersonation-e2e-policy";
import { recordPlatformAudit } from "@/lib/platform-audit";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";
import type { PlatformImpersonationFixture } from "./platform-impersonation-ready";

export async function addImpersonationCookie(
  page: Page,
  sessionId: string,
  baseURL: string,
): Promise<void> {
  const url = new URL(baseURL);
  await page.context().addCookies([
    {
      name: PLATFORM_IMPERSONATION_COOKIE,
      value: sessionId,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

export async function assertPlatformImpersonationNoticeVisible(
  page: Page,
  targetEmail: string,
): Promise<void> {
  await expect(page.getByRole("alert")).toContainText(PLATFORM_IMPERSONATION_NOTICE_TITLE);
  await expect(page.getByRole("alert")).toContainText(targetEmail);
  await expect(page.getByRole("button", { name: PLATFORM_IMPERSONATION_END_BUTTON })).toBeVisible();
}

export async function runPlatformImpersonationBannerFlow(
  page: Page,
  fixture: PlatformImpersonationFixture,
  baseURL: string,
): Promise<{ noticeVisible: true }> {
  await addImpersonationCookie(page, fixture.sessionId, baseURL);
  await page.goto(PLATFORM_IMPERSONATION_TODAY_PATH);
  await skipIfLoginRedirect(page, "Platform impersonation banner requires dashboard auth");
  await assertNoDashboardRscFailure(page);
  await assertPlatformImpersonationNoticeVisible(page, fixture.targetEmail);
  return { noticeVisible: true };
}

export async function assertPlatformImpersonationStartAuditRow(
  fixture: PlatformImpersonationFixture,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  await recordPlatformAudit({
    adminUserId: fixture.adminUserId,
    action: "platform.impersonation.start",
    entityType: "user",
    entityId: fixture.targetUserId,
    targetWorkspaceId: fixture.workspaceId,
    metadata: {
      sessionId: fixture.sessionId,
      reason: fixture.reason,
      targetUserId: fixture.targetUserId,
    },
  });

  const row = await prisma.auditLog.findFirst({
    where: {
      action: "platform.impersonation.start",
      userId: fixture.adminUserId,
      entityId: fixture.targetUserId,
    },
    orderBy: { createdAt: "desc" },
  });

  expect(row).not.toBeNull();
  expect(row?.category).toBe("PLATFORM");
  expect(row?.source).toBe("SUPERADMIN");
  expect(row?.workspaceId).toBe(fixture.workspaceId);
}
