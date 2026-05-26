export type LaborForecastResult = {
  horizonDays: number;
  expectedLaborHours: number;
  confidence: "low" | "medium" | "high";
  notes: string[];
};

/** Placeholder deterministic labor projection — extend with scheduling integrations later. */
export function buildLaborForecastStub(params: { recentShiftHoursAvg: number; horizonDays?: number }): LaborForecastResult {
  const horizonDays = params.horizonDays ?? 7;
  const expectedLaborHours = Math.max(0, params.recentShiftHoursAvg * horizonDays);
  return {
    horizonDays,
    expectedLaborHours,
    confidence: "low",
    notes: [
      "Uses a simple average of supplied shift hours — connect workforce data for enterprise accuracy.",
      "Does not replace compliant payroll systems.",
    ],
  };
}
