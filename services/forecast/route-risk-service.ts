export type RouteRiskForecast = {
  horizonDays: number;
  unassignedRouteIncidents: number;
  confidence: "low" | "medium" | "high";
  notes: string[];
};

/** Lightweight route risk placeholder until dispatch telemetry is centralized. */
export function buildRouteRiskStub(input: { unassignedIncidents: number; horizonDays?: number }): RouteRiskForecast {
  return {
    horizonDays: input.horizonDays ?? 7,
    unassignedRouteIncidents: input.unassignedIncidents,
    confidence: "low",
    notes: ["Based on supplied incident counts only — wire delivery dispatch metrics for precision."],
  };
}
