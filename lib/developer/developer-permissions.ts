import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { UserRole } from "@prisma/client";

export type DeveloperAccessContext = {
  userId: string;
  email: string | null | undefined;
  role: UserRole;
  platformSuper: boolean;
};

export async function getDeveloperAccessContext(): Promise<DeveloperAccessContext | null> {
  const session = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  if (!profile) return null;
  const platformSuper = await isSuperAdminUser(session.id, profile.email ?? session.email);
  const allowed = profile.role === UserRole.OWNER || platformSuper;
  if (!allowed) return null;
  return {
    userId: session.id,
    email: profile.email ?? session.email,
    role: profile.role,
    platformSuper,
  };
}

/** Owner or platform superadmin (founder / SUPER_ADMIN row). */
export async function requireDeveloperCenterAccess(): Promise<DeveloperAccessContext> {
  const ctx = await getDeveloperAccessContext();
  if (!ctx) redirect("/dashboard");
  return ctx;
}
