import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn(() => Promise.resolve({})));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      findFirst,
      update,
    },
  },
}));

import {
  hashApiKey,
  hashApiKeyCandidates,
  resolvePublicApiUserId,
} from "@/lib/api-public/auth";

describe("hashApiKey", () => {
  it("returns deterministic salted sha256 hex when salt is configured", () => {
    process.env.API_KEY_HASH_SALT = "api-salt";
    const raw = "kos_test_integration_key_12345";
    const h = hashApiKey(raw);
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashApiKey(raw)).toBe(h);
    expect(hashApiKey(`${raw}x`)).not.toBe(h);
  });

  it("returns both salted and legacy candidates for compatibility", () => {
    process.env.API_KEY_HASH_SALT = "api-salt";
    const [salted, legacy] = hashApiKeyCandidates("kos_test_integration_key_12345");
    expect(salted).toMatch(/^[a-f0-9]{64}$/);
    expect(legacy).toMatch(/^[a-f0-9]{64}$/);
    expect(salted).not.toBe(legacy);
  });
});

describe("resolvePublicApiUserId", () => {
  beforeEach(() => {
    delete process.env.API_KEY_HASH_SALT;
    findFirst.mockReset();
    update.mockClear();
  });

  it("returns null without Bearer", async () => {
    expect(await resolvePublicApiUserId(null)).toBeNull();
    expect(await resolvePublicApiUserId("Basic x")).toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("returns null for non-kos prefix", async () => {
    expect(await resolvePublicApiUserId("Bearer sk_live_xxx")).toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("returns null when key too short", async () => {
    expect(await resolvePublicApiUserId("Bearer kos_short")).toBeNull();
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("returns null when inactive or revoked", async () => {
    findFirst.mockResolvedValueOnce({
      id: "key-1",
      userId: "u1",
      active: false,
      revokedAt: null,
    });
    expect(await resolvePublicApiUserId("Bearer kos_aaaaaaaaaaaaaaaa")).toBeNull();

    findFirst.mockResolvedValueOnce({
      id: "key-2",
      userId: "u1",
      active: true,
      revokedAt: new Date(),
    });
    expect(await resolvePublicApiUserId("Bearer kos_bbbbbbbbbbbbbbbb")).toBeNull();
  });

  it("returns userId and bumps lastUsedAt when active", async () => {
    findFirst.mockResolvedValueOnce({
      id: "key-3",
      userId: "owner-id",
      active: true,
      revokedAt: null,
    });
    const uid = await resolvePublicApiUserId("Bearer kos_cccccccccccccc");
    expect(uid).toBe("owner-id");
    expect(update).toHaveBeenCalled();
  });
});
