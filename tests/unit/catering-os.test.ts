import { describe, expect, it } from "vitest";

import {
  buildCateringOsDashboard,
  buildClientsModule,
  buildEventsModule,
  buildPackingModule,
  buildRoutesModule,
} from "@/lib/catering/catering-os-builders";
import {
  CATERING_OS_PATH,
  CATERING_OS_POLICY_ID,
  CATERING_OS_SERVICE,
} from "@/lib/catering/catering-os-policy";

describe("Catering OS", () => {
  it("locks policy constants", () => {
    expect(CATERING_OS_POLICY_ID).toBe("catering-os-v1");
    expect(CATERING_OS_SERVICE).toBe("services/catering/catering-os-service.ts");
    expect(CATERING_OS_PATH).toBe("/dashboard/catering");
  });

  const events = [
    {
      quoteId: "q1",
      eventName: "Corp lunch",
      customerName: "Acme Corp",
      eventDateIso: "2026-06-10",
      guestCount: 80,
      status: "ACCEPTED",
      total: 2400,
      deliveryRequired: true,
    },
    {
      quoteId: "q2",
      eventName: "Wedding tasting",
      customerName: "Jane Doe",
      eventDateIso: "2026-06-12",
      guestCount: 12,
      status: "SENT",
      total: 600,
      deliveryRequired: false,
    },
  ];

  const clients = [
    {
      key: "acme",
      displayName: "Acme Corp",
      email: "events@acme.com",
      quoteCount: 3,
      pipelineValue: 7200,
      lastEventDateIso: "2026-06-10",
    },
  ];

  it("builds events module with upcoming count", () => {
    const mod = buildEventsModule(events, 5);
    expect(mod.module).toBe("events");
    expect(mod.metrics[0]?.value).toBe(2);
  });

  it("builds packing module when tasks pending", () => {
    const mod = buildPackingModule({
      packingTasksToday: 6,
      packingWavesToday: 2,
      packingPending: 4,
      upcomingEvents: 2,
    });
    expect(mod.status).toBe("watch");
  });

  it("flags routes critical on failed stops", () => {
    const mod = buildRoutesModule(
      {
        deliveryOrdersToday: 5,
        routesPlanned: 2,
        stopsReady: 3,
        stopsNotPacked: 1,
        outForDelivery: 1,
        completedStops: 2,
        failedStops: 2,
        routesNeedingAttention: 1,
      },
      1,
    );
    expect(mod.status).toBe("critical");
  });

  it("assembles dashboard with four modules", () => {
    const dashboard = buildCateringOsDashboard({
      workspaceId: "ws-1",
      openQuotes: 8,
      acceptedQuotes: 2,
      pipelineValue: 12400,
      followUpsDue: 1,
      upcomingEvents: events,
      topClients: clients,
      packingTasksToday: 5,
      packingWavesToday: 1,
      packingPending: 2,
      routeKpis: {
        deliveryOrdersToday: 4,
        routesPlanned: 1,
        stopsReady: 2,
        stopsNotPacked: 0,
        outForDelivery: 0,
        completedStops: 1,
        failedStops: 0,
        routesNeedingAttention: 0,
      },
      deliveryEvents: 1,
    });
    expect(dashboard.policyId).toBe(CATERING_OS_POLICY_ID);
    expect(dashboard.modules).toHaveLength(4);
    expect(buildClientsModule(clients, 3).module).toBe("clients");
    expect(dashboard.basePath).toBe(CATERING_OS_PATH);
  });
});
