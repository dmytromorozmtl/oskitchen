/**
 * Digital Twin data gate — honest readiness before high-confidence simulation.
 * @see docs/ai-moats-honest-positioning.md § Digital Twin
 */

export const DIGITAL_TWIN_DATA_GATE_POLICY_ID = "digital-twin-data-gate-v1" as const;

export const DIGITAL_TWIN_MIN_STATIONS = 2 as const;
export const DIGITAL_TWIN_MIN_ORDERS_30D = 20 as const;
export const DIGITAL_TWIN_MIN_MENU_MIX_ITEMS = 2 as const;

export type DigitalTwinDataGateSignal =
  | "production_stations"
  | "menu_mix_orders"
  | "staff_roster"
  | "recent_order_volume";

export type DigitalTwinDataGateTier = "live_ready" | "partial" | "demo_defaults";

export type DigitalTwinDataGateCheck = {
  signal: DigitalTwinDataGateSignal;
  passed: boolean;
  label: string;
  detail: string;
  remediationHref?: string;
};

export type DigitalTwinDataGateSnapshot = {
  productionStationCount: number;
  activeStaffCount: number;
  todayShiftCount: number;
  ordersLast30Days: number;
  menuMixItemCount: number;
  usesSyntheticMenuMix: boolean;
  usesDefaultStationConfig: boolean;
};

export type DigitalTwinDataGateResult = {
  policyId: typeof DIGITAL_TWIN_DATA_GATE_POLICY_ID;
  tier: DigitalTwinDataGateTier;
  ready: boolean;
  checks: DigitalTwinDataGateCheck[];
  maxConfidence: number;
  snapshot: DigitalTwinDataGateSnapshot;
  headline: string;
  detail: string;
};

export function buildDigitalTwinDataGateChecks(
  snapshot: DigitalTwinDataGateSnapshot,
): DigitalTwinDataGateCheck[] {
  return [
    {
      signal: "production_stations",
      passed: snapshot.productionStationCount >= DIGITAL_TWIN_MIN_STATIONS,
      label: "Production stations",
      detail:
        snapshot.productionStationCount >= DIGITAL_TWIN_MIN_STATIONS
          ? `${snapshot.productionStationCount} active stations configured`
          : "Add at least 2 production stations — simulation uses generic layout until then",
      remediationHref: "/dashboard/production/stations",
    },
    {
      signal: "menu_mix_orders",
      passed:
        !snapshot.usesSyntheticMenuMix &&
        snapshot.menuMixItemCount >= DIGITAL_TWIN_MIN_MENU_MIX_ITEMS,
      label: "Order-based menu mix",
      detail: snapshot.usesSyntheticMenuMix
        ? "No recent product mix — using placeholder menu items"
        : `${snapshot.menuMixItemCount} products in 30-day mix`,
      remediationHref: "/dashboard/orders",
    },
    {
      signal: "staff_roster",
      passed: snapshot.activeStaffCount >= 1 || snapshot.todayShiftCount >= 1,
      label: "Staff roster / shifts",
      detail:
        snapshot.todayShiftCount >= 1
          ? `${snapshot.todayShiftCount} shifts scheduled today`
          : snapshot.activeStaffCount >= 1
            ? `${snapshot.activeStaffCount} active staff on roster`
            : "No staff or shifts — simulation assigns default crew",
      remediationHref: "/dashboard/staff",
    },
    {
      signal: "recent_order_volume",
      passed: snapshot.ordersLast30Days >= DIGITAL_TWIN_MIN_ORDERS_30D,
      label: "Recent order volume",
      detail:
        snapshot.ordersLast30Days >= DIGITAL_TWIN_MIN_ORDERS_30D
          ? `${snapshot.ordersLast30Days} orders in last 30 days`
          : `${snapshot.ordersLast30Days} orders in last 30 days — need ${DIGITAL_TWIN_MIN_ORDERS_30D}+ for reliable demand`,
      remediationHref: "/dashboard/orders",
    },
  ];
}

export function resolveDigitalTwinDataGateTier(
  checks: DigitalTwinDataGateCheck[],
): DigitalTwinDataGateTier {
  const passed = checks.filter((c) => c.passed).length;
  if (passed === checks.length) return "live_ready";
  if (passed >= 2) return "partial";
  return "demo_defaults";
}

export function maxConfidenceForDigitalTwinTier(tier: DigitalTwinDataGateTier): number {
  switch (tier) {
    case "live_ready":
      return 0.84;
    case "partial":
      return 0.72;
    default:
      return 0.58;
  }
}

export function gateHeadlineForTier(tier: DigitalTwinDataGateTier): string {
  switch (tier) {
    case "live_ready":
      return "Live data gate — workspace qualified for simulation";
    case "partial":
      return "Partial data gate — simulation uses mixed live + default inputs";
    default:
      return "Demo defaults — simulation uses placeholder kitchen layout";
  }
}

export function gateDetailForTier(tier: DigitalTwinDataGateTier, failedCount: number): string {
  switch (tier) {
    case "live_ready":
      return "Stations, menu mix, staff, and order volume pass the data gate. Validate against live KDS before staffing changes.";
    case "partial":
      return `${failedCount} data signal${failedCount === 1 ? "" : "s"} still missing — confidence is capped. Complete the checks below for live-ready simulation.`;
    default:
      return "Most inputs are synthetic defaults. Use this for planning sketches only — not rush-hour staffing decisions.";
  }
}

export function assessDigitalTwinDataGateFromSnapshot(
  snapshot: DigitalTwinDataGateSnapshot,
): DigitalTwinDataGateResult {
  const checks = buildDigitalTwinDataGateChecks(snapshot);
  const tier = resolveDigitalTwinDataGateTier(checks);
  const failedCount = checks.filter((c) => !c.passed).length;

  return {
    policyId: DIGITAL_TWIN_DATA_GATE_POLICY_ID,
    tier,
    ready: tier === "live_ready",
    checks,
    maxConfidence: maxConfidenceForDigitalTwinTier(tier),
    snapshot,
    headline: gateHeadlineForTier(tier),
    detail: gateDetailForTier(tier, failedCount),
  };
}

export function applyDigitalTwinConfidenceCap<T extends { confidence: number }>(
  result: T,
  gate: DigitalTwinDataGateResult,
): T {
  return {
    ...result,
    confidence: Math.min(result.confidence, gate.maxConfidence),
  };
}
