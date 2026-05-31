import { describe, expect, it } from "vitest";

import {
  mapReaderStatus,
  nextReconnectDelayMs,
} from "@/lib/payments/stripe-terminal-client";

describe("stripe-terminal-client", () => {
  it("mapReaderStatus returns processing when payment in flight", () => {
    expect(mapReaderStatus({ connected: true, processing: true, readerStatus: "online" })).toBe(
      "processing",
    );
  });

  it("mapReaderStatus returns disconnected when no reader connected", () => {
    expect(mapReaderStatus({ connected: false, processing: false, readerStatus: null })).toBe(
      "disconnected",
    );
  });

  it("mapReaderStatus maps Stripe reader status strings", () => {
    expect(mapReaderStatus({ connected: true, processing: false, readerStatus: "offline" })).toBe(
      "offline",
    );
    expect(mapReaderStatus({ connected: true, processing: false, readerStatus: "busy" })).toBe(
      "busy",
    );
    expect(mapReaderStatus({ connected: true, processing: false, readerStatus: "online" })).toBe(
      "online",
    );
  });

  it("nextReconnectDelayMs uses exponential backoff capped at 15s", () => {
    expect(nextReconnectDelayMs(0)).toBe(1_000);
    expect(nextReconnectDelayMs(1)).toBe(2_000);
    expect(nextReconnectDelayMs(4)).toBe(15_000);
    expect(nextReconnectDelayMs(10)).toBe(15_000);
  });
});
