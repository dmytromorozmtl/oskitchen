import {
  canUseFeature,
  minimumPlanForFeature,
  type FeatureKey,
} from "@/lib/plans/feature-registry";

import { UpgradeGateFallback } from "@/components/plans/upgrade-gate-fallback";

export async function PlanGate({
  userId,
  feature,
  title,
  children,
}: {
  userId: string;
  feature: FeatureKey;
  title: string;
  children: React.ReactNode;
}) {
  const r = await canUseFeature(userId, feature);
  if (r.allowed) {
    return <>{children}</>;
  }
  return (
    <UpgradeGateFallback
      title={title}
      feature={feature}
      reason={r.reason}
      currentPlan={r.plan}
      minimumPlan={minimumPlanForFeature(feature)}
    />
  );
}
