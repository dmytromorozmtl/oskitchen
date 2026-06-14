import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import type { KitchenPreflightGate, KitchenPreflightResult } from "@/lib/beta-ops/types";

export async function runKitchenPreflight(email: string): Promise<KitchenPreflightResult | null> {
  const user = await prisma.userProfile.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
  if (!user) return null;

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [profile, settings, ws] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { onboardingCompleted: true },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: user.id },
      select: { businessName: true, demoMode: true },
    }),
    prisma.workspace.findFirst({
      where: { ownerUserId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const [orderScope, menuScope, integrationScope] = await Promise.all([
    orderListWhereForOwner(user.id),
    menuListWhereForOwner(user.id),
    integrationConnectionListWhereForOwner(user.id),
  ]);
  const [orderCount, ordersLast7d, menuCount, integrationCount, staffCount] = await Promise.all([
    prisma.order.count({ where: orderScope }),
    prisma.order.count({
      where: { AND: [orderScope, { createdAt: { gte: since7d } }] },
    }),
    prisma.menu.count({ where: menuScope }),
    prisma.integrationConnection.count({ where: integrationScope }),
    ws
      ? prisma.workspaceMember.count({ where: { workspaceId: ws.id, userId: { not: user.id } } })
      : Promise.resolve(0),
  ]);

  const gates: KitchenPreflightGate[] = [
    { ok: Boolean(profile), label: "User profile exists", blocking: true },
    { ok: profile?.onboardingCompleted === true, label: "Onboarding completed", blocking: true },
    {
      ok: Boolean(ws),
      label: "Workspace exists (tenant isolation)",
      detail: ws?.name ?? undefined,
      blocking: true,
    },
    { ok: orderCount > 0, label: "Has at least one order", detail: String(orderCount), blocking: true },
    { ok: menuCount > 0, label: "Has at least one menu", detail: String(menuCount), blocking: true },
    {
      ok: settings?.demoMode !== true,
      label: "Demo mode off",
      detail: settings?.demoMode ? "demoMode=true" : settings?.businessName ?? "—",
      blocking: true,
    },
    {
      ok: true,
      label: "Staff invited (recommended)",
      detail: staffCount > 0 ? `${staffCount} member(s)` : "optional",
      blocking: false,
    },
    {
      ok: true,
      label: "Integrations connected (recommended)",
      detail: integrationCount > 0 ? String(integrationCount) : "optional",
      blocking: false,
    },
  ];

  const ready = gates.filter((g) => g.blocking).every((g) => g.ok);

  return {
    email: user.email,
    ownerUserId: user.id,
    businessName: settings?.businessName ?? null,
    workspaceName: ws?.name ?? null,
    ready,
    gates,
    metrics: {
      orderCount,
      ordersLast7d,
      staffMembers: staffCount,
      integrations: integrationCount,
    },
  };
}
