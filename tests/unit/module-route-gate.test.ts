import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const usePathnameMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
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

import { ModuleRouteGate } from "@/components/dashboard/module-route-gate";

function renderGate(input?: {
  pathname?: string;
  blockedPathPrefixes?: string[];
  userRole?: "OWNER" | "STAFF";
  isPlatformSuper?: boolean;
  gtmSurfaceAccess?: boolean;
}) {
  usePathnameMock.mockReturnValue(input?.pathname ?? "/dashboard/today");
  return renderToStaticMarkup(
    createElement(
      ModuleRouteGate,
      {
        blockedPathPrefixes: input?.blockedPathPrefixes ?? [],
        userRole: input?.userRole ?? "OWNER",
        isPlatformSuper: input?.isPlatformSuper ?? false,
        gtmSurfaceAccess: input?.gtmSurfaceAccess ?? false,
      },
      createElement("div", null, "Visible child content"),
    ),
  );
}

describe("module route gate", () => {
  it("shows a recovery card when the current route is blocked by module settings", () => {
    const markup = renderGate({
      pathname: "/dashboard/copilot",
      blockedPathPrefixes: ["/dashboard/copilot"],
    });

    expect(markup).toContain("Module not enabled");
    expect(markup).toContain("Open module settings");
    expect(markup).not.toContain("Visible child content");
  });

  it("shows a role-denied state for staff on restricted dashboard routes", () => {
    const markup = renderGate({
      pathname: "/dashboard/billing",
      userRole: "STAFF",
    });

    expect(markup).toContain("You do not have access");
    expect(markup).toContain("Contact support");
    expect(markup).not.toContain("Visible child content");
  });

  it("renders pilot messaging when a pilot route is reachable", () => {
    const markup = renderGate({
      pathname: "/dashboard/copilot",
    });

    expect(markup).toContain("AI Copilot is currently pilot");
    expect(markup).toContain("controlled rollout");
    expect(markup).toContain("Visible child content");
  });

  it("renders beta messaging for beta routes without blocking the page", () => {
    const markup = renderGate({
      pathname: "/dashboard/pos",
    });

    expect(markup).toContain("POS is currently beta");
    expect(markup).toContain("rollout caution");
    expect(markup).toContain("Visible child content");
  });

  it("keeps allowlisted settings routes reachable even if a broad block prefix is present", () => {
    const markup = renderGate({
      pathname: "/dashboard/settings/modules",
      blockedPathPrefixes: ["/dashboard/settings"],
    });

    expect(markup).toContain("Visible child content");
    expect(markup).not.toContain("Module not enabled");
  });
});
