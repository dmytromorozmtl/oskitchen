import { createHash, timingSafeEqual } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { prismaRolesForKind } from "@/lib/platform/platform-roles";

export type ScimAuditorProvisionPayload = {
  externalId: string;
  email: string;
  active: boolean;
  displayName?: string;
};

function verifyScimToken(authHeader: string | null): boolean {
  const secret = process.env.EXPERIMENT_SCIM_WEBHOOK_SECRET?.trim();
  if (!secret || !authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** IdP SCIM → PLATFORM_READONLY_AUDITOR (Prisma STANDARD_USER). */
export async function provisionExperimentAuditorFromScim(
  payload: ScimAuditorProvisionPayload,
  authHeader: string | null,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  if (!verifyScimToken(authHeader)) {
    return { ok: false, error: "Unauthorized" };
  }

  const roles = prismaRolesForKind("PLATFORM_READONLY_AUDITOR");
  const targetRole = roles[0] ?? "STANDARD_USER";

  const profile = await prisma.userProfile.findFirst({
    where: { email: payload.email.toLowerCase() },
    select: { id: true },
  });

  if (!profile) {
    return { ok: false, error: "User not found — invite via IdP JIT first" };
  }

  if (!payload.active) {
    await prisma.platformUserRole.deleteMany({
      where: { userId: profile.id, role: targetRole },
    });
    return { ok: true, userId: profile.id };
  }

  await prisma.platformUserRole.upsert({
    where: {
      userId_role: { userId: profile.id, role: targetRole },
    },
    create: { userId: profile.id, role: targetRole },
    update: {},
  });

  return { ok: true, userId: profile.id };
}
