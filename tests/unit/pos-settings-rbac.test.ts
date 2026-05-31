import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultPermissionsForWorkspaceRole } from "@/lib/permissions/permissions";
import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());

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

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: { children: ReactNode }) => createElement("span", props, children),
}));

import PosHardwareSettingsPage from "@/app/dashboard/pos/settings/hardware/page";
import PosSettingsPage from "@/app/dashboard/pos/settings/page";

async function renderPage(element: Promise<ReactNode>) {
  return renderToStaticMarkup(await element);
}

describe("POS settings RBAC pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a deny card for customer-service staff on POS settings surfaces", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    requireWorkspacePermissionActor.mockResolvedValue({ granted });

    const settingsMarkup = await renderPage(PosSettingsPage());
    const hardwareMarkup = await renderPage(PosHardwareSettingsPage());

    expect(settingsMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(settingsMarkup).toContain("Back to dashboard");
    expect(settingsMarkup).not.toContain("/dashboard/pos/settings/hardware");

    expect(hardwareMarkup).toContain(
      "You do not have permission for this workspace surface (pos.access)",
    );
    expect(hardwareMarkup).toContain("Back to dashboard");
    expect(hardwareMarkup).not.toContain("Stripe Terminal");
  });

  it.each([
    {
      label: "manager",
      granted: workspacePermissionsFromStaffTemplate("MANAGER", "STAFF"),
    },
    {
      label: "owner",
      granted: defaultPermissionsForWorkspaceRole("OWNER"),
    },
  ])("renders POS settings and hardware controls for $label actors", async ({ granted }) => {
    requireWorkspacePermissionActor.mockResolvedValue({ granted });

    const settingsMarkup = await renderPage(PosSettingsPage());
    const hardwareMarkup = await renderPage(PosHardwareSettingsPage());

    expect(settingsMarkup).toContain("POS settings");
    expect(settingsMarkup).toContain("/dashboard/pos/settings/hardware");
    expect(settingsMarkup).toContain("/dashboard/settings/pos");

    expect(hardwareMarkup).toContain("POS hardware");
    expect(hardwareMarkup).toContain("Barcode scanner (keyboard wedge)");
    expect(hardwareMarkup).toContain("Stripe Terminal");
    expect(hardwareMarkup).toContain("supported");
  });
});
