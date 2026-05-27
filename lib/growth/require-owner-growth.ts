import { redirect } from "next/navigation";

import { requireGrowthPageAccess } from "@/lib/growth/growth-page-access";

export async function requireOwnerForGrowth() {
  const access = await requireGrowthPageAccess("growth.view");
  if (!access.ok) redirect("/dashboard");
  return access.actor.sessionUser;
}
