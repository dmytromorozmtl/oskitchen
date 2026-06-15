import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userProfile: { findUnique: vi.fn() },
    workspace: { findFirst: vi.fn() },
    order: { findMany: vi.fn().mockResolvedValue([]) },
    kitchenCustomer: { findMany: vi.fn().mockResolvedValue([]) },
    product: { findMany: vi.fn().mockResolvedValue([]) },
    menu: { findMany: vi.fn().mockResolvedValue([]) },
    integrationConnection: { findMany: vi.fn().mockResolvedValue([]) },
    auditLog: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { buildUserDataExportBundle } from "@/services/dsr/user-data-export-service";

describe("buildUserDataExportBundle", () => {
  it("returns not found when profile missing", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);
    const res = await buildUserDataExportBundle("00000000-0000-4000-8000-000000000001");
    expect(res.ok).toBe(false);
  });

  it("returns bundle when profile exists", async () => {
    vi.mocked(prisma.userProfile.findUnique).mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      companyName: "Test",
      role: "OWNER",
      createdAt: new Date(),
    } as never);
    vi.mocked(prisma.workspace.findFirst).mockResolvedValue({ id: "ws1", name: "W", slug: "w" } as never);
    const res = await buildUserDataExportBundle("u1");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.subject.email).toBe("a@b.com");
      expect(res.workspace?.id).toBe("ws1");
    }
  });
});
