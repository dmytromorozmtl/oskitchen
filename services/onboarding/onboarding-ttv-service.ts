import {
  evaluateOnboardingTtvStatus,
  formatOnboardingTtvHeadline,
  type OnboardingTtvMeasurement,
} from "@/lib/onboarding/onboarding-ttv-p2-40-measurement";
import {
  ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT,
  ONBOARDING_TTV_P2_40_POLICY_ID,
} from "@/lib/onboarding/onboarding-ttv-p2-40-policy";
import { prisma } from "@/lib/prisma";
import { lifecycleEventListWhereForOwner, orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type OnboardingTtvPayload = {
  policyId: typeof ONBOARDING_TTV_P2_40_POLICY_ID;
  measurement: OnboardingTtvMeasurement;
  headline: string;
  showStrip: boolean;
};

export async function loadOnboardingTtvMeasurement(
  userId: string,
  accountCreatedAt: Date,
): Promise<OnboardingTtvPayload> {
  const orderWhere = await orderListWhereForOwner(userId);

  const [firstOrder, lifecycle] = await Promise.all([
    prisma.order.findFirst({
      where: orderWhere,
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.lifecycleEvent.findFirst({
      where: {
        AND: [
          await lifecycleEventListWhereForOwner(userId),
          { eventName: ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT },
        ],
      },
      select: { metadata: true },
    }),
  ]);

  const measurement = evaluateOnboardingTtvStatus({
    signupAt: accountCreatedAt,
    firstOrderAt: firstOrder?.createdAt ?? null,
  });

  const accountAgeDays = Math.floor(
    (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  const showStrip =
    accountAgeDays <= 30 &&
    (measurement.status === "pending_on_track" ||
      measurement.status === "pending_overdue" ||
      (measurement.status === "met_target" && Boolean(lifecycle)));

  return {
    policyId: ONBOARDING_TTV_P2_40_POLICY_ID,
    measurement,
    headline: formatOnboardingTtvHeadline(measurement),
    showStrip,
  };
}
