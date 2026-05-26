import type { SubscriptionPlan } from "@prisma/client";

/** Plan entitlements stay user-scoped today — org rollups are documented in org billing service. */
export function planLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case "STARTER":
      return "Starter";
    case "PRO":
      return "Pro";
    case "TEAM":
      return "Team";
    case "ENTERPRISE":
      return "Enterprise";
    default:
      return plan;
  }
}
