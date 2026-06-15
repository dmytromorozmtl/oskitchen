import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

/** Derive activation milestones from existing tenant data and persist `ActivationState`. */
export async function syncActivationFromDatabase(userId: string): Promise<void> {
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  const [menuWhere, productWhere, orderWhere, connectionWhere] = await Promise.all([
    menuListWhereForOwner(userId),
    productListWhereForOwner(userId),
    orderListWhereForOwner(userId),
    integrationConnectionListWhereForOwner(userId),
  ]);

  const [
    profile,
    settings,
    menuCount,
    productCount,
    orderCount,
    prodDone,
    packingCount,
    integrationConnected,
    subscription,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.menu.count({ where: menuWhere }),
    prisma.product.count({ where: productWhere }),
    prisma.order.count({ where: orderWhere }),
    prisma.productionTask.count({
      where: {
        OR: [{ cooked: true }, { packed: true }],
        product: productWhere,
      },
    }),
    prisma.packingEvent.count({ where: { userId } }),
    prisma.integrationConnection.count({
      where: { AND: [connectionWhere, { status: "CONNECTED" }] },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const businessSettingsCompleted = Boolean(
    settings?.businessName?.trim() &&
      (settings.pickupAddress?.trim() || settings.deliveryEnabled),
  );

  const billingStarted = Boolean(
    subscription?.stripeSubscriptionId?.trim() ||
      subscription?.stripeCustomerId?.trim(),
  );

  const milestones = {
    onboardingCompleted: profile?.onboardingCompleted ?? false,
    businessSettingsCompleted,
    firstMenuCreated: menuCount > 0,
    firstProductCreated: productCount > 0,
    firstOrderCreated: orderCount > 0,
    firstProductionCompleted: prodDone > 0,
    firstPackingExported: packingCount > 0,
    firstIntegrationConnected: integrationConnected > 0,
    billingStarted,
  };

  const core =
    milestones.onboardingCompleted &&
    milestones.firstMenuCreated &&
    milestones.firstOrderCreated;

  const existing = await prisma.activationState.findUnique({
    where: { userId },
    select: { activatedAt: true, checklistDismissed: true },
  });

  const activatedAt =
    core ? (existing?.activatedAt ?? new Date()) : existing?.activatedAt ?? null;

  await prisma.activationState.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      ...milestones,
      checklistDismissed: false,
      activatedAt: core ? new Date() : null,
    },
    update: {
      workspaceId,
      ...milestones,
      checklistDismissed: existing?.checklistDismissed ?? false,
      activatedAt,
    },
  });
}
