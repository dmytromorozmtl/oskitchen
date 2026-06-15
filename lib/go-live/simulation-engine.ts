import type { BusinessType, GoLiveSimulationResult, GoLiveSimulationType } from "@prisma/client";

import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

export const SIMULATION_TYPE_LABEL: Record<GoLiveSimulationType, string> = {
  LUNCH_RUSH: "Lunch rush",
  MEAL_PREP_BATCH: "Meal prep batch",
  CATERING_EVENT: "Catering event",
  MULTI_LOCATION_DAY: "Multi-location day",
  DELIVERY_SURGE: "Delivery surge",
  HOLIDAY_VOLUME: "Holiday volume",
  GHOST_KITCHEN_SPIKE: "Ghost kitchen spike",
  CUSTOM: "Custom",
};

const SIMULATION_DESCRIPTION: Record<GoLiveSimulationType, string> = {
  LUNCH_RUSH: "120 orders concentrated 11:00–13:30 with normal modifier mix.",
  MEAL_PREP_BATCH: "Weekly batch of pickup + delivery orders prepared and packed in one window.",
  CATERING_EVENT: "Single large quote with multi-tray packing and on-time delivery.",
  MULTI_LOCATION_DAY: "Equivalent day across all active locations.",
  DELIVERY_SURGE: "200 delivery orders within 4h with route validation.",
  HOLIDAY_VOLUME: "Day-over-day surge for holiday throughput planning.",
  GHOST_KITCHEN_SPIKE: "Marketplace spike across multiple brand SKUs.",
  CUSTOM: "User-defined scenario.",
};

export type SimulationScenario = {
  type: GoLiveSimulationType;
  description: string;
  targetOrders: number;
  durationMinutes: number;
  channels: string[];
};

export const SCENARIOS: Record<GoLiveSimulationType, SimulationScenario> = {
  LUNCH_RUSH: { type: "LUNCH_RUSH", description: SIMULATION_DESCRIPTION.LUNCH_RUSH, targetOrders: 120, durationMinutes: 150, channels: ["storefront", "uber-eats"] },
  MEAL_PREP_BATCH: { type: "MEAL_PREP_BATCH", description: SIMULATION_DESCRIPTION.MEAL_PREP_BATCH, targetOrders: 80, durationMinutes: 480, channels: ["storefront"] },
  CATERING_EVENT: { type: "CATERING_EVENT", description: SIMULATION_DESCRIPTION.CATERING_EVENT, targetOrders: 1, durationMinutes: 240, channels: ["manual"] },
  MULTI_LOCATION_DAY: { type: "MULTI_LOCATION_DAY", description: SIMULATION_DESCRIPTION.MULTI_LOCATION_DAY, targetOrders: 300, durationMinutes: 600, channels: ["storefront", "shopify"] },
  DELIVERY_SURGE: { type: "DELIVERY_SURGE", description: SIMULATION_DESCRIPTION.DELIVERY_SURGE, targetOrders: 200, durationMinutes: 240, channels: ["uber-direct", "storefront"] },
  HOLIDAY_VOLUME: { type: "HOLIDAY_VOLUME", description: SIMULATION_DESCRIPTION.HOLIDAY_VOLUME, targetOrders: 500, durationMinutes: 720, channels: ["storefront", "shopify", "uber-eats"] },
  GHOST_KITCHEN_SPIKE: { type: "GHOST_KITCHEN_SPIKE", description: SIMULATION_DESCRIPTION.GHOST_KITCHEN_SPIKE, targetOrders: 250, durationMinutes: 240, channels: ["uber-eats", "uber-direct"] },
  CUSTOM: { type: "CUSTOM", description: SIMULATION_DESCRIPTION.CUSTOM, targetOrders: 50, durationMinutes: 120, channels: [] },
};

export type SimulationFinding = {
  level: "OK" | "WARNING" | "ERROR";
  module: string;
  message: string;
  recommendation?: string;
};

export type SimulationReport = {
  scenario: SimulationScenario;
  result: GoLiveSimulationResult;
  durationMs: number;
  estimatedThroughputPerHour: number;
  findings: SimulationFinding[];
  recommendations: string[];
};

/**
 * Deterministic simulation: never touches live data, only inspects
 * the readiness snapshot and produces a structured report.
 */
export function runSimulation(
  type: GoLiveSimulationType,
  inputs: ReadinessInputs,
  businessType: BusinessType | null,
): SimulationReport {
  const scenario = SCENARIOS[type];
  const findings: SimulationFinding[] = [];
  const recommendations: string[] = [];

  if (!inputs.hasMenu || inputs.productCount === 0) {
    findings.push({
      level: "ERROR",
      module: "catalog",
      message: "No active menu or products.",
      recommendation: "Create a menu and at least one product before running this scenario.",
    });
  }
  if (inputs.staffActive === 0) {
    findings.push({
      level: "ERROR",
      module: "staffing",
      message: "No active staff members.",
      recommendation: "Add staff and assign roles for the simulated time window.",
    });
  }
  if (inputs.productionRuns === 0) {
    findings.push({
      level: "WARNING",
      module: "kitchen",
      message: "Production flow has never been exercised.",
      recommendation: "Run at least one production batch before relying on the throughput estimate.",
    });
  }
  if (inputs.connectionsBroken > 0) {
    findings.push({
      level: "ERROR",
      module: "integrations",
      message: `${inputs.connectionsBroken} sales channel(s) in error state.`,
      recommendation: "Repair or disable broken channels before launch.",
    });
  }
  if (inputs.unmappedProductCount > 0 && inputs.connectionsConnected > 0) {
    findings.push({
      level: "ERROR",
      module: "mapping",
      message: `${inputs.unmappedProductCount} unmapped external product(s).`,
      recommendation: "Resolve in the Product Mapping Workbench.",
    });
  }
  if (type === "DELIVERY_SURGE" || type === "MULTI_LOCATION_DAY") {
    if (inputs.deliveryRoutes === 0) {
      findings.push({
        level: "ERROR",
        module: "routes",
        message: "No delivery routes prepared for this volume.",
        recommendation: "Add delivery routes before this scenario can pass.",
      });
    }
  }
  if (type === "MEAL_PREP_BATCH" || type === "CATERING_EVENT") {
    if (inputs.packingValidatedCount === 0) {
      findings.push({
        level: "WARNING",
        module: "packing",
        message: "Packing verification has not been run.",
        recommendation: "Validate packing before high-volume meal prep days.",
      });
    }
    if (inputs.labelsPrinted === 0) {
      findings.push({
        level: "WARNING",
        module: "labels",
        message: "No labels have been printed yet.",
        recommendation: "Print sample labels and confirm formatting.",
      });
    }
  }
  if (!inputs.hasAnalytics) {
    findings.push({
      level: "WARNING",
      module: "analytics",
      message: "Analytics not firing.",
      recommendation: "Verify analytics integration before launch.",
    });
  }

  // Throughput estimate (deterministic): orders per hour the workspace
  // can realistically handle given current staffing and packing.
  const baseThroughput = Math.max(5, inputs.staffActive * 8);
  const packingMultiplier = inputs.packingValidatedCount > 0 ? 1.2 : 0.8;
  const integrationMultiplier = inputs.connectionsBroken > 0 ? 0.5 : 1;
  const businessMultiplier = businessType === "MEAL_PREP" ? 1.4 : businessType === "GHOST_KITCHEN" ? 1.2 : 1;
  const estimatedThroughputPerHour = Math.round(
    baseThroughput * packingMultiplier * integrationMultiplier * businessMultiplier,
  );

  const requiredThroughputPerHour =
    scenario.targetOrders / Math.max(1, scenario.durationMinutes / 60);
  if (estimatedThroughputPerHour < requiredThroughputPerHour) {
    findings.push({
      level: "WARNING",
      module: "throughput",
      message: `Estimated throughput ${estimatedThroughputPerHour}/h is below scenario requirement ${Math.round(requiredThroughputPerHour)}/h.`,
      recommendation: "Add staff or extend the window before this scenario.",
    });
  }

  const hasError = findings.some((f) => f.level === "ERROR");
  const hasWarning = findings.some((f) => f.level === "WARNING");
  const result: GoLiveSimulationResult = hasError ? "FAILED" : hasWarning ? "WARNING" : "PASSED";

  if (result === "PASSED") {
    recommendations.push("Scenario passed. Capture a launch approval and proceed.");
  } else {
    recommendations.push("Resolve the findings above and re-run the simulation.");
  }

  return {
    scenario,
    result,
    durationMs: 0,
    estimatedThroughputPerHour,
    findings,
    recommendations,
  };
}
