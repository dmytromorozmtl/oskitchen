import { describe, expect, it } from "vitest";

import {
  KDS_BUMP_NEXT_ERA18_POLICY_ID,
  KDS_BUMP_NEXT_ERA18_PROOF_STATUS,
} from "@/lib/kitchen/kds-bump-next-era18-policy";
import {
  isKdsBumpNextUrgent,
  kdsBumpNextLabel,
  pickKdsBumpNextTicket,
  shouldShowKdsBumpNextHero,
} from "@/lib/kitchen/kds-bump-next-era18";

const tickets = [
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
    status: "PREPARING",
    elapsedSeconds: 960,
    createdAt: "2026-05-28T10:00:00.000Z",
    customerName: "Alex",
    tableName: "12",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-222222222222",
    status: "PREPARING",
    elapsedSeconds: 120,
    createdAt: "2026-05-28T10:14:00.000Z",
    customerName: "Sam",
    tableName: null,
  },
] as const;

describe("kds bump next era18", () => {
  it("locks era18 kds bump next policy id", () => {
    expect(KDS_BUMP_NEXT_ERA18_POLICY_ID).toBe("era18-kds-bump-next-v1");
    expect(KDS_BUMP_NEXT_ERA18_PROOF_STATUS).toBe("kds_bump_next_wired");
  });

  it("picks oldest prep ticket for bump next", () => {
    expect(pickKdsBumpNextTicket(tickets)?.id).toBe(tickets[0].id);
  });

  it("shows bump next hero when bump permission and prep queue exist", () => {
    expect(shouldShowKdsBumpNextHero({ canBump: true, preparingCount: 2 })).toBe(true);
    expect(shouldShowKdsBumpNextHero({ canBump: false, preparingCount: 2 })).toBe(false);
    expect(shouldShowKdsBumpNextHero({ canBump: true, preparingCount: 0 })).toBe(false);
  });

  it("formats bump next label with ticket number and customer", () => {
    expect(kdsBumpNextLabel(tickets[0])).toBe("#111111 · Alex");
  });

  it("flags overdue bump next tickets as urgent", () => {
    expect(isKdsBumpNextUrgent(tickets[0])).toBe(true);
    expect(isKdsBumpNextUrgent(tickets[1])).toBe(false);
  });
});
