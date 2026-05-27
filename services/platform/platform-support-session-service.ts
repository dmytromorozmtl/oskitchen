import { addHours } from "date-fns";
import { Prisma, type PlatformSupportSessionMode } from "@prisma/client";

import {
  PLATFORM_SUPPORT_SESSION_ENDED,
  PLATFORM_SUPPORT_SESSION_EXPIRED,
  PLATFORM_SUPPORT_SESSION_STARTED,
} from "@/lib/audit/support-session-audit-actions";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";

const SUPPORT_SESSION_TABLE = "platform_support_sessions";

/** Local DBs that have not run `prisma migrate deploy` yet — avoid crashing dashboard reads. */
function isMissingSupportSessionTable(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    typeof error.message === "string" &&
    error.message.includes(SUPPORT_SESSION_TABLE)
  );
}

async function withSupportSessionTable<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (e) {
    if (isMissingSupportSessionTable(e)) return fallback;
    throw e;
  }
}

export async function isWorkspaceOwnerSuperAdminProtected(workspaceId: string): Promise<boolean> {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: {
      owner: { select: { email: true, id: true } },
    },
  });
  if (!ws?.owner) return false;
  return hasSuperAdminRoleRow(ws.owner.id);
}

export async function expireStaleSupportSessions(): Promise<number> {
  return withSupportSessionTable(async () => {
    const now = new Date();
    const stale = await prisma.platformSupportSession.findMany({
      where: { status: "ACTIVE", expiresAt: { lt: now } },
      select: { id: true },
    });
    if (!stale.length) return 0;
    await prisma.platformSupportSession.updateMany({
      where: { id: { in: stale.map((s) => s.id) } },
      data: { status: "EXPIRED", endedAt: now },
    });
    void auditLog({
      actor: {},
      action: PLATFORM_SUPPORT_SESSION_EXPIRED,
      category: "PLATFORM",
      source: "SYSTEM",
      entity: { type: "PlatformSupportSession", id: "batch", label: "Support sessions expired" },
      metadata: { count: stale.length, sessionIds: stale.map((s) => s.id).slice(0, 20) },
    });
    return stale.length;
  }, 0);
}

export async function getActiveSupportSessionForActor(actorUserId: string, sessionId: string) {
  await expireStaleSupportSessions();
  return withSupportSessionTable(
    () =>
      prisma.platformSupportSession.findFirst({
        where: { id: sessionId, actorUserId, status: "ACTIVE", expiresAt: { gte: new Date() } },
        include: { workspace: { select: { id: true, name: true } } },
      }),
    null,
  );
}

export async function getActiveSupportSessionsForTarget(targetUserId: string) {
  await expireStaleSupportSessions();
  return withSupportSessionTable(
    () =>
      prisma.platformSupportSession.findMany({
        where: { targetUserId, status: "ACTIVE", expiresAt: { gte: new Date() } },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          mode: true,
          expiresAt: true,
          startedAt: true,
          workspace: { select: { name: true } },
        },
      }),
    [],
  );
}

/** Any workspace member (or owner) should see that platform support is active for their workspace. */
export async function getActiveSupportSessionsVisibleToUser(userId: string) {
  await expireStaleSupportSessions();
  const [owned, memberships] = await Promise.all([
    prisma.workspace.findFirst({ where: { ownerUserId: userId }, select: { id: true } }),
    prisma.workspaceMember.findMany({
      where: {
        userId,
      },
      select: { workspaceId: true },
    }),
  ]);
  const workspaceIds = [...memberships.map((m) => m.workspaceId), owned?.id].filter(Boolean) as string[];
  if (!workspaceIds.length) return [];
  return withSupportSessionTable(
    () =>
      prisma.platformSupportSession.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: { gte: new Date() },
          targetWorkspaceId: { in: workspaceIds },
        },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          mode: true,
          expiresAt: true,
          startedAt: true,
          workspace: { select: { name: true } },
        },
      }),
    [],
  );
}

export async function startPlatformSupportSession(input: {
  actorUserId: string;
  actorEmail: string | null;
  workspaceId: string;
  reason: string;
  mode: PlatformSupportSessionMode;
  ttlHours: number;
}): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  const reason = input.reason.trim();
  if (!reason) return { ok: false, error: "Reason is required." };
  if (reason.length > 500) return { ok: false, error: "Reason is too long." };

  const ttl = Math.min(8, Math.max(1, Math.floor(input.ttlHours || 1)));

  const ws = await prisma.workspace.findFirst({
    where: { id: input.workspaceId },
    select: {
      id: true,
      ownerUserId: true,
      owner: { select: { email: true, id: true } },
    },
  });
  if (!ws) return { ok: false, error: "Workspace not found." };

  if (await isWorkspaceOwnerSuperAdminProtected(ws.id)) {
    if (!(await hasSuperAdminRoleRow(input.actorUserId))) {
      return {
        ok: false,
        error:
          "Platform superadmin-protected workspace — only a user with the SUPER_ADMIN platform role can start a support session.",
      };
    }
  }

  if (input.mode === "ASSISTED_EDIT") {
    return { ok: false, error: "Assisted edit mode is not enabled in this release — use READ_ONLY." };
  }

  const expiresAt = addHours(new Date(), ttl);

  const session = await withSupportSessionTable(
    () =>
      prisma.platformSupportSession.create({
        data: {
          actorUserId: input.actorUserId,
          actorEmail: input.actorEmail?.slice(0, 255) ?? null,
          targetWorkspaceId: ws.id,
          targetUserId: ws.ownerUserId,
          mode: input.mode,
          reason: reason.slice(0, 500),
          status: "ACTIVE",
          expiresAt,
        },
      }),
    null,
  );

  if (!session) {
    return {
      ok: false,
      error:
        "Support session storage is not available — apply database migrations (`npx prisma migrate deploy`) so the platform_support_sessions table exists.",
    };
  }

  void auditLog({
    actor: { userId: input.actorUserId, email: input.actorEmail },
    action: PLATFORM_SUPPORT_SESSION_STARTED,
    category: "PLATFORM",
    source: "USER",
    entity: { type: "PlatformSupportSession", id: session.id, label: "Support session started" },
    metadata: {
      workspaceId: ws.id,
      targetUserId: ws.ownerUserId,
      mode: session.mode,
      expiresAt: session.expiresAt.toISOString(),
    },
  });

  return { ok: true, sessionId: session.id };
}

export async function endPlatformSupportSession(input: {
  actorUserId: string;
  actorEmail: string | null;
  sessionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  return withSupportSessionTable(async () => {
    const session = await prisma.platformSupportSession.findFirst({
      where: { id: input.sessionId, actorUserId: input.actorUserId, status: "ACTIVE" },
    });
    if (!session) return { ok: false, error: "Session not found or already ended." };

    const now = new Date();

    await prisma.platformSupportSession.update({
      where: { id: session.id },
      data: { status: "ENDED", endedAt: now },
    });

    void auditLog({
      actor: { userId: input.actorUserId, email: input.actorEmail },
      action: PLATFORM_SUPPORT_SESSION_ENDED,
      category: "PLATFORM",
      source: "USER",
      entity: { type: "PlatformSupportSession", id: session.id, label: "Support session ended" },
      metadata: { workspaceId: session.targetWorkspaceId },
    });

    return { ok: true } as const;
  }, { ok: false, error: "Support session storage is not available — run database migrations first." });
}
