import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createQuote = vi.hoisted(() => vi.fn());
const cateringQuoteUpdateMany = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cateringQuote: {
      updateMany: cateringQuoteUpdateMany,
    },
  },
}));

vi.mock("@/services/catering/quote-service", () => ({
  createQuote,
}));

import {
  createCateringQuoteAction,
  markQuoteSentAction,
} from "@/actions/catering";

const QUOTE_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("legacy catering actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { email: "manager@example.com" },
      dataUserId: "owner-1",
    });
    createQuote.mockResolvedValue({ id: QUOTE_ID, publicToken: "token-1" });
    cateringQuoteUpdateMany.mockResolvedValue({ count: 1 });
  });

  it("denies createCateringQuoteAction without orders.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("customerName", "Acme Corp");
    formData.set("customerEmail", "events@acme.com");
    formData.set("companyName", "");
    formData.set("notes", "");
    formData.set("lineTitle", "");

    const result = await createCateringQuoteAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("orders.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createQuote).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "catering.permission_denied",
        metadata: expect.objectContaining({
          operation: "catering.create_quote",
          requiredPermission: "orders.manage",
        }),
      }),
    );
  });

  it("denies markQuoteSentAction without orders.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("quoteId", QUOTE_ID);

    const result = await markQuoteSentAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(cateringQuoteUpdateMany).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "catering.mark_quote_sent" }),
      }),
    );
  });

  it("allows markQuoteSentAction when orders.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("quoteId", QUOTE_ID);

    const result = await markQuoteSentAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(cateringQuoteUpdateMany).toHaveBeenCalledWith({
      where: { id: QUOTE_ID, userId: "owner-1" },
      data: { status: "SENT" },
    });
  });
});
