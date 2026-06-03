import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { isUuid } from "@/lib/platform/is-uuid";
import {
  PLATFORM_IMPERSONATION_COOKIE,
  PLATFORM_IMPERSONATION_MAX_SECONDS,
} from "@/lib/platform/platform-impersonation";

export type ActiveImpersonation = {
  sessionId: string;
  adminUserId: string;
  targetUserId: string;
  targetEmail: string | null;
  reason: string | null;
  startedAt: Date;
  expiresAt: Date;
  secondsRemaining: number;
};

function expiresAt(startedAt: Date): Date {
  return new Date(startedAt.getTime() + PLATFORM_IMPERSONATION_MAX_SECONDS * 1000);
}

/** Load active impersonation session; auto-end when TTL exceeded. Never throws (safe for dashboard layout RSC). */
export async function getActiveImpersonationSession(): Promise<ActiveImpersonation | null> {
  try {
    const jar = await cookies();
    const id = jar.get(PLATFORM_IMPERSONATION_COOKIE)?.value?.trim();
    if (!id || !isUuid(id)) return null;

    const session = await prisma.impersonationSession.findFirst({
      where: { id, endedAt: null },
      include: { target: { select: { email: true } } },
    });
    if (!session) return null;

    const exp = expiresAt(session.startedAt);
    const now = Date.now();
    if (now > exp.getTime()) {
      // End in DB only — never touch cookies here (RSC layout cannot mutate cookies).
      await prisma.impersonationSession
        .update({
          where: { id: session.id },
          data: { endedAt: new Date() },
        })
        .catch(() => undefined);
      return null;
    }

    return {
      sessionId: session.id,
      adminUserId: session.adminUserId,
      targetUserId: session.targetUserId,
      targetEmail: session.target.email,
      reason: session.reason,
      startedAt: session.startedAt,
      expiresAt: exp,
      secondsRemaining: Math.max(0, Math.floor((exp.getTime() - now) / 1000)),
    };
  } catch (error) {
    console.error("[impersonation] getActiveImpersonationSession failed", error);
    return null;
  }
}

export function formatImpersonationTtl(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
