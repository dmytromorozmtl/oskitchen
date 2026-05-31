import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const getOpenTabs = vi.hoisted(() => vi.fn());
const loadHandheldOrderingBootstrap = vi.hoisted(() => vi.fn());
const tabPanelMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/pos/handheld-ordering-service", () => ({
  loadHandheldOrderingBootstrap,
}));

vi.mock("@/services/pos/tab-service", () => ({
  getOpenTabs,
}));

vi.mock("@/components/pos/handheld-ordering-client", () => ({
  HandheldOrderingClient: () =>
    createElement("div", { "data-testid": "handheld-ordering-root" }, "HandheldOrderingClient"),
}));

vi.mock("@/components/pos/tab-panel", () => ({
  TabPanel: ({ tabs }: { tabs: unknown[] }) => {
    tabPanelMock({ tabs });
    return createElement("div", { "data-testid": "tab-panel" }, `TabPanel:${tabs.length}`);
  },
}));

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

import HandheldPOSPage from "@/app/dashboard/pos/handheld/page";
import PosTabsPage from "@/app/dashboard/pos/tabs/page";

const sampleTabs = [
  {
    id: "tab-1",
    name: "Patio 12",
    status: "OPEN",
    subtotal: 24,
    tax: 1.92,
    tip: 0,
    total: 25.92,
    items: [],
  },
];

async function renderPage(element: Promise<ReactNode>) {
  return renderToStaticMarkup(await element);
}

const bootstrap = {
  registers: [{ id: "reg-1", name: "Bar", locationId: null }],
  staff: [{ id: "staff-1", name: "Alex" }],
  products: [{ id: "prod-1", title: "Burger", price: 12, category: "MAINS" }],
  tables: [{ id: "table-1", name: "12", section: "Patio", capacity: 4, status: "AVAILABLE" }],
  tabs: sampleTabs.map((tab) => ({
    id: tab.id,
    name: tab.name,
    tableId: null,
    items: tab.items,
  })),
  openShiftsByRegisterId: { "reg-1": { id: "shift-1" } },
  offlineQueueEnabled: true,
  conflictResolution: "manual_review" as const,
};

describe("POS handheld and tabs RBAC pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getOpenTabs.mockResolvedValue(sampleTabs);
    loadHandheldOrderingBootstrap.mockResolvedValue(bootstrap);
  });

  it("shows deny states and skips tab loading for viewer roles without POS access", async () => {
    const granted = workspacePermissionsFromStaffTemplate("VIEWER", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ userId: "viewer-1", granted });

    const handheldMarkup = await renderPage(HandheldPOSPage());
    const tabsMarkup = await renderPage(PosTabsPage());

    expect(handheldMarkup).toContain("POS workspace");
    expect(handheldMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(handheldMarkup).toContain("Back to dashboard");
    expect(handheldMarkup).not.toContain("handheld-ordering-root");
    expect(loadHandheldOrderingBootstrap).not.toHaveBeenCalled();

    expect(tabsMarkup).toContain("POS workspace");
    expect(tabsMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(tabsMarkup).toContain("Back to dashboard");
    expect(getOpenTabs).not.toHaveBeenCalled();
    expect(tabPanelMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "customer-service",
      userId: "cashier-1",
      granted: workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF"),
    },
    {
      label: "manager",
      userId: "manager-1",
      granted: workspacePermissionsFromStaffTemplate("MANAGER", "STAFF"),
    },
    {
      label: "owner",
      userId: "owner-1",
      granted: defaultPermissionsForWorkspaceRole("OWNER"),
    },
  ])("renders handheld and tabs pages for $label POS operators", async ({ userId, granted }) => {
    requireWorkspacePermissionActor.mockResolvedValue({ userId, granted });

    const handheldMarkup = await renderPage(HandheldPOSPage());
    const tabsMarkup = await renderPage(PosTabsPage());

    expect(handheldMarkup).toContain("HandheldOrderingClient");
    expect(loadHandheldOrderingBootstrap).toHaveBeenCalledWith(userId);

    expect(getOpenTabs).toHaveBeenCalledWith(userId);
    expect(tabPanelMock).toHaveBeenCalledWith({ tabs: sampleTabs });
    expect(tabsMarkup).toContain("Open tabs, quick-add items, and close with tax and tip.");
    expect(tabsMarkup).toContain("TabPanel:1");
  });
});
