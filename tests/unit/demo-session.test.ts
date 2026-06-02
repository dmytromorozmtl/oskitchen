import { describe, expect, it } from "vitest";

import {
  DEMO_SESSION_HOURS,
  demoSessionExpiresAt,
  formatDemoTimeRemaining,
  isDemoSessionExpired,
  isGuestDemoEmail,
} from "@/lib/demo/demo-session";

describe("demo session helpers", () => {
  it("expires after configured hours", () => {
    const start = new Date("2026-06-02T12:00:00Z");
    const expires = demoSessionExpiresAt(start);
    expect(expires.getTime() - start.getTime()).toBe(DEMO_SESSION_HOURS * 60 * 60 * 1000);
  });

  it("detects guest demo emails", () => {
    expect(isGuestDemoEmail("guest-abc@demo.os-kitchen.app")).toBe(true);
    expect(isGuestDemoEmail("chef@kitchen.com")).toBe(false);
  });

  it("formats remaining time", () => {
    const now = new Date("2026-06-02T12:00:00Z");
    const expires = new Date("2026-06-02T13:30:00Z");
    expect(formatDemoTimeRemaining(expires, now)).toBe("1h 30m");
    expect(isDemoSessionExpired(expires, now)).toBe(false);
    expect(isDemoSessionExpired(expires, new Date("2026-06-02T14:00:00Z"))).toBe(true);
  });
});
