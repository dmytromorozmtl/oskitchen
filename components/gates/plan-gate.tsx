import type { ReactNode } from "react";

import { requireSessionUser } from "@/lib/auth";
import type { GatedFeature } from "@/lib/feature-access";
import { planAllowsFeature } from "@/lib/feature-access";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";

export async function PlanGate({
  feature,
  children,
  fallback,
}: {
  feature: GatedFeature;
  children: ReactNode;
  fallback: ReactNode;
}) {
  const user = await requireSessionUser();
  if (await isSuperAdminUser(user.id, user.email)) return children;
  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { plan: true },
  });
  const plan = sub?.plan ?? "STARTER";
  if (!planAllowsFeature(plan, feature)) return fallback;
  return children;
}
