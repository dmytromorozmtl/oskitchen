import { beforeEach, describe, expect, it, vi } from "vitest";

const createXeroBill = vi.hoisted(() => vi.fn());
const exportXeroData = vi.hoisted(() => vi.fn());
const getXeroCredentialsForUser = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  integrationConnection: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock("@/services/integrations/xero/xero-api", () => ({
  createXeroBill,
}));
vi.mock("@/services/integrations/xero-service", () => ({
  exportXeroData,
}));
vi.mock("@/services/integrations/xero/xero-credentials", () => ({
  getXeroCredentialsForUser,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { syncXeroSupplierInvoices } from "@/services/integrations/xero/invoice-sync.service";

describe("xero invoice sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getXeroCredentialsForUser.mockResolvedValue({
      accessToken: "token",
      tenantId: "tenant-1",
      settings: { syncedInvoiceIds: [] },
    });
    exportXeroData.mockResolvedValue({
      invoices: [
        {
          id: "inv-1",
          invoiceNumber: "SINV-100",
          invoiceDate: new Date("2026-06-01"),
          totalAmount: 250,
          supplier: { name: "Fresh Foods" },
        },
      ],
    });
    createXeroBill.mockResolvedValue({
      ok: true,
      message: "synced",
      invoiceId: "xero-inv-1",
    });
    prismaMock.integrationConnection.findFirst.mockResolvedValue({ id: "conn-1" });
    prismaMock.integrationConnection.update.mockResolvedValue({});
  });

  it("syncs unsynced supplier invoices to Xero", async () => {
    const result = await syncXeroSupplierInvoices("owner-1");
    expect(result.ok).toBe(true);
    expect(result.synced).toBe(1);
    expect(createXeroBill).toHaveBeenCalledWith(
      expect.objectContaining({
        contactName: "Fresh Foods",
        invoiceNumber: "SINV-100",
        totalAmount: 250,
      }),
    );
  });

  it("requires Xero connection", async () => {
    getXeroCredentialsForUser.mockResolvedValue(null);
    const result = await syncXeroSupplierInvoices("owner-1");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not connected");
  });
});
