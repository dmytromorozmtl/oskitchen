import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const listRecentClosedShiftSummaries = vi.hoisted(() => vi.fn());
const logPosPermissionDenied = vi.hoisted(() => vi.fn());
const logPosShiftEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/services/pos/pos-shift-service", () => ({ listRecentClosedShiftSummaries }));
vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied,
  logPosShiftEvent,
}));

import { GET } from "@/app/api/pos/shifts/export/route";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

const actor = {
  sessionUser: { id: "staff-user-1" },
  sessionUserId: "staff-user-1",
  userId: "owner-user-1",
  dataUserId: "owner-user-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  email: "manager@example.com",
  granted: new Set(["pos.shift.close"]),
  platformBypass: false,
};

describe("pos shifts export route RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listRecentClosedShiftSummaries.mockResolvedValue([
      {
        shiftId: "shift-1",
        registerName: "Front counter",
        openedAtIso: "2026-05-28T08:00:00.000Z",
        closedAtIso: "2026-05-28T16:00:00.000Z",
        openingCash: 50,
        closingCash: 75,
        expectedCash: 80,
        variance: -5,
        notes: "Short after payout",
        closedByName: "Alex",
      },
    ]);
  });

  it("denies export without pos.shift.close", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor,
    });

    const response = await GET(new Request("http://localhost/api/pos/shifts/export"));

    expect(response.status).toBe(403);
    expect(logPosPermissionDenied).toHaveBeenCalled();
    expect(listRecentClosedShiftSummaries).not.toHaveBeenCalled();
  });

  it("exports csv when pos.shift.close is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor });

    const response = await GET(
      new Request("http://localhost/api/pos/shifts/export?range=30d"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(listRecentClosedShiftSummaries).toHaveBeenCalledWith(
      "owner-user-1",
      50,
      expect.objectContaining({
        closedAfter: expect.any(Date),
        closedBefore: expect.any(Date),
      }),
    );
    expect(logPosShiftEvent).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        action: AUDIT_ACTIONS.POS_SHIFT_CLOSEOUT_CSV_EXPORTED,
      }),
    );
    const body = await response.text();
    expect(body).toContain("shift-1");
    expect(body).toContain("Short after payout");
  });
});
