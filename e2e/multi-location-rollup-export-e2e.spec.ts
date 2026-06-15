import { expect, test } from "@playwright/test";

import {
  buildMultiLocationRollup,
  buildMultiLocationRollupCsv,
  buildMultiLocationRollupExportHref,
} from "@/lib/enterprise/multi-location-rollup-builders";
import {
  ENTERPRISE_MULTI_LOCATION_PATH,
  MULTI_LOCATION_ROLLUP_EXPORT_API_PATH,
  MULTI_LOCATION_ROLLUP_EXPORT_E2E_POLICY_ID,
  MULTI_LOCATION_ROLLUP_EXPORT_SLI_ID,
  rollupExportHrefIncludesFilters,
  rollupExportWithinContract,
} from "@/lib/enterprise/multi-location-rollup-export-e2e-policy";
import {
  allRequiredRollupKindsPresent,
  rollupCsvExportWithinContract,
  summarizeMultiLocationRollupExport,
} from "@/lib/enterprise/multi-location-rollup-export-metrics";
import { buildMultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

import {
  assertAuthedRollupExportCsvContract,
  runMultiLocationRollupExportPanelFlow,
} from "./helpers/multi-location-rollup-export-flow";
import {
  skipMultiLocationRollupExportHttpIfNoBaseUrl,
  skipMultiLocationRollupExportIfNoDb,
  skipMultiLocationRollupExportIfNotAuthed,
} from "./helpers/multi-location-rollup-export-ready";

/**
 * Multi-location rollup CSV export E2E (QA-33).
 *
 * @see components/enterprise/multi-location-enterprise-panel.tsx
 * @see app/api/dashboard/multi-location/rollup-export/route.ts
 */

const from = new Date("2026-05-01T00:00:00.000Z");
const to = new Date("2026-05-31T23:59:59.999Z");

test.describe("multi-location rollup export policy", () => {
  test("exports API path and enterprise dashboard contract", () => {
    expect(MULTI_LOCATION_ROLLUP_EXPORT_E2E_POLICY_ID).toBe(
      "multi-location-rollup-export-e2e-v1",
    );
    expect(MULTI_LOCATION_ROLLUP_EXPORT_SLI_ID).toBe(
      "enterprise.multi_location_rollup_csv_export",
    );
    expect(MULTI_LOCATION_ROLLUP_EXPORT_API_PATH).toBe(
      "/api/dashboard/multi-location/rollup-export",
    );
    expect(ENTERPRISE_MULTI_LOCATION_PATH).toBe("/dashboard/enterprise/multi-location");
    expect(
      rollupExportHrefIncludesFilters(buildMultiLocationRollupExportHref({ from, to })),
    ).toBe(true);
  });
});

test.describe("multi-location rollup CSV export contract", () => {
  test("builder CSV includes network and location rows", () => {
    const snapshot = buildMultiLocationAnalyticsSnapshot({
      from,
      to,
      locations: [
        { id: "loc-a", name: "Downtown", status: "ACTIVE", type: "RESTAURANT" },
        { id: "loc-b", name: "Airport", status: "ACTIVE", type: "RESTAURANT" },
      ],
      orders: [
        {
          locationId: "loc-a",
          status: "COMPLETED",
          total: 120,
          fulfillmentType: "PICKUP",
          createdAt: new Date("2026-05-10T12:00:00.000Z"),
        },
        {
          locationId: "loc-b",
          status: "COMPLETED",
          total: 180,
          fulfillmentType: "DELIVERY",
          createdAt: new Date("2026-05-11T12:00:00.000Z"),
        },
      ],
      routesByLocation: new Map(),
      tasksByLocation: new Map(),
    });

    const csv = buildMultiLocationRollupCsv(buildMultiLocationRollup({ snapshot }));
    const summary = summarizeMultiLocationRollupExport(csv);

    expect(summary.headerMatches).toBe(true);
    expect(summary.hasNetworkRow).toBe(true);
    expect(summary.hasLocationRow).toBe(true);
    expect(allRequiredRollupKindsPresent(summary.kinds)).toBe(true);
    expect(rollupCsvExportWithinContract(csv)).toBe(true);
    expect(rollupExportWithinContract(summary)).toBe(true);
    expect(csv).toContain("Network total");
    expect(csv).toContain("Downtown");
  });
});

test.describe("multi-location rollup export HTTP (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Multi-location rollup export HTTP runs in chromium-authed project only",
    );
    skipMultiLocationRollupExportIfNotAuthed();
    skipMultiLocationRollupExportIfNoDb();
    skipMultiLocationRollupExportHttpIfNoBaseUrl();
  });

  test("authenticated GET returns CSV attachment with row count header", async ({ request }) => {
    await assertAuthedRollupExportCsvContract(request);
  });
});

test.describe("multi-location rollup export UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Multi-location rollup export UI runs in chromium-authed project only",
    );
    skipMultiLocationRollupExportIfNotAuthed();
  });

  test("enterprise panel exposes rollup CSV export link", async ({ page }) => {
    await runMultiLocationRollupExportPanelFlow(page);
  });
});
