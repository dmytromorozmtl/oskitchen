import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsReadPage = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/integrations-page-access", () => ({
  requireIntegrationsReadPage,
}));

import IntegrationsLayout from "@/app/dashboard/integrations/layout";

describe("integrations layout RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks legacy integration setup pages without integrations.read", async () => {
    requireIntegrationsReadPage.mockResolvedValue({
      ok: false,
      deny: createElement(
        "div",
        { "data-testid": "integrations-deny" },
        "You do not have permission to view sales channel integrations",
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

  it("renders legacy integration children when read access is granted", async () => {
    requireIntegrationsReadPage.mockResolvedValue({
      ok: true,
      actor: { granted: [] },
      canManage: false,
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
