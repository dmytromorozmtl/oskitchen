import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  // Legacy JSX components (jsx: preserve) expect React in scope during SSR render tests.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
});

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

import { PilotRouteError } from "@/components/dashboard/pilot-route-states";
import { RouteError } from "@/components/dashboard/route-states";
import { ERROR_STATE_TEST_ID } from "@/lib/design/error-state-patterns";
import {
  auditErrorBoundaryMarkup,
  renderDashboardRouteError,
  simulateErrorBoundaryRetry,
  SIMULATED_ROUTE_ERROR_MESSAGE,
} from "@/lib/testing/dashboard-error-boundary-harness";
import {
  CRITICAL_DASHBOARD_ERROR_ROUTE_COUNT,
  CRITICAL_DASHBOARD_ERROR_ROUTES,
  dashboardErrorModulePath,
} from "@/lib/testing/dashboard-error-boundary-policy";

describe("dashboard error boundary render (top-20)", () => {
  it("RouteError renders icon, message, and Try again on simulated throw", () => {
    const reset = vi.fn();
    const markup = renderToStaticMarkup(
      createElement(RouteError, {
        error: new Error(SIMULATED_ROUTE_ERROR_MESSAGE),
        reset,
      }),
    );

    const audit = auditErrorBoundaryMarkup(markup);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(markup).toContain(SIMULATED_ROUTE_ERROR_MESSAGE);
    simulateErrorBoundaryRetry(reset);
    expect(reset).toHaveBeenCalledOnce();
  });

  it("RouteError uses Reload page for RSC render failures", () => {
    const reset = vi.fn();
    const markup = renderToStaticMarkup(
      createElement(RouteError, {
        error: new Error("An error occurred in the Server Components render"),
        reset,
      }),
    );

    expect(markup).toContain("Reload page");
    expect(markup).toContain("failed to render");
  });

  it("RouteError uses Reload page for chunk load failures", () => {
    const reset = vi.fn();
    const markup = renderToStaticMarkup(
      createElement(RouteError, {
        error: new Error("Loading chunk 29251 failed."),
        reset,
      }),
    );

    expect(markup).toContain("Reload page");
    expect(markup).toContain("New version available");
    expect(markup).toContain("fetch the latest version");
  });

  it("PilotRouteError uses Reload page for chunk load failures", () => {
    const reset = vi.fn();
    const markup = renderToStaticMarkup(
      createElement(PilotRouteError, {
        error: new Error("ChunkLoadError: Loading chunk failed"),
        reset,
        title: "POS terminal unavailable",
      }),
    );

    expect(markup).toContain("Reload page");
    expect(markup).toContain("New version available");
  });

  it("PilotRouteError wires reset to Try again", () => {
    const reset = vi.fn();
    const markup = renderToStaticMarkup(
      createElement(PilotRouteError, {
        error: new Error("POS load failed"),
        reset,
        title: "POS terminal unavailable",
      }),
    );

    expect(markup).toContain("POS terminal unavailable");
    expect(markup).toContain("Try again");
    simulateErrorBoundaryRetry(reset);
    expect(reset).toHaveBeenCalledOnce();
  });

  it.each(CRITICAL_DASHBOARD_ERROR_ROUTES)(
    "renders %s with ErrorState + retry on simulated throw",
    async (routeFile) => {
      const mod = await import(dashboardErrorModulePath(routeFile));
      const reset = vi.fn();
      const markup = renderDashboardRouteError(mod.default, { reset });

      const audit = auditErrorBoundaryMarkup(markup);
      expect(audit.ok, `${routeFile}: ${audit.failures.join("; ")}`).toBe(true);
      expect(markup).toContain(`data-testid="${ERROR_STATE_TEST_ID}"`);

      simulateErrorBoundaryRetry(reset);
      expect(reset).toHaveBeenCalledOnce();
    },
  );

  it("covers all 20 pilot-critical error boundaries", () => {
    expect(CRITICAL_DASHBOARD_ERROR_ROUTE_COUNT).toBe(20);
  });
});
