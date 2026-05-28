import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const canUseFullSupportInbox = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const supportTicketFindUnique = vi.hoisted(() => vi.fn());
const supportTicketUpdate = vi.hoisted(() => vi.fn());
const supportTicketEventCreate = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/lib/support/support-permissions", () => ({
  canUseFullSupportInbox,
  canViewSupportTicket: vi.fn(),
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/support/escalation-service", () => ({
  evaluateEscalationSignals: vi.fn().mockReturnValue([]),
  escalateSupportTicketNotify: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supportTicket: {
      findUnique: supportTicketFindUnique,
      update: supportTicketUpdate,
    },
    supportTicketEvent: {
      create: supportTicketEventCreate,
    },
  },
}));

import {
  assignSupportTicket,
  escalateSupportTicketAction,
  updateSupportTicketStatus,
} from "@/actions/support-tickets";

const TICKET_ID = "11111111-1111-4111-8111-111111111111";

const workspaceActor = {
  sessionUser: { id: "staff-1", email: "cook@example.com" },
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
  platformBypass: false,
};

const ticketRow = {
  id: TICKET_ID,
  status: "NEW" as const,
  assignedToId: "staff-1",
  firstResponseAt: null,
  resolvedAt: null,
  closedAt: null,
  resolutionSummary: null,
};

describe("support ticket mutation RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireWorkspacePermissionActor.mockResolvedValue(workspaceActor);
    supportTicketFindUnique.mockResolvedValue(ticketRow);
    supportTicketUpdate.mockResolvedValue(ticketRow);
    supportTicketEventCreate.mockResolvedValue({});
  });

  it("denies assign without support triage and audits", async () => {
    canUseFullSupportInbox.mockResolvedValue(false);

    const result = await assignSupportTicket(TICKET_ID, null);

    expect(result).toEqual({ error: "Only support staff can perform this action." });
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "support_triage.permission_denied",
        metadata: expect.objectContaining({ operation: "support.assign" }),
      }),
    );
    expect(supportTicketUpdate).not.toHaveBeenCalled();
  });

  it("allows assign when support triage is granted", async () => {
    canUseFullSupportInbox.mockResolvedValue(true);

    const result = await assignSupportTicket(TICKET_ID, "agent-2");

    expect(result).toEqual({ ok: true });
    expect(supportTicketUpdate).toHaveBeenCalled();
  });

  it("denies status update without triage or assignee and audits", async () => {
    canUseFullSupportInbox.mockResolvedValue(false);
    supportTicketFindUnique.mockResolvedValue({
      ...ticketRow,
      assignedToId: "other-agent",
    });

    const result = await updateSupportTicketStatus(TICKET_ID, "TRIAGED");

    expect(result).toEqual({
      error: "Only support staff or the assigned owner can change status.",
    });
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "support_ticket.permission_denied",
        entityId: TICKET_ID,
      }),
    );
    expect(supportTicketUpdate).not.toHaveBeenCalled();
  });

  it("allows status update for assignee without full triage", async () => {
    canUseFullSupportInbox.mockResolvedValue(false);

    const result = await updateSupportTicketStatus(TICKET_ID, "IN_PROGRESS");

    expect(result).toEqual({ ok: true });
    expect(supportTicketUpdate).toHaveBeenCalled();
  });

  it("denies escalate without support triage", async () => {
    canUseFullSupportInbox.mockResolvedValue(false);

    const result = await escalateSupportTicketAction(TICKET_ID);

    expect(result).toEqual({ error: "Only support staff can perform this action." });
    expect(supportTicketUpdate).not.toHaveBeenCalled();
  });
});
