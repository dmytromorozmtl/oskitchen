import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createInvoice = vi.hoisted(() => vi.fn());
const matchInvoiceToPO = vi.hoisted(() => vi.fn());
const approveInvoice = vi.hoisted(() => vi.fn());
const markInvoicePaid = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/accounting/ap-service", () => ({
  createInvoice,
  matchInvoiceToPO,
  approveInvoice,
  markInvoicePaid,
}));

import {
  approveInvoiceAction,
  createInvoiceAction,
  markPaidInvoiceAction,
  matchInvoiceAction,
} from "@/actions/accounting/ap";

const INVOICE_ID = "11111111-1111-4111-8111-111111111111";
const PO_ID = "22222222-2222-4222-8222-222222222222";
const SUPPLIER_ID = "33333333-3333-4333-8333-333333333333";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("accounts payable actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      sessionUserId: "actor-1",
      dataUserId: "owner-1",
    });
  });

  it("denies createInvoiceAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("supplierId", SUPPLIER_ID);
    formData.set("invoiceNumber", "INV-100");
    formData.set("invoiceDate", "2026-05-27");
    formData.set("totalAmount", "120.50");

    await createInvoiceAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createInvoice).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "accounting.ap.permission_denied",
        metadata: expect.objectContaining({
          operation: "accounting.ap.create",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies matchInvoiceAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("invoiceId", INVOICE_ID);
    formData.set("purchaseOrderId", PO_ID);

    await matchInvoiceAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(matchInvoiceToPO).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "accounting.ap.match" }),
      }),
    );
  });

  it("denies approveInvoiceAction without reports.read.financial and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("invoiceId", INVOICE_ID);

    await approveInvoiceAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(approveInvoice).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "accounting.ap.approve" }),
      }),
    );
  });

  it("denies markPaidInvoiceAction without reports.read.financial and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("invoiceId", INVOICE_ID);

    await markPaidInvoiceAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(markInvoicePaid).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "accounting.ap.mark_paid" }),
      }),
    );
  });

  it("allows createInvoiceAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("supplierId", SUPPLIER_ID);
    formData.set("invoiceNumber", "INV-101");
    formData.set("invoiceDate", "2026-05-27");
    formData.set("totalAmount", "99.00");

    await createInvoiceAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(createInvoice).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({ invoiceNumber: "INV-101" }),
    );
  });
});
