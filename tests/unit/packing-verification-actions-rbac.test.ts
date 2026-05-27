import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const startOrderVerificationSession = vi.hoisted(() => vi.fn());
const updateVerificationItem = vi.hoisted(() => vi.fn());
const supervisorOverrideSession = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    packingVerificationItem: { findFirst: vi.fn() },
  },
}));

vi.mock("@/services/packing-verification/verification-service", () => ({
  startOrderVerificationSession,
  updateVerificationItem,
  supervisorOverrideSession,
  getVerificationSessionDetail: vi.fn(),
  listOpenSessions: vi.fn(),
  listRecentScans: vi.fn(),
  searchOrdersByCustomer: vi.fn(),
  completeVerificationSession: vi.fn(),
  sendSessionBackToPacking: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import {
  startVerificationSessionAction,
  supervisorOverrideVerificationAction,
  verifyItemFullQuantityAction,
} from "@/actions/packing-verification";

const ORDER_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";
const ITEM_ID = "33333333-3333-4333-8333-333333333333";

const deniedActor = {
  sessionUserId: "staff-1",
  sessionUser: { id: "staff-1", email: "cook@example.com" },
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
  platformBypass: false,
};

const ownerActor = {
  ...deniedActor,
  sessionUserId: "owner-session-1",
  sessionUser: { id: "owner-session-1", email: "owner@example.com" },
  workspaceRole: "OWNER" as const,
};

describe("packing verification actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    startOrderVerificationSession.mockResolvedValue({ sessionId: SESSION_ID, reused: false });
    vi.mocked(prisma.packingVerificationItem.findFirst).mockResolvedValue({
      id: ITEM_ID,
      expectedQuantity: 2,
      verifiedQuantity: 0,
      allergenCheckStatus: "PENDING",
      labelCheckStatus: "PENDING",
    } as never);
  });

  it("denies startVerificationSessionAction without packing.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("orderId", ORDER_ID);

    const result = await startVerificationSessionAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("packing.manage");
    expect(startOrderVerificationSession).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "packing.verification.permission_denied",
        metadata: expect.objectContaining({
          operation: "packing.verification.session.start",
          requiredPermission: "packing.manage",
        }),
      }),
    );
  });

  it("denies verifyItemFullQuantityAction without packing.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("itemId", ITEM_ID);

    const result = await verifyItemFullQuantityAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(updateVerificationItem).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "packing.verification.item.verify_full" }),
      }),
    );
  });

  it("denies supervisor override without packing.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("sessionId", SESSION_ID);
    formData.set("reason", "Customer waiting");

    const result = await supervisorOverrideVerificationAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(supervisorOverrideSession).not.toHaveBeenCalled();
  });

  it("denies supervisor override for staff without owner/platformBypass even with packing.manage", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("sessionId", SESSION_ID);
    formData.set("reason", "Customer waiting");

    const result = await supervisorOverrideVerificationAction(formData);

    expect(result).toEqual({ error: "Supervisor or owner access required for override." });
    expect(supervisorOverrideSession).not.toHaveBeenCalled();
  });

  it("allows startVerificationSessionAction with packing.manage and tenant owner scope", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("orderId", ORDER_ID);

    const result = await startVerificationSessionAction(formData);

    expect(result).toEqual({ ok: true, sessionId: SESSION_ID, reused: false });
    expect(startOrderVerificationSession).toHaveBeenCalledWith({
      tenantUserId: "owner-1",
      actorUserId: "staff-1",
      orderId: ORDER_ID,
    });
  });

  it("allows supervisor override for owner with packing.manage", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: ownerActor });

    const formData = new FormData();
    formData.set("sessionId", SESSION_ID);
    formData.set("reason", "Customer waiting");

    const result = await supervisorOverrideVerificationAction(formData);

    expect(result).toEqual({ ok: true });
    expect(supervisorOverrideSession).toHaveBeenCalledWith({
      tenantUserId: "owner-1",
      actorUserId: "owner-session-1",
      sessionId: SESSION_ID,
      reason: "Customer waiting",
    });
  });
});
