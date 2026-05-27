import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsManagePage = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/integrations-page-access", () => ({
  requireIntegrationsManagePage,
}));

vi.mock("@/components/sales-channels/sales-channels-subnav", () => ({
  SalesChannelsSubnav: () => createElement("nav", { "data-testid": "sales-channels-subnav" }),
}));

import SalesChannelsLayout from "@/app/dashboard/sales-channels/layout";

async function renderLayout(children: ReactNode = createElement("p", null, "child")) {
  return renderToStaticMarkup(await SalesChannelsLayout({ children }));
}

describe("sales channels layout RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the deny shell when integrations.manage is missing", async () => {
    requireIntegrationsManagePage.mockResolvedValue({
      ok: false,
      deny: createElement("div", { "data-testid": "integrations-deny" }, "denied"),
    });

    const markup = await renderLayout();

    expect(markup).toContain("integrations-deny");
    expect(markup).not.toContain("Channel operations center");
    expect(markup).not.toContain("sales-channels-subnav");
  });

  it("renders the channel operations shell when integrations.manage is granted", async () => {
    requireIntegrationsManagePage.mockResolvedValue({
      ok: true,
      actor: { granted: [] },
    });

    const markup = await renderLayout();

    expect(markup).toContain("Channel operations center");
    expect(markup).toContain("sales-channels-subnav");
    expect(markup).toContain("child");
  });
});
