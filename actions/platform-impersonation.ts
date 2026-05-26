"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordPlatformAudit } from "@/lib/platform-audit";
import { isTargetSuperAdminProtected, requireSuperAdmin } from "@/lib/platform-admin";
import {
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_MAX_SECONDS,
} from "@/lib/platform/platform-impersonation";
import { verifyImpersonationMfa } from "@/lib/platform/impersonation-mfa";

export async function startPlatformImpersonation(
  targetUserId: string,
  reason: string,
  stepUpToken?: string,
  totpCode?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireSuperAdmin();
  const trimmedReason = reason.trim().slice(0, 500) || "support";
  if (!verifyImpersonationMfa({ stepUpToken, totpCode })) {
    return { ok: false, error: "Impersonation requires a valid MFA code or step-up token." };
  }
  if (await isTargetSuperAdminProtected(targetUserId)) {
    return { ok: false, error: "Cannot impersonate another platform super-admin." };
  }
  const [owned, membership] = await Promise.all([
    prisma.workspace.findFirst({ where: { ownerUserId: targetUserId }, select: { id: true } }),
    prisma.workspaceMember.findFirst({
      where: { userId: targetUserId },
      select: { workspaceId: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const targetWorkspaceId = owned?.id ?? membership?.workspaceId ?? null;
  const session = await prisma.impersonationSession.create({
    data: {
      adminUserId: admin.id,
      targetUserId,
      reason: trimmedReason,
    },
  });
  const jar = await cookies();
  jar.set(PLATFORM_IMPERSONATION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: PLATFORM_IMPERSONATION_MAX_SECONDS,
  });
  await recordPlatformAudit({
    adminUserId: admin.id,
    action: "platform.impersonation.start",
    entityType: "user",
    entityId: targetUserId,
    targetWorkspaceId: targetWorkspaceId,
    metadata: { sessionId: session.id, reason: trimmedReason, targetUserId },
  });
  revalidatePath("/platform");
  return { ok: true };
}

export async function endPlatformImpersonation(): Promise<void> {
  const user = await requireSessionUser();
  const jar = await cookies();
  const id = jar.get(PLATFORM_IMPERSONATION_COOKIE)?.value;
  const session = id
    ? await prisma.impersonationSession.findFirst({
        where: { id, adminUserId: user.id, endedAt: null },
        select: { id: true, targetUserId: true },
      })
    : null;
  if (id) {
    await prisma.impersonationSession.updateMany({
      where: { id, adminUserId: user.id, endedAt: null },
      data: { endedAt: new Date() },
    });
  }
  jar.delete(PLATFORM_IMPERSONATION_COOKIE);
  await recordPlatformAudit({
    adminUserId: user.id,
    action: "platform.impersonation.end",
    entityType: "impersonation_session",
    entityId: id ?? undefined,
    metadata: session
      ? {
          targetUserId: session.targetUserId,
          sessionId: session.id,
        }
      : undefined,
  });
  revalidatePath("/platform");
}

export async function startImpersonationFormAction(formData: FormData): Promise<void> {
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "support");
  const stepUpToken = String(formData.get("stepUpToken") ?? "").trim() || undefined;
  const totpCode = String(formData.get("totpCode") ?? "").trim() || undefined;
  if (!targetUserId) return;
  const r = await startPlatformImpersonation(targetUserId, reason, stepUpToken, totpCode);
  if (!r.ok) return;
  redirect("/platform/dashboard");
}
