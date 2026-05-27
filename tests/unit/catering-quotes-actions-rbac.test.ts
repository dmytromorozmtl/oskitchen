import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createQuote = vi.hoisted(() => vi.fn());
const convertQuoteToOrder = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

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
    cateringQuoteItem: { findFirst: vi.fn() },
    cateringQuoteFollowUp: { findFirst: vi.fn() },
    cateringQuoteTemplate: { create: vi.fn() },
  },
}));

vi.mock("@/services/catering/quote-service", () => ({
  createQuote,
  addQuoteLine: vi.fn(),
  completeFollowUp: vi.fn(),
  createFollowUp: vi.fn(),
  removeQuoteLine: vi.fn(),
  revokePublicLink: vi.fn(),
  rotatePublicLink: vi.fn(),
  setQuoteStatus: vi.fn(),
  snapshotQuoteVersion: vi.fn(),
  updateQuoteFields: vi.fn(),
}));

vi.mock("@/services/catering/quote-conversion-service", () => ({
  convertQuoteToOrder,
}));

import {
  convertCateringQuoteAction,
  createCateringQuoteAction,
} from "@/actions/catering-quotes";

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

const allowedActor = {
  sessionUserId: "manager-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "MANAGER" as const,
  staffRoleType: null,
  email: "manager@example.com",
  granted: new Set(["orders.manage"]),
};

describe("catering quotes actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { email: "manager@example.com" },
      dataUserId: "owner-1",
    });
    createQuote.mockResolvedValue({ id: QUOTE_ID });
    convertQuoteToOrder.mockResolvedValue({ ok: true, orderId: "order-1", depositUrl: null });
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
    formData.set("brandId", "");
    formData.set("locationId", "");

    const result = await createCateringQuoteAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("orders.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createQuote).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "catering_quotes.permission_denied",
        metadata: expect.objectContaining({
          operation: "catering_quotes.create",
          requiredPermission: "orders.manage",
        }),
      }),
    );
  });

  it("denies convertCateringQuoteAction without orders.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("quoteId", QUOTE_ID);
    formData.set("depositPercent", "25");

    const result = await convertCateringQuoteAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(convertQuoteToOrder).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "catering_quotes.convert_to_order" }),
      }),
    );
  });

  it("allows convertCateringQuoteAction when orders.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: allowedActor });

    const formData = new FormData();
    formData.set("quoteId", QUOTE_ID);
    formData.set("depositPercent", "25");

    const result = await convertCateringQuoteAction(formData);

    expect(result).toEqual({ ok: true, orderId: "order-1", depositUrl: null });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(convertQuoteToOrder).toHaveBeenCalledWith(
      { userId: "owner-1" },
      QUOTE_ID,
      "manager@example.com",
      25,
    );
  });
});
