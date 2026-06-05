import { beforeEach, describe, expect, it, vi } from "vitest";

const createQuickBooksJournalEntry = vi.hoisted(() => vi.fn());
const exportQuickBooksData = vi.hoisted(() => vi.fn());
const getQuickBooksCredentialsForUser = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  integrationConnection: { findFirst: vi.fn(), update: vi.fn() },
}));

vi.mock("@/services/integrations/quickbooks/quickbooks-api", () => ({
  createQuickBooksJournalEntry,
}));
vi.mock("@/services/integrations/quickbooks-service", () => ({
  exportQuickBooksData,
}));
vi.mock("@/services/integrations/quickbooks/quickbooks-credentials", () => ({
  getQuickBooksCredentialsForUser,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { postQuickBooksDailySalesJournal } from "@/services/integrations/quickbooks/daily-sales-journal.service";

describe("quickbooks daily sales journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getQuickBooksCredentialsForUser.mockResolvedValue({
      accessToken: "token",
      realmId: "realm-1",
      settings: {
        salesAccountId: "sales-1",
        depositAccountId: "dep-1",
      },
    });
    exportQuickBooksData.mockResolvedValue({
      sales: {
        grossSales: 420.5,
        orderCount: 12,
        periodStart: "2026-06-01",
        periodEnd: "2026-06-05",
      },
    });
    createQuickBooksJournalEntry.mockResolvedValue({
      ok: true,
      message: "posted",
      journalId: "je-1",
    });
    prismaMock.integrationConnection.findFirst.mockResolvedValue({ id: "conn-1" });
    prismaMock.integrationConnection.update.mockResolvedValue({});
  });

  it("posts balanced journal when accounts are mapped", async () => {
    const result = await postQuickBooksDailySalesJournal("owner-1");
    expect(result.ok).toBe(true);
    expect(result.amount).toBe(420.5);
    expect(createQuickBooksJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        debitAccountId: "dep-1",
        creditAccountId: "sales-1",
        amount: 420.5,
      }),
    );
  });

  it("requires account mapping", async () => {
    getQuickBooksCredentialsForUser.mockResolvedValue({
      accessToken: "token",
      realmId: "realm-1",
      settings: {},
    });
    const result = await postQuickBooksDailySalesJournal("owner-1");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Map sales and deposit accounts");
  });
});
