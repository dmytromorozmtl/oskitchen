import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  order: { findMany: vi.fn() },
  apiKey: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { hashApiKey, resolvePublicApiUserId } from "@/lib/api-public/auth";

describe("public API cross-tenant isolation", () => {
  beforeEach(() => {
    process.env.API_KEY_HASH_SALT = "cross-tenant-salt";
    vi.clearAllMocks();
    prismaMock.apiKey.update.mockResolvedValue({});
  });

  it("tenant A key never returns tenant B userId", async () => {
    const keyA = "kos_tenant_a_" + "a".repeat(24);
    const keyB = "kos_tenant_b_" + "b".repeat(24);

    prismaMock.apiKey.findFirst.mockImplementation(
      ({ where }: { where: { keyHash: { in: string[] } } }) => {
      const hA = hashApiKey(keyA);
      const hB = hashApiKey(keyB);
      if (where.keyHash.in.includes(hA)) {
        return { id: "key-a", userId: "user-a", active: true, revokedAt: null };
      }
      if (where.keyHash.in.includes(hB)) {
        return { id: "key-b", userId: "user-b", active: true, revokedAt: null };
      }
      return null;
      },
    );

    const userFromA = await resolvePublicApiUserId(`Bearer ${keyA}`);
    const userFromB = await resolvePublicApiUserId(`Bearer ${keyB}`);

    expect(userFromA).toBe("user-a");
    expect(userFromB).toBe("user-b");
    expect(userFromA).not.toBe(userFromB);
  });
});
