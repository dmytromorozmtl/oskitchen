import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const usePathnameMock = vi.hoisted(() => vi.fn());
const sidebarNavMock = vi.hoisted(() => vi.fn());
const breadcrumbsMock = vi.hoisted(() => vi.fn());
const commandPaletteMock = vi.hoisted(() => vi.fn());
const billingGuardMock = vi.hoisted(() => vi.fn());
const trialBannerMock = vi.hoisted(() => vi.fn());
const brandSwitcherMock = vi.hoisted(() => vi.fn());

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

vi.mock("@/actions/auth", () => ({
  signOutAction: async () => {},
}));

vi.mock("@/components/dashboard/dashboard-nav", () => ({
  DashboardSidebarNav: (props: unknown) => {
    sidebarNavMock(props);
    return createElement("nav", { "data-testid": "sidebar-nav" }, "Sidebar");
  },
  DashboardBreadcrumbs: (props: unknown) => {
    breadcrumbsMock(props);
    return createElement("div", { "data-testid": "breadcrumbs" }, "Breadcrumbs");
  },
}));

vi.mock("@/components/dashboard/command-palette", () => ({
  CommandPalette: (props: unknown) => {
    commandPaletteMock(props);
    return createElement("div", { "data-testid": "command-palette" }, "CommandPalette");
  },
}));

vi.mock("@/components/billing/billing-access-guard", () => ({
  BillingAccessGuard: ({
    children,
    ...props
  }: {
    children: ReactNode;
  }) => {
    billingGuardMock(props);
    return createElement("div", { "data-testid": "billing-guard" }, children);
  },
}));

vi.mock("@/components/billing/trial-banner", () => ({
  TrialBanner: (props: unknown) => {
    trialBannerMock(props);
    return createElement("div", { "data-testid": "trial-banner" }, "TrialBanner");
  },
}));

vi.mock("@/components/brands/brand-switcher", () => ({
  BrandSwitcher: (props: unknown) => {
    brandSwitcherMock(props);
    return createElement("div", { "data-testid": "brand-switcher" }, "BrandSwitcher");
  },
}));

vi.mock("@/components/brands/brand-context", () => ({
  BrandContextProvider: ({ children }: { children: ReactNode }) =>
    createElement("div", { "data-testid": "brand-context" }, children),
}));

vi.mock("@/components/feedback/feedback-launcher", () => ({
  FeedbackLauncher: () => createElement("div", { "data-testid": "feedback-launcher" }, "FeedbackLauncher"),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => createElement("button", { type: "button" }, "Theme"),
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

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  DropdownMenuItem: ({
    children,
    disabled,
    asChild,
    ...props
  }: {
    children: ReactNode;
    disabled?: boolean;
    asChild?: boolean;
  }) =>
    asChild
      ? children
      : createElement("div", { "data-disabled": disabled ? "true" : "false", ...props }, children),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  DropdownMenuSeparator: () => createElement("hr"),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetTrigger: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetContent: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetHeader: ({ children }: { children: ReactNode }) => createElement("div", null, children),
  SheetTitle: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function renderShell(
  overrides: Partial<Parameters<typeof DashboardShell>[0]> = {},
) {
  usePathnameMock.mockReturnValue("/dashboard/today");
  return renderToStaticMarkup(
    createElement(
      DashboardShell,
      {
        userEmail: "owner@example.com",
        workspaceUserId: "owner-1",
        businessName: "OS Kitchen Demo",
        businessType: "MEAL_PREP",
        isOwner: true,
        userRole: "OWNER",
        locale: "en",
        children: createElement("div", null, "Shell content"),
        ...overrides,
      },
    ),
  );
}

describe("dashboard shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows owner account links, billing, and support mailto entries when support email exists", () => {
    const markup = renderShell({
      supportEmail: "support@example.com",
    });

    expect(markup).toContain("/dashboard/developer/api-keys");
    expect(markup).toContain("/dashboard/billing");
    expect(markup).toContain("/dashboard/staff");
    expect(markup).toContain("mailto:support@example.com?subject=OS%20Kitchen%20feedback");
    expect(markup).toContain("mailto:support@example.com?subject=OS%20Kitchen%20bug%20report");
    expect(markup).toContain("aria-label=\"Open account menu\"");
  });

  it("hides restricted account links for staff and shows support-email fallback messaging", () => {
    const markup = renderShell({
      isOwner: false,
      userRole: "STAFF",
      supportEmail: null,
    });

    expect(markup).not.toContain("/dashboard/developer/api-keys");
    expect(markup).not.toContain("/dashboard/billing");
    expect(markup).not.toContain("/dashboard/staff");
    expect(markup).toContain("Feedback (set NEXT_PUBLIC_SUPPORT_EMAIL)");
  });

  it("passes platform bypass and growth routes into shell children", () => {
    renderShell({
      isOwner: false,
      userRole: "STAFF",
      gtmSurfaceAccess: true,
      billingAccess: {
        trialExpiredNoPayment: true,
        devBypass: false,
        trialDaysRemaining: 0,
        platformBypass: true,
      },
    });

    expect(sidebarNavMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerExtras: [
          expect.objectContaining({ href: "/platform/dashboard" }),
        ],
        navContext: expect.objectContaining({
          fullNavAccess: true,
          isPlatformSuper: true,
          gtmSurfaceAccess: true,
        }),
      }),
    );
    expect(commandPaletteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fullNavAccess: true,
        isPlatformSuper: true,
        gtmSurfaceAccess: true,
        extraRoutes: expect.arrayContaining([
          expect.objectContaining({ href: "/dashboard/growth" }),
          expect.objectContaining({ href: "/dashboard/beta-applications" }),
          expect.objectContaining({ href: "/platform/dashboard" }),
        ]),
      }),
    );
  });

  it("suppresses effective billing lockout when platform bypass is active", () => {
    const markup = renderShell({
      isOwner: false,
      userRole: "STAFF",
      billingAccess: {
        trialExpiredNoPayment: true,
        devBypass: false,
        trialDaysRemaining: -3,
        platformBypass: true,
      },
    });

    expect(billingGuardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        trialExpiredNoPayment: false,
        isOwner: false,
      }),
    );
    expect(trialBannerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        trialExpired: false,
        isOwner: false,
      }),
    );
    expect(markup).toContain("/dashboard/billing");
  });

  it("forwards workspace brands and workspace user id into shell controls", () => {
    renderShell({
      workspaceUserId: "owner-search-1",
      workspaceBrands: [
        { id: "brand-1", name: "Brand 1", slug: "brand-1", active: true },
        { id: "brand-2", name: "Brand 2", slug: "brand-2", active: false },
      ],
    });

    expect(brandSwitcherMock).toHaveBeenCalledWith(
      expect.objectContaining({
        brands: [
          expect.objectContaining({ id: "brand-1" }),
          expect.objectContaining({ id: "brand-2" }),
        ],
      }),
    );
    expect(commandPaletteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        searchWorkspaceUserId: "owner-search-1",
      }),
    );
  });
});
