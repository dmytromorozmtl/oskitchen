import { describe, expect, it } from "vitest";

import {
  buildWaitlistQueueSummary,
  DEFAULT_WAITLIST_CONFIG,
  estimateWaitMinutesForPosition,
  formatReservationConfirmationSms,
  formatWaitlistJoinedSms,
  formatWaitlistReadySms,
  parseWaitlistConfig,
} from "@/services/storefront/waitlist-service";

describe("waitlist service", () => {
  const config = DEFAULT_WAITLIST_CONFIG;
  const now = new Date("2026-05-31T18:00:00.000Z");

  it("parses waitlist settings overrides", () => {
    const parsed = parseWaitlistConfig({
      waitlist: { baseMinutes: 10, minutesPerPartyAhead: 12 },
    });
    expect(parsed.baseMinutes).toBe(10);
    expect(parsed.minutesPerPartyAhead).toBe(12);
  });

  it("increases estimate for parties ahead in queue", () => {
    const queue = [
      { id: "a", partySize: 4, createdAt: now, status: "WAITING" },
      { id: "b", partySize: 2, createdAt: now, status: "WAITING" },
    ];
    const first = estimateWaitMinutesForPosition(0, queue, config);
    const second = estimateWaitMinutesForPosition(1, queue, config);
    expect(second).toBeGreaterThan(first);
  });

  it("builds queue positions for waiting guests only", () => {
    const summary = buildWaitlistQueueSummary(
      [
        { id: "a", partySize: 2, createdAt: now, status: "WAITING" },
        { id: "b", partySize: 3, createdAt: now, status: "NOTIFIED" },
        { id: "c", partySize: 2, createdAt: now, status: "WAITING" },
      ],
      config,
    );
    expect(summary).toHaveLength(2);
    expect(summary[0]?.id).toBe("a");
    expect(summary[0]?.position).toBe(1);
    expect(summary[1]?.position).toBe(2);
  });

  it("formats SMS copy", () => {
    expect(formatWaitlistJoinedSms({ storeName: "Demo", position: 2, estimatedMinutes: 18 })).toContain("#2");
    expect(formatWaitlistReadySms({ storeName: "Demo", graceMinutes: 10 })).toContain("ready");
    expect(
      formatReservationConfirmationSms({
        storeName: "Demo",
        reservationDate: "Jun 15, 7:00 PM",
        partySize: 4,
        confirmationCode: "ABC123",
      }),
    ).toContain("confirmed");
  });
});
