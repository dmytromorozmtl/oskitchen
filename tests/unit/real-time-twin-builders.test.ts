import { describe, expect, it } from "vitest";

import {
  BOTTLENECK_ALERT_THRESHOLD_MINUTES,
  buildKdsLiveState,
  buildKdsTwinPredictions,
  buildLiveSimulationParams,
  buildPosLiveSnapshot,
  computeStationLoadsFromKdsOrders,
  formatBottleneckAlertMessage,
  shouldSendBottleneckAlert,
} from "@/lib/ai/real-time-twin-builders";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";

function kdsOrder(partial: Partial<KdsDailyOrder> & Pick<KdsDailyOrder, "id">): KdsDailyOrder {
  return {
    customerName: "Guest",
    items: ["Burger"],
    status: "IN_KITCHEN",
    createdAt: new Date().toISOString(),
    priority: "normal",
    elapsedSeconds: 120,
    ...partial,
  };
}

describe("real-time twin builders", () => {
  it("distributes KDS tickets across stations by menu item hash", () => {
    const stations = ["Grill", "Fry", "Expo"];
    const orders = [
      kdsOrder({ id: "1", items: ["Burger"] }),
      kdsOrder({ id: "2", items: ["Fries", "Salad"] }),
    ];
    const loads = computeStationLoadsFromKdsOrders(orders, stations);
    expect([...loads.values()].reduce((s, n) => s + n, 0)).toBe(3);
  });

  it("builds KDS live state with queue metrics", () => {
    const state = buildKdsLiveState(
      [
        kdsOrder({ id: "1", priority: "high", elapsedSeconds: 600 }),
        kdsOrder({ id: "2", elapsedSeconds: 300 }),
      ],
      ["Grill", "Expo"],
    );
    expect(state.queueDepth).toBe(2);
    expect(state.highPriorityCount).toBe(1);
    expect(state.avgWaitMinutes).toBe(7.5);
  });

  it("projects simulation params from queue + POS rate", () => {
    const kdsState = buildKdsLiveState([kdsOrder({ id: "1" })], ["Grill"]);
    const posSnapshot = buildPosLiveSnapshot({
      ordersLastHour: 30,
      menuMix: [{ item: "Burger", percentage: 100 }],
    });
    const params = buildLiveSimulationParams({ kdsState, posSnapshot, timeWindowMinutes: 60 });
    expect(params.orderCount).toBeGreaterThanOrEqual(31);
    expect(params.timeWindow).toBe(60);
  });

  it("flags alert when bottleneck delay exceeds threshold", () => {
    expect(shouldSendBottleneckAlert(BOTTLENECK_ALERT_THRESHOLD_MINUTES)).toBe(false);
    expect(shouldSendBottleneckAlert(BOTTLENECK_ALERT_THRESHOLD_MINUTES + 0.1)).toBe(true);

    const predictions = buildKdsTwinPredictions({
      workspaceId: "ws-1",
      kdsState: buildKdsLiveState([], ["Grill"]),
      simulation: {
        bottleneckStation: "Grill",
        bottleneckDelay: 18,
        totalTime: 45,
        stationUtilization: [{ station: "Grill", utilization: 0.9 }],
        waitTimes: [{ station: "Grill", avgWait: 12, maxWait: 18 }],
        recommendations: ["Add staff at Grill"],
        aiAssisted: true,
        confidence: 0.8,
      },
    });
    expect(predictions.alertActive).toBe(true);
    expect(formatBottleneckAlertMessage({ station: "Grill", delayMinutes: 18, queueDepth: 5 })).toContain(
      "Grill",
    );
  });
});
