import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  apiKey: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { hashApiKey, hashApiKeyCandidates, resolvePublicApiUserId } from "@/lib/api-public/auth";

describe("public API tenant isolation", () => {
  beforeEach(() => {
    process.env.API_KEY_HASH_SALT = "tenant-test-salt";
    vi.clearAllMocks();
    prismaMock.apiKey.update.mockResolvedValue({});
  });

  it("rejects missing or non-kos bearer tokens", async () => {
    expect(await resolvePublicApiUserId(null)).toBeNull();
    expect(await resolvePublicApiUserId("Bearer short")).toBeNull();
    expect(await resolvePublicApiUserId("Bearer notkos_abcdefghijklmnop")).toBeNull();
  });

  it("resolves userId only for active non-revoked key hash", async () => {
    const raw = "kos_test_tenant_a_" + "x".repeat(20);
    const digest = hashApiKey(raw);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);

    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: "key-a",
      userId: "user-a",
      active: true,
      revokedAt: null,
      scopesJson: null,
    });

    const userId = await resolvePublicApiUserId(`Bearer ${raw}`);
    expect(userId).toBe("user-a");
    expect(prismaMock.apiKey.findFirst).toHaveBeenCalledWith({
      where: { keyHash: { in: hashApiKeyCandidates(raw) } },
      select: { id: true, userId: true, active: true, revokedAt: true, scopesJson: true },
    });
  });

  it("returns null for revoked keys (cross-tenant key must not authenticate)", async () => {
    const raw = "kos_test_tenant_b_" + "y".repeat(20);
    prismaMock.apiKey.findFirst.mockResolvedValue({
      id: "key-b",
      userId: "user-b",
      active: true,
      revokedAt: new Date(),
    });
    expect(await resolvePublicApiUserId(`Bearer ${raw}`)).toBeNull();
  });
});
