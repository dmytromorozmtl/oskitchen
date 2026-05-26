"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { SUPPORT_SESSION_COOKIE } from "@/lib/platform/support-session-types";
import {
  endPlatformSupportSession,
  startPlatformSupportSession,
} from "@/services/platform/platform-support-session-service";
import type { PlatformSupportSessionMode } from "@prisma/client";

export async function startPlatformSupportSessionAction(formData: FormData): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support-session:start");

  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "");
  const ttlHours = Number(formData.get("ttlHours") ?? 2);
  const mode = String(formData.get("mode") ?? "READ_ONLY") as PlatformSupportSessionMode;

  if (!workspaceId) return;

  const res = await startPlatformSupportSession({
    actorUserId: ctx.userId,
    actorEmail: ctx.email,
    workspaceId,
    reason,
    mode,
    ttlHours,
  });
  if (!res.ok) return;

  const jar = await cookies();
  const hours = Math.min(8, Math.max(1, Math.floor(Number.isFinite(ttlHours) ? ttlHours : 2)));
  jar.set(SUPPORT_SESSION_COOKIE, res.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: hours * 3600,
  });

  revalidatePath("/platform");
  redirect(`/platform/workspaces/${workspaceId}`);
}

export async function endPlatformSupportSessionAction(): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:support-session:end");

  const jar = await cookies();
  const id = jar.get(SUPPORT_SESSION_COOKIE)?.value;
  if (id) {
    await endPlatformSupportSession({ actorUserId: ctx.userId, actorEmail: ctx.email, sessionId: id });
  }
  jar.delete(SUPPORT_SESSION_COOKIE);
  revalidatePath("/platform");
  redirect("/platform/dashboard");
}
