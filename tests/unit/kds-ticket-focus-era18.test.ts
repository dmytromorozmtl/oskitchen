import { describe, expect, it } from "vitest";

import {
  KDS_TICKET_FOCUS_ERA18_POLICY_ID,
  KDS_TICKET_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/kitchen/kds-ticket-focus-era18-policy";
import {
  buildKdsTicketFocusSnapshot,
  kdsTicketAnchor,
  pickKdsTicketAttentionItems,
  resolveKdsTicketRowNextAction,
  shouldShowKdsTicketAttentionStrip,
  summarizeKdsTicketFocus,
} from "@/lib/kitchen/kds-ticket-focus-era18";
import { partitionKdsQueue } from "@/lib/kitchen/kds-queue-clarity-era18";

const orders = [
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-111111111111",
    status: "PREPARING",
    elapsedSeconds: 960,
    createdAt: "2026-05-28T10:00:00.000Z",
    customerName: "Alex",
    hasAllergenConflict: true,
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-222222222222",
    status: "PREPARING",
    elapsedSeconds: 120,
    createdAt: "2026-05-28T10:14:00.000Z",
    customerName: "Sam",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-333333333333",
    status: "READY",
    elapsedSeconds: 960,
    createdAt: "2026-05-28T09:45:00.000Z",
    customerName: "Jordan",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-444444444444",
    status: "READY",
    elapsedSeconds: 600,
    createdAt: "2026-05-28T10:05:00.000Z",
    customerName: "Riley",
  },
  {
    id: "aaaaaaaa-bbbb-cccc-dddd-555555555555",
    status: "READY",
    elapsedSeconds: 300,
    createdAt: "2026-05-28T10:10:00.000Z",
    customerName: "Casey",
  },
] as const;

describe("kds ticket focus era18", () => {
  it("locks era18 kds ticket focus policy id", () => {
    expect(KDS_TICKET_FOCUS_ERA18_POLICY_ID).toBe("era18-kds-ticket-focus-v1");
    expect(KDS_TICKET_FOCUS_ERA18_PROOF_STATUS).toBe("kds_ticket_focus_attention_wired");
  });

  it("builds focus snapshot for overdue prep, allergens, and expo backlog", () => {
    expect(buildKdsTicketFocusSnapshot(orders)).toEqual({
      overduePrepCount: 1,
      allergenPrepCount: 1,
      readyBacklogCount: 3,
      overdueReadyCount: 1,
    });
  });

  it("prioritizes overdue prep and allergen attention items", () => {
    const { preparing, ready } = partitionKdsQueue(orders);
    const focus = buildKdsTicketFocusSnapshot(orders);
    const items = pickKdsTicketAttentionItems(preparing, ready, focus);

    expect(items[0]?.id).toBe("overdue-prep");
    expect(items.some((item) => item.id === "allergen-prep")).toBe(true);
    expect(items[0]?.href).toBe(kdsTicketAnchor(orders[0].id));
  });

  it("summarizes urgent ticket focus signals", () => {
    const focus = buildKdsTicketFocusSnapshot(orders);
    expect(summarizeKdsTicketFocus(focus)).toEqual({
      totalSignals: 4,
      hasUrgent: true,
    });
  });

  it("shows attention strip when signals exist", () => {
    const focus = buildKdsTicketFocusSnapshot(orders);
    expect(
      shouldShowKdsTicketAttentionStrip(focus, {
        total: 5,
        preparing: 2,
        ready: 3,
        overdue: 2,
        oldestPrepSeconds: 960,
      }),
    ).toBe(true);
  });

  it("resolves row next actions for prep and expo tickets", () => {
    expect(
      resolveKdsTicketRowNextAction(orders[0], { canBump: true, canRecall: false }),
    ).toEqual({ label: "Bump after allergy check", kind: "bump", tone: "urgent" });

    expect(
      resolveKdsTicketRowNextAction(orders[2], { canBump: false, canRecall: true }),
    ).toEqual({ label: "Recall — waiting too long", kind: "recall", tone: "urgent" });

    expect(
      resolveKdsTicketRowNextAction(orders[1], { canBump: true, canRecall: false }),
    ).toEqual({ label: "Mark ready", kind: "bump", tone: "normal" });
  });
});
