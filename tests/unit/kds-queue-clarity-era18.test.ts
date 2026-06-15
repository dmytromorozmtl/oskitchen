import { describe, expect, it } from "vitest";

import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  isKdsTicketOverdue,
  isKdsTicketReady,
  partitionKdsQueue,
  sortKdsTicketsOldestFirst,
  summarizeKdsQueue,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { KDS_QUEUE_CLARITY_ERA18_POLICY_ID } from "@/lib/kitchen/kds-queue-clarity-era18-policy";

const sampleTickets = [
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
    status: "PREPARING",
    elapsedSeconds: 600,
    createdAt: "2026-05-28T10:00:00.000Z",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-222222222222",
    status: "PREPARING",
    elapsedSeconds: 120,
    createdAt: "2026-05-28T10:08:00.000Z",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-333333333333",
    status: "READY",
    elapsedSeconds: 900,
    createdAt: "2026-05-28T09:45:00.000Z",
  },
] as const;

describe("kds queue clarity era18", () => {
  it("locks era18 kds queue clarity policy id", () => {
    expect(KDS_QUEUE_CLARITY_ERA18_POLICY_ID).toBe("era18-kds-queue-clarity-v1");
  });

  it("summarizes queue counts", () => {
    expect(summarizeKdsQueue(sampleTickets)).toEqual({
      total: 3,
      preparing: 2,
      ready: 1,
      overdue: 1,
      oldestPrepSeconds: 600,
    });
  });

  it("partitions prep and ready with oldest-first sort", () => {
    const { preparing, ready } = partitionKdsQueue(sampleTickets);
    expect(preparing.map((ticket) => ticket.id)).toEqual([
      sampleTickets[0].id,
      sampleTickets[1].id,
    ]);
    expect(ready.map((ticket) => ticket.id)).toEqual([sampleTickets[2].id]);
  });

  it("sorts tickets oldest first", () => {
    expect(sortKdsTicketsOldestFirst(sampleTickets).map((ticket) => ticket.elapsedSeconds)).toEqual([
      900, 600, 120,
    ]);
  });

  it("formats ticket numbers from order ids", () => {
    expect(formatKdsTicketNumber("aaaaaaaa-bbbb-cccc-dddd-111111111111")).toBe("#111111");
  });

  it("formats elapsed clock", () => {
    expect(formatKdsElapsedClock(125)).toBe("2:05");
  });

  it("detects ready and overdue tickets", () => {
    expect(isKdsTicketReady("READY")).toBe(true);
    expect(isKdsTicketReady("PREPARING")).toBe(false);
    expect(isKdsTicketOverdue(899)).toBe(false);
    expect(isKdsTicketOverdue(900)).toBe(true);
  });
});
