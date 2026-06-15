import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsReadPage = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/integrations-page-access", () => ({
  requireIntegrationsReadPage,
}));

vi.mock("@/components/sales-channels/sales-channels-subnav", () => ({
  SalesChannelsSubnav: ({ canManage }: { canManage?: boolean }) =>
    createElement("nav", {
      "data-testid": "sales-channels-subnav",
      "data-can-manage": String(canManage ?? true),
    }),
}));

import SalesChannelsLayout from "@/app/dashboard/sales-channels/layout";

async function renderLayout(children: ReactNode = createElement("p", null, "child")) {
  return renderToStaticMarkup(await SalesChannelsLayout({ children }));
}

describe("sales channels layout RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the deny shell when integrations.read is missing", async () => {
    requireIntegrationsReadPage.mockResolvedValue({
      ok: false,
      deny: createElement("div", { "data-testid": "integrations-deny" }, "denied"),
    });

    const markup = await renderLayout();

    expect(markup).toContain("integrations-deny");
    expect(markup).not.toContain("Channel operations center");
    expect(markup).not.toContain("sales-channels-subnav");
  });

  it("renders read-only channel shell for integrations.read without manage", async () => {
    requireIntegrationsReadPage.mockResolvedValue({
      ok: true,
      actor: { granted: [] },
      canManage: false,
    });

    const markup = await renderLayout();

    expect(markup).toContain("Channel operations center");
    expect(markup).toContain("Read-only access");
    expect(markup).toContain('data-can-manage="false"');
    expect(markup).toContain("child");
  });

  it("renders the full channel operations shell when integrations.manage is granted", async () => {
    requireIntegrationsReadPage.mockResolvedValue({
      ok: true,
      actor: { granted: [] },
      canManage: true,
    });

    const markup = await renderLayout();

    expect(markup).toContain("Channel operations center");
    expect(markup).toContain('data-can-manage="true"');
    expect(markup).not.toContain("Read-only access");
    expect(markup).toContain("child");
  });
});
