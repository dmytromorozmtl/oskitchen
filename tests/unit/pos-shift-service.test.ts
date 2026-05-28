import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSShift: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    pOSRegister: {
      findFirst: vi.fn(),
    },
    pOSTransaction: {
      findMany: vi.fn(),
    },
    pOSAuditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/scope/ensure-owner-workspace", () => ({
  ensureOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(),
  posRegisterByIdWhereForOwner: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { ownerScopedAnd, posRegisterByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { closePosShift, getShiftCloseoutVariance, listOpenShiftCloseoutPreviews, listRecentClosedShiftSummaries, openPosShift } from "@/services/pos/pos-shift-service";

describe("pos-shift-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ensureOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(ownerScopedAnd).mockImplementation(async (_userId, extra) => ({ AND: [{ workspaceId: "ws-1" }, extra] }) as never);
    vi.mocked(posRegisterByIdWhereForOwner).mockResolvedValue({
      AND: [{ workspaceId: "ws-1" }, { id: "reg-1" }],
    } as never);
  });

  it("blocks opening a second shift on the same register", async () => {
    vi.mocked(prisma.pOSShift.findFirst).mockResolvedValue({
      id: "shift-open-1",
      registerId: "reg-1",
      status: "OPEN",
    } as never);

    const result = await openPosShift({
      userId: "owner-1",
      registerId: "reg-1",
      openedByStaffId: "staff-1",
      openingCashAmount: 50,
    });

    expect(result).toEqual({
      ok: false,
      error: "A shift is already open for this register.",
    });
    expect(ownerScopedAnd).toHaveBeenCalledWith("owner-1", {
      registerId: "reg-1",
      status: "OPEN",
    });
    expect(posRegisterByIdWhereForOwner).not.toHaveBeenCalled();
    expect(prisma.pOSShift.create).not.toHaveBeenCalled();
    expect(prisma.pOSAuditEvent.create).not.toHaveBeenCalled();
  });

  it("creates an owner-scoped shift and audit row for a register", async () => {
    vi.mocked(prisma.pOSShift.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pOSRegister.findFirst).mockResolvedValue({
      id: "reg-1",
      workspaceId: null,
      locationId: "loc-1",
    } as never);
    vi.mocked(prisma.pOSShift.create).mockResolvedValue({
      id: "shift-1",
      registerId: "reg-1",
    } as never);

    const result = await openPosShift({
      userId: "owner-1",
      registerId: "reg-1",
      openedByStaffId: "staff-1",
      openingCashAmount: 50,
      notes: "Drawer counted",
    });

    expect(result).toEqual({
      ok: true,
      shift: { id: "shift-1", registerId: "reg-1" },
    });
    expect(posRegisterByIdWhereForOwner).toHaveBeenCalledWith("owner-1", "reg-1");
    expect(prisma.pOSRegister.findFirst).toHaveBeenCalledWith({
      where: { AND: [{ workspaceId: "ws-1" }, { id: "reg-1" }] },
      select: { id: true, workspaceId: true, locationId: true },
    });
    const createArgs = vi.mocked(prisma.pOSShift.create).mock.calls[0]?.[0];
    expect(createArgs?.data.userId).toBe("owner-1");
    expect(createArgs?.data.workspaceId).toBe("ws-1");
    expect(createArgs?.data.locationId).toBe("loc-1");
    expect(createArgs?.data.registerId).toBe("reg-1");
    expect(createArgs?.data.openedByStaffId).toBe("staff-1");
    expect((createArgs?.data.openingCashAmount as Prisma.Decimal).toString()).toBe("50");
    expect(createArgs?.data.notes).toBe("Drawer counted");
    expect(prisma.pOSAuditEvent.create).toHaveBeenCalledWith({
      data: {
        userId: "owner-1",
        workspaceId: "ws-1",
        registerId: "reg-1",
        shiftId: "shift-1",
        staffId: "staff-1",
        action: "pos.shift.opened",
        metadataJson: { openingCashAmount: 50 },
      },
    });
  });

  it("returns a not-found error when closing a non-open shift", async () => {
    vi.mocked(prisma.pOSShift.findFirst).mockResolvedValue(null);

    const result = await closePosShift({
      userId: "owner-1",
      shiftId: "shift-1",
      closedByStaffId: "staff-1",
      closingCashAmount: 75,
    });

    expect(result).toEqual({
      ok: false,
      error: "Open shift not found.",
    });
    expect(ownerScopedAnd).toHaveBeenCalledWith("owner-1", {
      id: "shift-1",
      status: "OPEN",
    });
    expect(prisma.pOSTransaction.findMany).not.toHaveBeenCalled();
    expect(prisma.pOSShift.update).not.toHaveBeenCalled();
    expect(prisma.pOSAuditEvent.create).not.toHaveBeenCalled();
  });

  it("closes a shift with expected cash and variance computed from scoped cash sales", async () => {
    vi.mocked(prisma.pOSShift.findFirst).mockResolvedValue({
      id: "shift-1",
      registerId: "reg-1",
      workspaceId: null,
      openingCashAmount: new Prisma.Decimal(50),
      notes: "Opened at 9am",
      register: { id: "reg-1" },
    } as never);
    vi.mocked(prisma.pOSTransaction.findMany).mockResolvedValue([
      { total: new Prisma.Decimal(20) },
      { total: new Prisma.Decimal(10) },
    ] as never);
    vi.mocked(prisma.pOSShift.update).mockResolvedValue({
      id: "shift-1",
      registerId: "reg-1",
      closedByStaffId: "staff-9",
      closingCashAmount: new Prisma.Decimal(75),
      expectedCashAmount: new Prisma.Decimal(80),
      varianceAmount: new Prisma.Decimal(-5),
    } as never);

    const result = await closePosShift({
      userId: "owner-1",
      shiftId: "shift-1",
      closedByStaffId: "staff-9",
      closingCashAmount: 75,
    });

    expect(result).toEqual({
      ok: true,
      shift: {
        id: "shift-1",
        registerId: "reg-1",
        closedByStaffId: "staff-9",
        closingCashAmount: new Prisma.Decimal(75),
        expectedCashAmount: new Prisma.Decimal(80),
        varianceAmount: new Prisma.Decimal(-5),
      },
    });
    expect(ownerScopedAnd).toHaveBeenNthCalledWith(1, "owner-1", {
      id: "shift-1",
      status: "OPEN",
    });
    expect(ownerScopedAnd).toHaveBeenNthCalledWith(2, "owner-1", {
      registerId: "reg-1",
      shiftId: "shift-1",
      paymentMode: "CASH",
      status: "COMPLETED",
    });
    expect(prisma.pOSTransaction.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { workspaceId: "ws-1" },
          {
            registerId: "reg-1",
            shiftId: "shift-1",
            paymentMode: "CASH",
            status: "COMPLETED",
          },
        ],
      },
      select: { total: true },
    });

    const updateArgs = vi.mocked(prisma.pOSShift.update).mock.calls[0]?.[0];
    expect(updateArgs?.where).toEqual({ id: "shift-1" });
    expect(updateArgs?.data.status).toBe("CLOSED");
    expect(updateArgs?.data.closedAt).toBeInstanceOf(Date);
    expect(updateArgs?.data.closedByStaffId).toBe("staff-9");
    expect((updateArgs?.data.closingCashAmount as Prisma.Decimal).toString()).toBe("75");
    expect((updateArgs?.data.expectedCashAmount as Prisma.Decimal).toString()).toBe("80");
    expect((updateArgs?.data.varianceAmount as Prisma.Decimal).toString()).toBe("-5");
    expect(updateArgs?.data.notes).toBe("Opened at 9am");

    expect(prisma.pOSAuditEvent.create).toHaveBeenCalledWith({
      data: {
        userId: "owner-1",
        workspaceId: "ws-1",
        registerId: "reg-1",
        shiftId: "shift-1",
        staffId: "staff-9",
        action: "pos.shift.closed",
        metadataJson: {
          closingCashAmount: 75,
          expectedCashAmount: "80",
          varianceAmount: "-5",
        },
      },
    });
  });

  it("lists open shift closeout previews without closing shifts", async () => {
    vi.mocked(prisma.pOSShift.findMany).mockResolvedValue([
      {
        id: "shift-1",
        registerId: "reg-1",
        openingCashAmount: new Prisma.Decimal(50),
        openedAt: new Date("2026-05-28T09:00:00.000Z"),
        register: { name: "Front counter" },
      },
    ] as never);
    vi.mocked(prisma.pOSTransaction.findMany).mockResolvedValue([
      { total: new Prisma.Decimal(20) },
      { total: new Prisma.Decimal(10) },
    ] as never);

    const previews = await listOpenShiftCloseoutPreviews("owner-1");

    expect(previews).toEqual([
      {
        shiftId: "shift-1",
        registerName: "Front counter",
        openedAtIso: "2026-05-28T09:00:00.000Z",
        openingCash: 50,
        cashSalesTotal: 30,
        expectedCash: 80,
        cashTransactionCount: 2,
      },
    ]);
    expect(prisma.pOSShift.update).not.toHaveBeenCalled();
  });

  it("computes closeout variance for server-side ack validation", async () => {
    vi.mocked(prisma.pOSShift.findFirst).mockResolvedValue({
      id: "shift-1",
      registerId: "reg-1",
      openingCashAmount: new Prisma.Decimal(50),
    } as never);
    vi.mocked(prisma.pOSTransaction.findMany).mockResolvedValue([
      { total: new Prisma.Decimal(20) },
      { total: new Prisma.Decimal(10) },
    ] as never);

    const result = await getShiftCloseoutVariance("owner-1", "shift-1", 75);

    expect(result).toEqual({
      ok: true,
      variance: -5,
      expectedCash: 80,
      cashSalesTotal: 30,
    });
  });

  it("lists recent closed shift summaries for history panel", async () => {
    vi.mocked(prisma.pOSShift.findMany).mockResolvedValue([
      {
        id: "shift-closed-1",
        openedAt: new Date("2026-05-28T08:00:00.000Z"),
        closedAt: new Date("2026-05-28T16:00:00.000Z"),
        openingCashAmount: new Prisma.Decimal(50),
        closingCashAmount: new Prisma.Decimal(75),
        expectedCashAmount: new Prisma.Decimal(80),
        varianceAmount: new Prisma.Decimal(-5),
        notes: "Short after payout",
        register: { name: "Front counter" },
        closedByStaff: { name: "Alex Manager" },
      },
    ] as never);

    const rows = await listRecentClosedShiftSummaries("owner-1", 10);

    expect(rows).toEqual([
      {
        shiftId: "shift-closed-1",
        registerName: "Front counter",
        openedAtIso: "2026-05-28T08:00:00.000Z",
        closedAtIso: "2026-05-28T16:00:00.000Z",
        openingCash: 50,
        closingCash: 75,
        expectedCash: 80,
        variance: -5,
        notes: "Short after payout",
        closedByName: "Alex Manager",
      },
    ]);
    expect(ownerScopedAnd).toHaveBeenCalledWith("owner-1", { status: "CLOSED" });
  });

  it("filters closed shift summaries by closedAt range", async () => {
    vi.mocked(prisma.pOSShift.findMany).mockResolvedValue([] as never);

    const closedAfter = new Date("2026-05-21T00:00:00.000Z");
    const closedBefore = new Date("2026-05-28T15:30:00.000Z");
    await listRecentClosedShiftSummaries("owner-1", 50, { closedAfter, closedBefore });

    expect(ownerScopedAnd).toHaveBeenCalledWith("owner-1", {
      status: "CLOSED",
      closedAt: { gte: closedAfter, lte: closedBefore },
    });
  });
});
