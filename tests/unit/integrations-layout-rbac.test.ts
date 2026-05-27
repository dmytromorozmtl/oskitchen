import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsManagePage = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/integrations-page-access", () => ({
  requireIntegrationsManagePage,
}));

import IntegrationsLayout from "@/app/dashboard/integrations/layout";

describe("integrations layout RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks legacy integration setup pages without integrations.manage", async () => {
    requireIntegrationsManagePage.mockResolvedValue({
      ok: false,
      deny: createElement(
        "div",
        { "data-testid": "integrations-deny" },
        "You do not have permission to connect or manage sales channel integrations",
      ),
    });

    const markup = renderToStaticMarkup(
      await IntegrationsLayout({
        children: createElement("p", null, "WooCommerce setup"),
      }),
    );

    expect(markup).toContain("integrations-deny");
    expect(markup).not.toContain("WooCommerce setup");
  });

  it("renders legacy integration children when access is granted", async () => {
    requireIntegrationsManagePage.mockResolvedValue({
      ok: true,
      actor: { granted: [] },
    });

    const markup = renderToStaticMarkup(
      await IntegrationsLayout({
        children: createElement("p", null, "WooCommerce setup"),
      }),
    );

    expect(markup).toContain("WooCommerce setup");
    expect(markup).not.toContain("integrations-deny");
  });
});
