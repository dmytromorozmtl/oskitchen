import { describe, expect, it } from "vitest";

import {
  buildDeliveryPillar,
  buildDistributionPillar,
  buildEnterpriseCommissaryDashboard,
  buildProductionPillar,
  buildPurchasingPillar,
} from "@/lib/enterprise/commissary-builders";
import {
  ENTERPRISE_COMMISSARY_PATH,
  ENTERPRISE_COMMISSARY_POLICY_ID,
  ENTERPRISE_COMMISSARY_SERVICE,
} from "@/lib/enterprise/commissary-policy";

describe("enterprise commissary OS", () => {
  it("locks policy constants", () => {
    expect(ENTERPRISE_COMMISSARY_POLICY_ID).toBe("enterprise-commissary-v1");
    expect(ENTERPRISE_COMMISSARY_SERVICE).toBe("services/enterprise/commissary-service.ts");
    expect(ENTERPRISE_COMMISSARY_PATH).toBe("/dashboard/enterprise/commissary");
  });

  const productionTasks = [
    {
      id: "t1",
      title: "Sauce batch",
      planDateIso: "2026-06-03",
      status: "IN_PROGRESS",
      batchSize: 40,
    },
    {
      id: "t2",
      title: "Protein prep",
      planDateIso: "2026-06-04",
      status: "SCHEDULED",
      batchSize: 20,
    },
  ];

  it("builds production pillar with watch status for busy week", () => {
    const pillar = buildProductionPillar(productionTasks);
    expect(pillar.pillar).toBe("production");
    expect(pillar.metrics[0]?.value).toBe(2);
    expect(pillar.status).toBe("healthy");
  });

  it("flags overdue purchasing as critical", () => {
    const pillar = buildPurchasingPillar({
      openPurchaseOrders: 4,
      draftPurchaseOrders: 1,
      overduePurchaseOrders: 2,
      reorderQueueOpen: 3,
    });
    expect(pillar.status).toBe("critical");
  });

  it("builds delivery pillar from route KPIs", () => {
    const pillar = buildDeliveryPillar({
      deliveryOrdersToday: 12,
      routesPlanned: 3,
      stopsReady: 8,
      stopsNotPacked: 5,
      outForDelivery: 2,
      completedStops: 4,
      failedStops: 1,
      routesNeedingAttention: 1,
    });
    expect(pillar.status).toBe("critical");
    expect(pillar.href).toBe("/dashboard/routes");
  });

  it("assembles dashboard with four pillars", () => {
    const dashboard = buildEnterpriseCommissaryDashboard({
      workspaceId: "ws-1",
      weekStartIso: "2026-06-02",
      locationCount: 3,
      productionTasksThisWeek: productionTasks,
      pendingTransfers: 2,
      recentTransfers: [{ id: "x1", status: "PENDING", lineCount: 3, createdAtIso: "2026-06-01T10:00:00.000Z" }],
      openPurchaseOrders: 5,
      draftPurchaseOrders: 1,
      overduePurchaseOrders: 0,
      reorderQueueOpen: 2,
      routeKpis: {
        deliveryOrdersToday: 6,
        routesPlanned: 2,
        stopsReady: 4,
        stopsNotPacked: 1,
        outForDelivery: 1,
        completedStops: 2,
        failedStops: 0,
        routesNeedingAttention: 0,
      },
    });
    expect(dashboard.policyId).toBe(ENTERPRISE_COMMISSARY_POLICY_ID);
    expect(dashboard.pillars).toHaveLength(4);
    expect(dashboard.pillars.map((row) => row.pillar)).toEqual([
      "production",
      "purchasing",
      "delivery",
      "distribution",
    ]);
    expect(buildDistributionPillar({ pendingTransfers: 2, recentTransfers: [], locationCount: 3 }).status).toBe(
      "healthy",
    );
    expect(dashboard.basePath).toBe(ENTERPRISE_COMMISSARY_PATH);
  });
});
