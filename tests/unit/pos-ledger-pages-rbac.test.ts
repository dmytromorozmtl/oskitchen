import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const canUseFeature = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  pOSTransaction: { findMany: vi.fn() },
  pOSReceipt: { findMany: vi.fn() },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => createElement("a", { href, ...props }, children),
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/lib/plans/feature-registry", () => ({
  canUseFeature,
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: ReactNode;
    asChild?: boolean;
  }) => (asChild ? children : createElement("button", props, children)),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: ReactNode }) => createElement("section", props, children),
  CardHeader: ({ children, ...props }: { children: ReactNode }) => createElement("div", props, children),
  CardTitle: ({ children, ...props }: { children: ReactNode }) => createElement("h2", props, children),
  CardDescription: ({ children, ...props }: { children: ReactNode }) => createElement("p", props, children),
  CardContent: ({ children, ...props }: { children: ReactNode }) => createElement("div", props, children),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children, ...props }: { children: ReactNode }) => createElement("table", props, children),
  TableHeader: ({ children, ...props }: { children: ReactNode }) => createElement("thead", props, children),
  TableBody: ({ children, ...props }: { children: ReactNode }) => createElement("tbody", props, children),
  TableRow: ({ children, ...props }: { children: ReactNode }) => createElement("tr", props, children),
  TableHead: ({ children, ...props }: { children: ReactNode }) => createElement("th", props, children),
  TableCell: ({ children, ...props }: { children: ReactNode }) => createElement("td", props, children),
}));

import PosReceiptsPage from "@/app/dashboard/pos/receipts/page";
import PosReportsPage from "@/app/dashboard/pos/reports/page";
import PosTransactionsPage from "@/app/dashboard/pos/transactions/page";

async function renderPage(element: Promise<ReactNode>) {
  return renderToStaticMarkup(await element);
}

describe("POS ledger page RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    prismaMock.pOSTransaction.findMany.mockResolvedValue([]);
    prismaMock.pOSReceipt.findMany.mockResolvedValue([]);
  });

  it("shows deny states and skips data loading for viewers without POS access", async () => {
    const granted = workspacePermissionsFromStaffTemplate("VIEWER", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ userId: "viewer-1", granted });

    const transactionsMarkup = await renderPage(PosTransactionsPage());
    const receiptsMarkup = await renderPage(PosReceiptsPage());
    const reportsMarkup = await renderPage(PosReportsPage());

    expect(transactionsMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(receiptsMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(reportsMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );

    expect(prismaMock.pOSTransaction.findMany).not.toHaveBeenCalled();
    expect(prismaMock.pOSReceipt.findMany).not.toHaveBeenCalled();
    expect(canUseFeature).not.toHaveBeenCalled();
  });

  it("uses owner-scoped transaction and receipt queries for customer-service actors with POS access", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ userId: "owner-user-1", granted });

    const transactionsMarkup = await renderPage(PosTransactionsPage());
    const receiptsMarkup = await renderPage(PosReceiptsPage());

    expect(transactionsMarkup).toContain("POS transactions");
    expect(transactionsMarkup).toContain("No POS transactions yet.");
    expect(receiptsMarkup).toContain("POS receipts");
    expect(receiptsMarkup).toContain("No receipts yet.");

    expect(prismaMock.pOSTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "owner-user-1" },
        take: 80,
      }),
    );
    expect(prismaMock.pOSReceipt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { transaction: { userId: "owner-user-1" } },
        take: 80,
      }),
    );
  });

  it("shows the plan gate on POS reports before querying report data", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ userId: "owner-user-1", granted });
    canUseFeature.mockResolvedValueOnce({ allowed: false });

    const markup = await renderPage(PosReportsPage());

    expect(markup).toContain("Upgrade to Team for register-level reporting slices.");
    expect(markup).toContain("/dashboard/billing");
    expect(markup).toContain("/dashboard/pos");
    expect(canUseFeature).toHaveBeenCalledWith("owner-user-1", "pos_reports");
    expect(prismaMock.pOSTransaction.findMany).not.toHaveBeenCalled();
  });

  it("renders report aggregates for owner actors when the reports feature is enabled", async () => {
    const granted = defaultPermissionsForWorkspaceRole("OWNER");
    requireWorkspacePermissionActor.mockResolvedValue({ userId: "owner-user-1", granted });
    prismaMock.pOSTransaction.findMany.mockResolvedValue([
      { total: 12.5, paymentMode: "CASH" },
      { total: 7.5, paymentMode: "CARD_TERMINAL_PLACEHOLDER" },
    ]);

    const markup = await renderPage(PosReportsPage());

    expect(markup).toContain("POS reports");
    expect(markup).toContain("$20.00");
    expect(markup).toContain(">2<");
    expect(markup).toContain("CASH");
    expect(markup).toContain("CARD_TERMINAL_PLACEHOLDER");
    expect(canUseFeature).toHaveBeenCalledWith("owner-user-1", "pos_reports");
    expect(prismaMock.pOSTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "owner-user-1",
          status: "COMPLETED",
        }),
        select: { total: true, paymentMode: true },
      }),
    );
  });
});
