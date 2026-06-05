import { beforeEach, describe, expect, it, vi } from "vitest";

const getShiftCloseoutVariance = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());

const state = vi.hoisted(() => ({
  shift: {
    id: "11111111-1111-4111-8111-111111111111",
    userId: "owner-1",
    workspaceId: "ws-1",
    registerId: "22222222-2222-4222-8222-222222222222",
    status: "OPEN",
    register: {
      id: "22222222-2222-4222-8222-222222222222",
      name: "Front counter",
      workspaceId: "ws-1",
    },
  },
  auditEvents: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/services/pos/pos-shift-service", () => ({ getShiftCloseoutVariance }));
vi.mock("@/services/audit/audit-service", () => ({ auditLog }));
vi.mock("@/lib/scope/ensure-owner-workspace", () => ({
  ensureOwnerWorkspaceId: vi.fn(async () => "ws-1"),
}));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(async () => ({ id: state.shift.id, status: "OPEN" })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSShift: {
      findFirst: vi.fn(async () => state.shift),
    },
    pOSAuditEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.auditEvents.push(data);
        return { id: "audit-1", ...data };
      }),
      findMany: vi.fn(async () => []),
    },
  },
}));

import {
  buildCashCloseReport,
  isPosCashManagementStep,
  POS_CASH_MANAGEMENT_ROUTE,
  POS_CASH_MANAGEMENT_STEPS,
} from "@/lib/pos/pos-cash-management";
import { buildPosSubnavLinks } from "@/lib/pos/pos-subnav-links";
import { recordCashDrawerCount } from "@/services/pos/pos-cash-count-service";
import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";

describe("POS cash management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.auditEvents = [];
    getShiftCloseoutVariance.mockResolvedValue({
      ok: true,
      variance: -5,
      expectedCash: 405,
      cashSalesTotal: 205,
    });
    auditLog.mockResolvedValue(undefined);
  });

  it("locks route and workflow steps", () => {
    expect(POS_CASH_MANAGEMENT_ROUTE).toBe("/dashboard/pos/cash");
    expect(POS_CASH_MANAGEMENT_STEPS).toEqual(["open", "count", "close", "report"]);
    expect(isPosCashManagementStep("count")).toBe(true);
    expect(isPosCashManagementStep("invalid")).toBe(false);
  });

  it("builds printable close report text", () => {
    const report = buildCashCloseReport({
      shiftId: "shift-1",
      registerName: "Bar",
      openedAtIso: "2026-06-05T08:00:00.000Z",
      closedAtIso: "2026-06-05T16:00:00.000Z",
      openingCash: 200,
      closingCash: 395,
      expectedCash: 400,
      variance: -5,
      notes: "Two $5 bills missing",
      closedByName: "Alex",
    });
    expect(report).toContain("OS Kitchen — Cash close report");
    expect(report).toContain("Register: Bar");
    expect(report).toContain("Variance: -$5.00");
    expect(report).toContain("Notes: Two $5 bills missing");
  });

  it("records mid-shift cash count audit events", async () => {
    const result = await recordCashDrawerCount({
      userId: "owner-1",
      performedByUserId: "actor-1",
      shiftId: state.shift.id,
      staffMemberId: "33333333-3333-4333-8333-333333333333",
      countedCashAmount: 395,
      notes: "Lunch count",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.variance).toBe(-5);
    expect(state.auditEvents).toHaveLength(1);
    expect(state.auditEvents[0]?.action).toBe("pos.cash.counted");
    expect(auditLog).toHaveBeenCalled();
  });

  it("adds cash link to POS subnav for shift operators", () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    const links = buildPosSubnavLinks(granted);
    expect(links.some((link) => link.href === "/dashboard/pos/cash")).toBe(true);
  });
});
