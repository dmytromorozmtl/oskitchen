import { describe, expect, it } from "vitest";

import {
  PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_BACKLOG_ID,
  PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_POLICY_ID,
  PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/support/platform-support-inbox-focus-era18-policy";
import {
  buildPlatformSupportInboxFocusSnapshot,
  pickPlatformSupportInboxAttentionItems,
  resolvePlatformSupportTicketRowNextAction,
  summarizePlatformSupportInboxFocus,
} from "@/lib/support/platform-support-inbox-focus-era18";
import type { PlatformSupportInboxSnapshot } from "@/services/platform/platform-support-service";

function snapshot(over: Partial<PlatformSupportInboxSnapshot["kpis"]> = {}): PlatformSupportInboxSnapshot {
  return {
    kpis: {
      openTickets: 0,
      awaitingResponse: 0,
      assignedToMe: 0,
      overdueSla: 0,
      criticalIssues: 0,
      integrationIssues: 0,
      escalatedTickets: 0,
      ...over,
    },
  };
}

function ticket(
  over: Partial<{
    id: string;
    status: string;
    priority: string;
    category: string;
    assignedToId: string | null;
    slaDueAt: string | null;
  }> = {},
) {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    status: "OPEN",
    priority: "NORMAL",
    category: "BUG",
    assignedToId: null,
    slaDueAt: null,
    ...over,
  };
}

describe("platform-support-inbox-focus-era18 policy", () => {
  it("registers era18 platform support inbox focus proof", () => {
    expect(PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-platform-support-inbox-focus-v1",
    );
    expect(PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_PROOF_STATUS).toBe(
      "platform_support_inbox_focus_attention_wired",
    );
    expect(PLATFORM_SUPPORT_INBOX_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-026");
  });
});

describe("pickPlatformSupportInboxAttentionItems", () => {
  it("prioritizes overdue SLA and escalated tickets", () => {
    const focus = buildPlatformSupportInboxFocusSnapshot(
      snapshot({ overdueSla: 2, escalatedTickets: 3, criticalIssues: 1 }),
      [],
    );

    const items = pickPlatformSupportInboxAttentionItems(focus);
    expect(items[0]?.id).toBe("overdue-sla");
    expect(items.some((item) => item.id === "escalated-tickets")).toBe(true);
    expect(items.some((item) => item.id === "critical-issues")).toBe(true);
  });

  it("uses platform routes for attention links", () => {
    const focus = buildPlatformSupportInboxFocusSnapshot(snapshot({ escalatedTickets: 1 }), []);
    const items = pickPlatformSupportInboxAttentionItems(focus);
    expect(items.find((item) => item.id === "escalated-tickets")?.href).toBe(
      "/platform/support/escalations",
    );
  });

  it("surfaces unassigned urgent tickets", () => {
    const focus = buildPlatformSupportInboxFocusSnapshot(snapshot(), [
      ticket({ priority: "CRITICAL", assignedToId: null }),
    ]);

    const items = pickPlatformSupportInboxAttentionItems(focus);
    expect(items.some((item) => item.id === "unassigned-urgent")).toBe(true);
  });

  it("returns empty when queue is clear", () => {
    const focus = buildPlatformSupportInboxFocusSnapshot(snapshot(), []);
    expect(pickPlatformSupportInboxAttentionItems(focus)).toEqual([]);
  });
});

describe("resolvePlatformSupportTicketRowNextAction", () => {
  it("routes overdue SLA tickets to urgent respond action", () => {
    const action = resolvePlatformSupportTicketRowNextAction(
      ticket({ slaDueAt: "2020-01-01T00:00:00.000Z" }),
      Date.parse("2026-05-28T12:00:00.000Z"),
    );
    expect(action?.label).toBe("Respond — SLA overdue");
    expect(action?.href).toBe("/platform/support/00000000-0000-0000-0000-000000000001");
  });

  it("prompts escalation triage for escalated status", () => {
    const action = resolvePlatformSupportTicketRowNextAction(
      ticket({ status: "ESCALATED", priority: "NORMAL" }),
    );
    expect(action?.label).toBe("Triage escalation");
  });

  it("returns null for closed tickets", () => {
    expect(resolvePlatformSupportTicketRowNextAction(ticket({ status: "CLOSED" }))).toBeNull();
  });
});

describe("summarizePlatformSupportInboxFocus", () => {
  it("flags urgent when escalated tickets exist", () => {
    const focus = buildPlatformSupportInboxFocusSnapshot(snapshot({ escalatedTickets: 1 }), []);
    expect(summarizePlatformSupportInboxFocus(focus).hasUrgent).toBe(true);
  });
});
