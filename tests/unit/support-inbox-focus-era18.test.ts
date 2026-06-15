import { describe, expect, it } from "vitest";

import {
  SUPPORT_INBOX_FOCUS_ERA18_BACKLOG_ID,
  SUPPORT_INBOX_FOCUS_ERA18_POLICY_ID,
  SUPPORT_INBOX_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/support/support-inbox-focus-era18-policy";
import {
  buildSupportInboxFocusSnapshot,
  pickSupportInboxAttentionItems,
  resolveSupportTicketRowNextAction,
  summarizeSupportInboxFocus,
} from "@/lib/support/support-inbox-focus-era18";
import type { SupportCenterSnapshot } from "@/services/support/support-service";

function snapshot(over: Partial<SupportCenterSnapshot["kpis"]> = {}): SupportCenterSnapshot {
  return {
    canTriage: true,
    kpis: {
      openTickets: 0,
      awaitingResponse: 0,
      assignedToMe: 0,
      overdueSla: 0,
      criticalIssues: 0,
      integrationIssues: 0,
      billingTickets: 0,
      resolvedThisWeek: 0,
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

describe("support-inbox-focus-era18 policy", () => {
  it("registers era18 support inbox focus proof", () => {
    expect(SUPPORT_INBOX_FOCUS_ERA18_POLICY_ID).toBe("era18-support-inbox-focus-v1");
    expect(SUPPORT_INBOX_FOCUS_ERA18_PROOF_STATUS).toBe("support_inbox_focus_attention_wired");
    expect(SUPPORT_INBOX_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-025");
  });
});

describe("pickSupportInboxAttentionItems", () => {
  it("prioritizes overdue SLA and critical tickets", () => {
    const focus = buildSupportInboxFocusSnapshot(
      snapshot({ overdueSla: 2, criticalIssues: 1, integrationIssues: 4 }),
      [],
    );

    const items = pickSupportInboxAttentionItems(focus);
    expect(items[0]?.id).toBe("overdue-sla");
    expect(items.some((item) => item.id === "critical-issues")).toBe(true);
    expect(items.some((item) => item.id === "integration-issues")).toBe(true);
  });

  it("surfaces unassigned urgent tickets for triage users", () => {
    const focus = buildSupportInboxFocusSnapshot(snapshot(), [
      ticket({ priority: "CRITICAL", assignedToId: null }),
      ticket({ id: "2", priority: "HIGH", assignedToId: null }),
    ]);

    const items = pickSupportInboxAttentionItems(focus);
    expect(items.some((item) => item.id === "unassigned-urgent")).toBe(true);
  });

  it("returns empty when queue is clear", () => {
    const focus = buildSupportInboxFocusSnapshot(snapshot(), []);
    expect(pickSupportInboxAttentionItems(focus)).toEqual([]);
  });
});

describe("resolveSupportTicketRowNextAction", () => {
  it("routes overdue SLA tickets to urgent respond action", () => {
    const action = resolveSupportTicketRowNextAction(
      ticket({ slaDueAt: "2020-01-01T00:00:00.000Z" }),
      Date.parse("2026-05-28T12:00:00.000Z"),
    );
    expect(action?.label).toBe("Respond — SLA overdue");
    expect(action?.tone).toBe("urgent");
  });

  it("prompts integration review for integration category", () => {
    const action = resolveSupportTicketRowNextAction(
      ticket({ category: "INTEGRATION", priority: "NORMAL" }),
    );
    expect(action?.label).toBe("Review integration issue");
  });

  it("returns null for closed tickets", () => {
    expect(resolveSupportTicketRowNextAction(ticket({ status: "CLOSED" }))).toBeNull();
  });
});

describe("summarizeSupportInboxFocus", () => {
  it("flags urgent when SLA or integration tickets exist", () => {
    const focus = buildSupportInboxFocusSnapshot(snapshot({ integrationIssues: 1 }), []);
    expect(summarizeSupportInboxFocus(focus).hasUrgent).toBe(true);
  });
});
