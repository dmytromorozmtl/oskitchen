import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth";
import { canAccessGrowthModule } from "@/lib/growth/growth-permissions";
import { prisma } from "@/lib/prisma";

/** Same gate as Growth CRM: owners, platform superadmin, and platform GTM roles. */
export async function assertBetaProgramAccess() {
  const session = await requireSessionUser();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true },
  });
  if (!profile) redirect("/dashboard");
  const ok = await canAccessGrowthModule(session.id, session.email ?? null, profile.role);
  if (!ok) redirect("/dashboard");
  return session;
}

export { canAccessGrowthModule as canAccessBetaProgram } from "@/lib/growth/growth-permissions";
