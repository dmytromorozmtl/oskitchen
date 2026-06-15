import { describe, expect, it } from "vitest";

import {
  buildMultiLocationRollup,
  buildMultiLocationRollupCsv,
} from "@/lib/enterprise/multi-location-rollup-builders";
import {
  MULTI_LOCATION_ROLLUP_EXPORT_API_PATH,
  MULTI_LOCATION_ROLLUP_EXPORT_E2E_POLICY_ID,
  rollupExportWithinContract,
} from "@/lib/enterprise/multi-location-rollup-export-e2e-policy";
import {
  allRequiredRollupKindsPresent,
  rollupCsvExportWithinContract,
  summarizeMultiLocationRollupExport,
} from "@/lib/enterprise/multi-location-rollup-export-metrics";
import { buildMultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

describe("multi-location rollup export E2E policy (QA-33)", () => {
  it("exports rollup export API contract", () => {
    expect(MULTI_LOCATION_ROLLUP_EXPORT_E2E_POLICY_ID).toBe(
      "multi-location-rollup-export-e2e-v1",
    );
    expect(MULTI_LOCATION_ROLLUP_EXPORT_API_PATH).toBe(
      "/api/dashboard/multi-location/rollup-export",
    );
  });
});

describe("multi-location rollup CSV export contract (QA-33)", () => {
  const from = new Date("2026-05-01T00:00:00.000Z");
  const to = new Date("2026-05-31T23:59:59.999Z");

  it("summarizes builder CSV within export contract", () => {
    const snapshot = buildMultiLocationAnalyticsSnapshot({
      from,
      to,
      locations: [{ id: "loc-a", name: "Main", status: "ACTIVE", type: "RESTAURANT" }],
      orders: [
        {
          locationId: "loc-a",
          status: "COMPLETED",
          total: 95,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-15T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map(),
      tasksByLocation: new Map(),
    });

    const csv = buildMultiLocationRollupCsv(buildMultiLocationRollup({ snapshot }));
    const summary = summarizeMultiLocationRollupExport(csv);

    expect(summary.rowCount).toBeGreaterThanOrEqual(2);
    expect(allRequiredRollupKindsPresent(summary.kinds)).toBe(true);
    expect(rollupCsvExportWithinContract(csv)).toBe(true);
    expect(rollupExportWithinContract(summary)).toBe(true);
  });
});
