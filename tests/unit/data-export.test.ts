import { describe, expect, it } from "vitest";

import {
  buildDataExportDomain,
  buildDataExportLane,
  buildDataPortabilitySnapshot,
  DATA_EXPORT_DOMAIN_META,
  DATA_EXPORT_LANE_DOMAINS,
} from "@/lib/data/export-builders";
import {
  DATA_EXPORT_FORMATS,
  DATA_EXPORT_MANIFEST_ROUTE,
  DATA_EXPORT_PATH,
  DATA_EXPORT_POLICY_ID,
  DATA_EXPORT_SERVICE,
} from "@/lib/data/export-policy";

describe("Data Export & Portability", () => {
  it("locks policy constants", () => {
    expect(DATA_EXPORT_POLICY_ID).toBe("data-export-portability-v1");
    expect(DATA_EXPORT_SERVICE).toBe("services/data/export-service.ts");
    expect(DATA_EXPORT_PATH).toBe("/dashboard/data/export");
    expect(DATA_EXPORT_MANIFEST_ROUTE).toBe("/api/data/portability-manifest");
    expect(DATA_EXPORT_FORMATS).toEqual(["csv", "json-manifest"]);
  });

  it("maps all export domains into portability lanes", () => {
    const laneTypes = Object.values(DATA_EXPORT_LANE_DOMAINS).flat();
    expect(laneTypes).toContain("orders");
    expect(laneTypes).toContain("audit_logs");
    expect(Object.keys(DATA_EXPORT_DOMAIN_META)).toHaveLength(laneTypes.length);
  });

  it("builds domain, lane, and snapshot helpers", () => {
    const domain = buildDataExportDomain({
      type: "orders",
      rowCount: 240,
      accessible: true,
    });
    expect(domain.downloadHref).toBe("/api/export?type=orders");
    expect(domain.label).toBe("Orders");

    const lane = buildDataExportLane({
      id: "operations",
      domains: [domain],
    });
    expect(lane.label).toBe("Operations");
    expect(lane.rowCount).toBe(240);

    const snapshot = buildDataPortabilitySnapshot({
      workspaceLabel: "Demo Kitchen",
      lanes: [lane],
      analyzedAt: new Date("2026-06-05T12:00:00Z"),
    });

    expect(snapshot.policyId).toBe(DATA_EXPORT_POLICY_ID);
    expect(snapshot.basePath).toBe(DATA_EXPORT_PATH);
    expect(snapshot.summary.domainCount).toBe(1);
    expect(snapshot.summary.accessibleDomainCount).toBe(1);
    expect(snapshot.summary.totalRows).toBe(240);
    expect(snapshot.summary.manifestHref).toBe(DATA_EXPORT_MANIFEST_ROUTE);
    expect(snapshot.generatedAtIso).toBe("2026-06-05T12:00:00.000Z");
  });
});
