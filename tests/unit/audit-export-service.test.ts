import { describe, expect, it } from "vitest";

import {
  buildAuditExportDownloadHref,
  parseAuditExportSearchParams,
} from "@/lib/audit/audit-export-filters";
import {
  buildAuditExportCsv,
  buildAuditExportJson,
  EXPORT_CAP,
} from "@/services/audit/audit-export-service";

describe("audit export service", () => {
  const sampleRows = [
    {
      id: "log-1",
      createdAt: new Date("2026-06-01T12:00:00.000Z"),
      action: "ORDER_CREATED",
      category: "ORDERS",
      severity: "NOTICE",
      source: "USER",
      entityType: "Order",
      entityId: "ord-1",
      actorEmail: "owner@kitchen.test",
      userId: "user-1",
      route: "/dashboard/orders",
    },
  ];

  it("exports CSV with header row and escaped values", () => {
    const csv = buildAuditExportCsv(sampleRows);
    expect(csv.split("\n")[0]).toBe(
      "id,createdAt,severity,action,category,source,entityType,entityId,actorEmail,userId,route",
    );
    expect(csv).toContain("ORDER_CREATED");
    expect(csv).toContain("owner@kitchen.test");
  });

  it("exports JSON array", () => {
    const json = buildAuditExportJson(sampleRows);
    const parsed = JSON.parse(json) as typeof sampleRows;
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.action).toBe("ORDER_CREATED");
  });

  it("caps exports at 5000 rows", () => {
    expect(EXPORT_CAP).toBe(5000);
  });
});

describe("audit export filter parsing", () => {
  it("parses query params into audit list filters", () => {
    const params = new URLSearchParams({
      tab: "security",
      action: "PERMISSION",
      category: "SECURITY",
      q: "denied",
      from: "2026-06-01T00:00:00.000Z",
      to: "2026-06-02T00:00:00.000Z",
      critical: "1",
    });
    const filters = parseAuditExportSearchParams(params);
    expect(filters.tab).toBe("security");
    expect(filters.action).toBe("PERMISSION");
    expect(filters.keyword).toBe("denied");
    expect(filters.onlyCritical).toBe(true);
    expect(filters.from?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("builds signed CSV download href preserving filters", () => {
    const href = buildAuditExportDownloadHref({
      format: "csv",
      signed: true,
      filters: {
        tab: "security",
        action: "LOGIN",
        from: new Date("2026-06-01T00:00:00.000Z"),
      },
    });
    expect(href).toContain("/api/dashboard/audit-logs/export?");
    expect(href).toContain("signed=1");
    expect(href).toContain("format=csv");
    expect(href).toContain("tab=security");
    expect(href).toContain("action=LOGIN");
  });
});
