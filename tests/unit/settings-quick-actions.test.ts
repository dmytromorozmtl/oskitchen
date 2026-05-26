import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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

import { QuickActionsCard } from "@/components/dashboard/settings/quick-actions";

function renderQuickActions(role: string | null) {
  return renderToStaticMarkup(
    createElement(QuickActionsCard, {
      actor: {
        userId: "user-1",
        email: "user@example.com",
        role,
      },
    }),
  );
}

describe("settings quick actions", () => {
  it("uses canonical settings routes for owners instead of stale dashboard links", () => {
    const markup = renderQuickActions("owner");

    expect(markup).toContain("/dashboard/settings/billing");
    expect(markup).toContain("/dashboard/settings/storefront");
    expect(markup).toContain("/dashboard/settings/security");

    expect(markup).not.toContain("/dashboard/billing");
    expect(markup).not.toContain("/dashboard/storefronts");
    expect(markup).not.toContain("/dashboard/menu");
    expect(markup).not.toContain("/dashboard/security");
  });

  it("shows only manager-capable settings actions for manager roles", () => {
    const markup = renderQuickActions("manager");

    expect(markup).toContain("/dashboard/settings/operations");
    expect(markup).toContain("/dashboard/settings/orders");
    expect(markup).toContain("/dashboard/settings/storefront");
    expect(markup).toContain("/dashboard/settings/notifications");

    expect(markup).not.toContain("/dashboard/settings/billing");
    expect(markup).not.toContain("/dashboard/settings/staff");
    expect(markup).not.toContain("/dashboard/settings/security");
  });

  it("falls back to read-only messaging for staff without configuration permissions", () => {
    const markup = renderQuickActions("staff");

    expect(markup).toContain("read-only access to Settings Control Center");
    expect(markup).not.toContain("/dashboard/settings/");
  });
});
