/**
 * Lightweight operational hints — pure functions for dashboards and cron.
 * Heavy ML/statistics belong in a worker; keep these deterministic.
 */

export type DemandHintInput = {
  ordersThisWeek: number;
  ordersPriorWeek: number;
  /** 0–1 capacity proxy (e.g. production completion). */
  capacityRatio: number;
};

export type DemandHint = {
  severity: "info" | "warning";
  message: string;
};

export function buildDemandHint(input: DemandHintInput): DemandHint | null {
  const delta = input.ordersThisWeek - input.ordersPriorWeek;
  if (input.capacityRatio < 0.55 && delta > 2) {
    return {
      severity: "warning",
      message:
        "Order volume is rising while kitchen completion is soft — consider adding prep capacity or staggering menus.",
    };
  }
  if (delta < -5) {
    return {
      severity: "info",
      message: "Order volume dipped week over week — good moment to run a targeted promo or follow up VIP guests.",
    };
  }
  return null;
}
