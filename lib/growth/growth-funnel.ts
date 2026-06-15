import type { BetaLeadStatus } from "@prisma/client";

import type { GrowthLifecycleStage } from "@/lib/growth/growth-events";

/**
 * Maps persisted `BetaLead.status` + optional `lifecycleStage` string into a founder-CRM lane.
 * `lifecycleStage` wins when set (PLG vocabulary); otherwise we infer from `status`.
 */
export function resolveLeadLane(input: {
  lifecycleStage: string | null | undefined;
  status: BetaLeadStatus;
}): GrowthLifecycleStage {
  const raw = (input.lifecycleStage ?? "").trim().toUpperCase();
  if (raw && isGrowthLifecycleStage(raw)) return raw;

  switch (input.status) {
    case "NEW":
      return "LEAD";
    case "QUALIFIED":
      return "MQL";
    case "CONTACTED":
      return "SQL";
    case "DEMO_BOOKED":
      return "DEMO_SCHEDULED";
    case "ONBOARDED":
      return "ACTIVATED";
    case "CUSTOMER":
      return "PAYING";
    case "REJECTED":
      return "CHURNED";
    default:
      return "LEAD";
  }
}

function isGrowthLifecycleStage(s: string): s is GrowthLifecycleStage {
  return (
    s === "VISITOR" ||
    s === "LEAD" ||
    s === "MQL" ||
    s === "SQL" ||
    s === "DEMO_SCHEDULED" ||
    s === "TRIAL_STARTED" ||
    s === "ACTIVATED" ||
    s === "PAYING" ||
    s === "EXPANSION" ||
    s === "AT_RISK" ||
    s === "CHURNED"
  );
}
