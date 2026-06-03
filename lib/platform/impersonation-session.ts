import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
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

/** Load active impersonation session; auto-end when TTL exceeded. */
export async function getActiveImpersonationSession(): Promise<ActiveImpersonation | null> {
  const jar = await cookies();
  const id = jar.get(PLATFORM_IMPERSONATION_COOKIE)?.value;
  if (!id) return null;

  const session = await prisma.impersonationSession.findFirst({
    where: { id, endedAt: null },
    include: { target: { select: { email: true } } },
  });
  if (!session) return null;

  const exp = expiresAt(session.startedAt);
  const now = Date.now();
  if (now > exp.getTime()) {
    await prisma.impersonationSession.update({
      where: { id: session.id },
      data: { endedAt: new Date() },
    });
    // Do not mutate cookies here — dashboard layout renders this during RSC and Next.js
    // only allows cookie writes in Server Actions / Route Handlers (would 500 every tab).
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
}

export function formatImpersonationTtl(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
