import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = {
  supplier: { findFirst: vi.fn(), create: vi.fn() },
  staffMember: { count: vi.fn() },
  posRegister: { count: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(async () => "ws-1"),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  supplierListWhereForOwner: vi.fn(async () => ({ userId: "user-1" })),
  staffMemberListWhereForOwner: vi.fn(async () => ({ userId: "user-1" })),
}));

vi.mock("@/services/staff/staff-service", () => ({
  createStaffMember: vi.fn(async () => ({ id: "staff-1" })),
}));

vi.mock("@/services/pos/pos-session-service", () => ({
  ensurePosTerminalReady: vi.fn(async () => undefined),
}));

describe("seedQuickStartDemoData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.supplier.findFirst.mockResolvedValue(null);
    prismaMock.supplier.create.mockResolvedValue({ id: "sup-1" });
    prismaMock.staffMember.count.mockResolvedValue(0);
    prismaMock.posRegister.count.mockResolvedValue(1);
  });

  it("creates demo supplier and staff when missing", async () => {
    const { seedQuickStartDemoData } = await import("@/services/onboarding/quick-start-service");
    const result = await seedQuickStartDemoData("user-1", "Sunrise Diner");

    expect(result.supplierId).toBe("sup-1");
    expect(result.staffSeeded).toBe(true);
    expect(result.registerReady).toBe(true);
    expect(prismaMock.supplier.create).toHaveBeenCalled();
  });
});
