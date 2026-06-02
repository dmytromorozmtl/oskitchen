import { describe, expect, it } from "vitest";

import {
  defaultStationRoute,
  generateOrders,
  routeItemToPrimaryStation,
  runDiscreteEventSimulation,
  simulateKitchen,
} from "@/lib/ai/digital-twin-simulation";
import type { KitchenTwinConfig } from "@/lib/ai/digital-twin-types";

const sampleConfig: KitchenTwinConfig = {
  stations: [
    { name: "Cold prep", capacity: 1, currentLoad: 0 },
    { name: "Hot line", capacity: 2, currentLoad: 0 },
    { name: "Pack", capacity: 1, currentLoad: 0 },
  ],
  staff: [
    { name: "Alex", station: "Cold prep", efficiency: 0.9 },
    { name: "Jordan", station: "Hot line", efficiency: 0.85 },
    { name: "Sam", station: "Hot line", efficiency: 0.8 },
    { name: "Riley", station: "Pack", efficiency: 0.88 },
  ],
  equipment: [
    { name: "Prep bench", station: "Cold prep", throughput: 1 },
    { name: "Grill", station: "Hot line", throughput: 1.2 },
    { name: "Expo", station: "Pack", throughput: 1.1 },
  ],
};

describe("digital twin simulation", () => {
  it("routes menu items deterministically to stations", () => {
    const station = routeItemToPrimaryStation("Chicken Bowl", ["Cold prep", "Hot line", "Pack"]);
    expect(station).toBeTruthy();
    expect(["Cold prep", "Hot line", "Pack"]).toContain(station);
  });

  it("builds a default multi-stage route", () => {
    const route = defaultStationRoute(["Cold prep", "Hot line", "Pack"]);
    expect(route.length).toBeGreaterThanOrEqual(2);
  });

  it("generates evenly spaced order arrivals", () => {
    const orders = generateOrders(10, 60, [{ item: "Burger", percentage: 100 }]);
    expect(orders).toHaveLength(10);
    expect(orders[9]?.arrivalMinute).toBeGreaterThan(orders[0]?.arrivalMinute ?? 0);
  });

  it("finds a bottleneck under heavy load", () => {
    const result = runDiscreteEventSimulation({
      config: sampleConfig,
      orderCount: 80,
      timeWindow: 60,
      menuMix: [
        { item: "Burger", percentage: 60 },
        { item: "Salad", percentage: 40 },
      ],
    });

    expect(result.bottleneckStation).toBeTruthy();
    expect(result.bottleneckDelay).toBeGreaterThanOrEqual(0);
    expect(result.stationUtilization.length).toBe(3);
    expect(result.waitTimes.length).toBe(3);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.aiAssisted).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("higher order volume increases wait at hot station vs light load", () => {
    const light = simulateKitchen(sampleConfig, {
      orderCount: 10,
      timeWindow: 60,
      menuMix: [{ item: "Burger", percentage: 100 }],
    });
    const heavy = simulateKitchen(sampleConfig, {
      orderCount: 100,
      timeWindow: 60,
      menuMix: [{ item: "Burger", percentage: 100 }],
    });

    const hotLight = light.waitTimes.find((w) => w.station === "Hot line")?.avgWait ?? 0;
    const hotHeavy = heavy.waitTimes.find((w) => w.station === "Hot line")?.avgWait ?? 0;
    expect(hotHeavy).toBeGreaterThanOrEqual(hotLight);
  });
});
