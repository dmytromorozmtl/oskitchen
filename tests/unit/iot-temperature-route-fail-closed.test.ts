import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIngestBearerSecret = vi.hoisted(() => vi.fn());
const enforceIngestRateLimit = vi.hoisted(() => vi.fn());
const ingestIotTemperatureReading = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/public-post-guard", () => ({
  requireIngestBearerSecret,
  enforceIngestRateLimit,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    iotSensorDevice: { findFirst: vi.fn() },
  },
}));

vi.mock("@/services/food-safety/iot-temperature-service", () => ({
  ingestIotTemperatureReading,
}));

import { POST } from "@/app/api/iot/temperature/route";

describe("IoT temperature route fail-closed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enforceIngestRateLimit.mockResolvedValue(null);
  });

  it("returns guard response when ingest secret is missing", async () => {
    requireIngestBearerSecret.mockReturnValue(
      new Response(JSON.stringify({ error: "IoT ingest not configured" }), { status: 503 }),
    );

    const response = await POST(
      new Request("http://localhost/api/iot/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "sensor-1",
          temperature: 38,
          timestamp: "2026-05-27T12:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(503);
    expect(ingestIotTemperatureReading).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload after auth passes", async () => {
    requireIngestBearerSecret.mockReturnValue(null);

    const response = await POST(
      new Request("http://localhost/api/iot/temperature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(ingestIotTemperatureReading).not.toHaveBeenCalled();
  });
});
