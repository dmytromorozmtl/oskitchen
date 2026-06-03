import { randomUUID } from "node:crypto";

import { test } from "@playwright/test";

import { prisma } from "@/lib/prisma";

export const hasPlatformImpersonationDb = Boolean(process.env.DATABASE_URL?.trim());

export type PlatformImpersonationFixture = {
  adminUserId: string;
  adminEmail: string;
  targetUserId: string;
  targetEmail: string;
  workspaceId: string;
  sessionId: string;
  reason: string;
  cleanup: () => Promise<void>;
};

export function skipPlatformImpersonationIfNoDb(): void {
  if (!hasPlatformImpersonationDb) {
    test.skip(true, "Platform impersonation E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipPlatformImpersonationIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Platform impersonation banner E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export async function resolveAuthedUserProfileByLoginEmail(): Promise<{
  id: string;
  email: string;
} | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  if (!email) return null;

  const user = await prisma.userProfile.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true },
  });
  return user;
}

export async function seedPlatformImpersonationSession(
  label: string,
  targetUserId: string,
  targetEmail: string,
): Promise<PlatformImpersonationFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const admin = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `platform-imp-admin-${suffix}@e2e.test`,
      fullName: `Platform Impersonation Admin ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: {
      name: `Platform Impersonation Target WS ${suffix}`,
      ownerUserId: targetUserId,
    },
  });
  const reason = `E2E platform impersonation ${label}`;
  const session = await prisma.impersonationSession.create({
    data: {
      adminUserId: admin.id,
      targetUserId,
      reason,
    },
  });

  return {
    adminUserId: admin.id,
    adminEmail: admin.email,
    targetUserId,
    targetEmail,
    workspaceId: workspace.id,
    sessionId: session.id,
    reason,
    cleanup: async () => {
      await prisma.auditLog
        .deleteMany({
          where: {
            userId: admin.id,
            action: { in: ["platform.impersonation.start", "platform.impersonation.end"] },
          },
        })
        .catch(() => undefined);
      await prisma.impersonationSession.delete({ where: { id: session.id } }).catch(() => undefined);
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: admin.id } }).catch(() => undefined);
    },
  };
}

export async function seedImpersonationSessionForAuthedTarget(
  label: string,
): Promise<PlatformImpersonationFixture | null> {
  const authed = await resolveAuthedUserProfileByLoginEmail();
  if (!authed) return null;
  return seedPlatformImpersonationSession(label, authed.id, authed.email);
}
