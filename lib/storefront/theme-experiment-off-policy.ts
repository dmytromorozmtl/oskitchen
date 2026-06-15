/**
 * Off-policy evaluation (IPS-style) for contextual bandit regret — BQ nightly → webhook.
 */

export type OffPolicyArmMetric = {
  armId: string;
  impressions: number;
  conversions: number;
  propensity: number;
};

export type OffPolicyEvaluation = {
  at: string;
  policy: string;
  ipsLiftPp: number;
  dmLiftPp: number;
  estimatedRegretPp: number;
  arms: OffPolicyArmMetric[];
};

export function readOffPolicyEvaluation(raw: unknown): OffPolicyEvaluation | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).offPolicyEvaluation;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !Array.isArray(snap.arms)) return null;
  return {
    at: snap.at,
    policy: typeof snap.policy === "string" ? snap.policy : "thompson",
    ipsLiftPp: typeof snap.ipsLiftPp === "number" ? snap.ipsLiftPp : 0,
    dmLiftPp: typeof snap.dmLiftPp === "number" ? snap.dmLiftPp : 0,
    estimatedRegretPp: typeof snap.estimatedRegretPp === "number" ? snap.estimatedRegretPp : 0,
    arms: snap.arms as OffPolicyArmMetric[],
  };
}

/** Inverse propensity scoring lift vs control arm. */
export function computeOffPolicyLift(arms: OffPolicyArmMetric[], controlArmId = "published"): OffPolicyEvaluation {
  const control = arms.find((a) => a.armId === controlArmId) ?? arms[0];
  let bestIps = 0;
  let bestDm = 0;

  for (const arm of arms) {
    if (arm.armId === controlArmId || arm.impressions <= 0) continue;
    const rate = arm.conversions / arm.impressions;
    const controlRate =
      control && control.impressions > 0 ? control.conversions / control.impressions : 0;
    const ipsWeight = 1 / Math.max(0.01, arm.propensity);
    const ipsRate = rate * ipsWeight;
    const dmRate = rate;
    const ipsLift = (ipsRate - controlRate) * 100;
    const dmLift = (dmRate - controlRate) * 100;
    if (ipsLift > bestIps) bestIps = ipsLift;
    if (dmLift > bestDm) bestDm = dmLift;
  }

  return {
    at: new Date().toISOString(),
    policy: "ips_dm",
    ipsLiftPp: Math.round(bestIps * 10) / 10,
    dmLiftPp: Math.round(bestDm * 10) / 10,
    estimatedRegretPp: Math.max(0, Math.round((bestDm - bestIps) * 10) / 10),
    arms,
  };
}
