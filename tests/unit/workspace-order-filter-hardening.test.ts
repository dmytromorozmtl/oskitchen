import { beforeEach, describe, expect, it, vi } from "vitest";

import { encryptOrderCustomerEmail } from "@/lib/orders/order-pii";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import { legacyAwareOwnerScope } from "@/tests/helpers/owner-scoped-where";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 11).toString("base64");

describe("workspace order filter hardening", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("keeps workspace scope while rewriting email filters for encrypted and legacy rows", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");

    await expect(
      orderListWhereForOwnerAnd("user-1", {
        customerEmail: { equals: "Jane@Example.com", mode: "insensitive" },
      }),
    ).resolves.toEqual({
      AND: [
        legacyAwareOwnerScope("user-1", "ws-1"),
        {
          OR: [
            { customerEmail: encryptOrderCustomerEmail("jane@example.com") },
            {
              customerEmail: {
                equals: "jane@example.com",
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    });
  });
});
