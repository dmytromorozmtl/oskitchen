import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireReportExportActor = vi.hoisted(() => vi.fn());
const requireExportActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/reports/report-export-access", () => ({
  requireReportExportActor,
}));

vi.mock("@/lib/import-export/require-export-actor", () => ({
  requireExportActor,
}));

vi.mock("@/services/accounting/restaurant-pnl-service", () => ({
  getRestaurantPnLStatement: vi.fn().mockResolvedValue({ lines: [] }),
  pnlToCsv: vi.fn().mockReturnValue("csv"),
}));

vi.mock("@/services/integrations/xero-service", () => ({
  exportXeroData: vi.fn().mockResolvedValue({
    invoices: [],
    lines: [],
    sales: { orderCount: 0, grossSales: 0, periodStart: "2026-06-01", periodEnd: "2026-06-15" },
    periodEnd: new Date("2026-06-15"),
    period: "month",
  }),
  xeroInvoicesToCsv: vi.fn().mockReturnValue("csv"),
  xeroPnlToCsv: vi.fn().mockReturnValue("csv"),
  xeroPnlToJournalCsv: vi.fn().mockReturnValue("csv"),
  salesSummaryToXeroCsv: vi.fn().mockReturnValue("csv"),
  salesSummaryToXeroJournalCsv: vi.fn().mockReturnValue("csv"),
}));

vi.mock("@/services/integrations/quickbooks-service", () => ({
  exportQuickBooksData: vi.fn().mockResolvedValue({
    invoices: [],
    lines: [],
    sales: { orderCount: 0, grossSales: 0, periodStart: "2026-06-01", periodEnd: "2026-06-15" },
    periodEnd: new Date("2026-06-15"),
    period: "month",
  }),
  quickBooksInvoicesToCsv: vi.fn().mockReturnValue("csv"),
  quickBooksPnlToIif: vi.fn().mockReturnValue("iif"),
  quickBooksPnlToCsv: vi.fn().mockReturnValue("csv"),
  salesSummaryToCsv: vi.fn().mockReturnValue("csv"),
  salesSummaryToQuickBooksIif: vi.fn().mockReturnValue("iif"),
}));

vi.mock("@/services/franchise/franchise-service", () => ({
  calculateRoyalties: vi.fn().mockResolvedValue({ franchises: [], totalRoyalties: 0, since: "2026-01-01" }),
  royaltiesToCSV: vi.fn().mockReturnValue("csv"),
}));

vi.mock("@/services/allergen/allergen-service", () => ({
  getAllergenDeclarationForRecipe: vi.fn().mockResolvedValue({
    productName: "Soup",
    containsStatement: "Contains: milk",
    mayContainStatement: "",
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: vi.fn().mockResolvedValue({
        title: "Soup",
        nutritionProfile: null,
        ingredientDeclaration: null,
        allergenProfile: null,
      }),
    },
  },
}));

vi.mock("@/services/nutrition/label-format-service", () => ({
  renderNutritionLabelPdfPlaceholder: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}));

import { GET as getRestaurantPnl } from "@/app/api/export/restaurant-pnl/route";
import { GET as getXero } from "@/app/api/export/xero/route";
import { GET as getQuickbooks } from "@/app/api/export/quickbooks/route";
import { GET as getFranchiseRoyalties } from "@/app/api/export/franchise-royalties/route";
import { GET as getAllergenSheet } from "@/app/api/export/allergen-sheet/route";
import { GET as getNutritionLabel } from "@/app/api/export/nutrition-label/route";

const allowedActor = {
  sessionUserId: "mgr-1",
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  email: "manager@example.com",
  granted: new Set(["reports.export"]),
};

describe("specialty export route RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      label: "restaurant-pnl",
      handler: () => getRestaurantPnl(new Request("http://localhost/api/export/restaurant-pnl?period=month")),
      operation: "export:restaurant-pnl",
      useExportActor: false,
    },
    {
      label: "xero",
      handler: () => getXero(new NextRequest("http://localhost/api/export/xero?type=pnl&period=month")),
      operation: "export:xero",
      useExportActor: false,
    },
    {
      label: "quickbooks",
      handler: () =>
        getQuickbooks(new NextRequest("http://localhost/api/export/quickbooks?type=pnl&period=month")),
      operation: "export:quickbooks",
      useExportActor: false,
    },
    {
      label: "franchise-royalties",
      handler: () =>
        getFranchiseRoyalties(
          new NextRequest("http://localhost/api/export/franchise-royalties?period=month"),
        ),
      operation: "export:franchise-royalties",
      useExportActor: false,
    },
    {
      label: "allergen-sheet",
      handler: () =>
        getAllergenSheet(
          new NextRequest("http://localhost/api/export/allergen-sheet?recipeId=recipe-1"),
        ),
      operation: "export:allergen-sheet",
      useExportActor: false,
    },
  ])("denies $label export without reports.export", async ({ handler, operation, useExportActor }) => {
    if (useExportActor) {
      requireExportActor.mockResolvedValue({ ok: false, error: "Forbidden" });
    } else {
      requireReportExportActor.mockResolvedValue({ ok: false, error: "Forbidden" });
    }

    const response = await handler();

    expect(response.status).toBe(403);
    if (useExportActor) {
      expect(requireExportActor).toHaveBeenCalled();
    } else {
      expect(requireReportExportActor).toHaveBeenCalledWith(
        expect.objectContaining({ operation }),
      );
    }
  });

  it.each([
    {
      label: "restaurant-pnl",
      handler: () => getRestaurantPnl(new Request("http://localhost/api/export/restaurant-pnl?period=month")),
      operation: "export:restaurant-pnl",
      useExportActor: false,
    },
    {
      label: "xero",
      handler: () => getXero(new NextRequest("http://localhost/api/export/xero?type=pnl&period=month")),
      operation: "export:xero",
      useExportActor: false,
    },
  ])("allows $label export when reports.export is granted", async ({ handler, operation, useExportActor }) => {
    if (useExportActor) {
      requireExportActor.mockResolvedValue({ ok: true, actor: allowedActor });
    } else {
      requireReportExportActor.mockResolvedValue({ ok: true, actor: allowedActor });
    }

    const response = await handler();

    expect(response.status).toBe(200);
    if (useExportActor) {
      expect(requireExportActor).toHaveBeenCalled();
    } else {
      expect(requireReportExportActor).toHaveBeenCalledWith(
        expect.objectContaining({ operation }),
      );
    }
  });

  it("denies nutrition-label export without reports.export", async () => {
    requireExportActor.mockResolvedValue({ ok: false, error: "Forbidden" });

    const response = await getNutritionLabel(
      new NextRequest("http://localhost/api/export/nutrition-label?productId=p1&format=FDA"),
    );

    expect(response.status).toBe(403);
    expect(requireExportActor).toHaveBeenCalledWith(
      expect.objectContaining({
        exportType: "nutrition_labels",
        operation: "export:nutrition-label",
      }),
    );
  });
});
