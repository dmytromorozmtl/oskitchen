import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AUDITOR_PLATFORM_ROLES = ["STANDARD_USER", "SUPPORT_ADMIN", "PLATFORM_ADMIN", "SUPER_ADMIN"] as const;

export async function userHasExperimentAuditorAccess(userId: string): Promise<boolean> {
  const allowlist = process.env.EXPERIMENT_AUDITOR_USER_IDS?.split(",").map((s) => s.trim()) ?? [];
  if (allowlist.includes(userId)) return true;

  const roles = await prisma.platformUserRole.findMany({
    where: { userId },
    select: { role: true },
  });

  if (roles.some((r) => AUDITOR_PLATFORM_ROLES.includes(r.role as (typeof AUDITOR_PLATFORM_ROLES)[number]))) {
    return true;
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return profile?.role === "OWNER";
}

/** PLATFORM_READONLY_AUDITOR + workspace owner fallback — read-only compliance routes. */
export async function requireExperimentAuditorAccess() {
  const user = await requireSessionUser();
  const ok = await userHasExperimentAuditorAccess(user.id);
  if (!ok) redirect("/dashboard");
  return user;
}
