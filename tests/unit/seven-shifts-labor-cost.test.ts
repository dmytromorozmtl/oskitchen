import { describe, expect, it, vi } from "vitest";

const fetchSevenShiftsLaborReport = vi.hoisted(() => vi.fn());
const getSevenShiftsCredentialsForUser = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  staffShift: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  integrationConnection: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock("@/services/integrations/seven-shifts/seven-shifts-api", () => ({
  fetchSevenShiftsLaborReport,
}));
vi.mock("@/services/integrations/seven-shifts/seven-shifts-credentials", () => ({
  getSevenShiftsCredentialsForUser,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { syncSevenShiftsLaborCost } from "@/services/integrations/seven-shifts/labor-cost.service";

describe("seven-shifts labor cost sync", () => {
  it("updates shift labor costs from 7shifts report", async () => {
    getSevenShiftsCredentialsForUser.mockResolvedValue({
      accessToken: "token",
      companyId: "co-1",
      settings: {},
    });
    fetchSevenShiftsLaborReport.mockResolvedValue({
      ok: true,
      totalLaborCost: 420.5,
      shiftCosts: [{ shiftId: 99, cost: 85 }],
    });
    prismaMock.staffShift.findFirst.mockResolvedValue({ id: "shift-1" });
    prismaMock.staffShift.update.mockResolvedValue({});
    prismaMock.integrationConnection.findFirst.mockResolvedValue({ id: "conn-1" });
    prismaMock.integrationConnection.update.mockResolvedValue({});

    const result = await syncSevenShiftsLaborCost("owner-1");
    expect(result.ok).toBe(true);
    expect(result.totalLaborCost).toBe(420.5);
    expect(result.shiftsUpdated).toBe(1);
    expect(prismaMock.staffShift.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "shift-1" },
        data: { laborCost: 85 },
      }),
    );
  });

  it("requires 7shifts connection", async () => {
    getSevenShiftsCredentialsForUser.mockResolvedValue(null);
    const result = await syncSevenShiftsLaborCost("owner-1");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not connected");
  });
});
