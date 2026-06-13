import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import {
  buildOnboardingTtvLifecycleMetadata,
  ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT,
} from "@/lib/onboarding/onboarding-ttv-p2-40-measurement";
import { ONBOARDING_TTV_P2_40_POLICY_ID } from "@/lib/onboarding/onboarding-ttv-p2-40-policy";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

/**
 * Record onboarding TTV when the workspace receives its first order.
 * Idempotent — skips if lifecycle event already exists or order count > 1.
 */
export async function recordOnboardingTtvOnFirstOrder(
  userId: string,
  orderCreatedAt = new Date(),
): Promise<void> {
  const orderWhere = await orderListWhereForOwner(userId);
  const orderCount = await prisma.order.count({ where: orderWhere });
  if (orderCount !== 1) return;

  const existing = await prisma.lifecycleEvent.findFirst({
    where: { userId, eventName: ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT },
    select: { id: true },
  });
  if (existing) return;

  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  if (!profile) return;

  const metadata = buildOnboardingTtvLifecycleMetadata({
    signupAt: profile.createdAt,
    firstOrderAt: orderCreatedAt,
    policyId: ONBOARDING_TTV_P2_40_POLICY_ID,
  });

  await recordLifecycleEventSafe(userId, ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT, metadata);

  const workspaceId = await ensureOwnerWorkspaceId(userId);
  await prisma.activationState.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      firstOrderCreated: true,
    },
    update: {
      firstOrderCreated: true,
      workspaceId,
    },
  });
}
