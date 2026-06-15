import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ERROR_STATE_TEST_ID } from "@/lib/design/error-state-patterns";

export const SIMULATED_ROUTE_ERROR_MESSAGE =
  "Simulated dashboard route crash for regression";

export type DashboardRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function renderDashboardRouteError(
  ErrorComponent: ComponentType<DashboardRouteErrorProps>,
  options?: {
    message?: string;
    digest?: string;
    reset?: () => void;
  },
): string {
  const reset = options?.reset ?? (() => {});
  const error = new Error(options?.message ?? SIMULATED_ROUTE_ERROR_MESSAGE) as Error & {
    digest?: string;
  };
  if (options?.digest) {
    error.digest = options.digest;
  }
  return renderToStaticMarkup(createElement(ErrorComponent, { error, reset }));
}

export function auditErrorBoundaryMarkup(markup: string): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (!markup.includes(`data-testid="${ERROR_STATE_TEST_ID}"`)) {
    failures.push("missing ErrorState data-testid");
  }

  if (!markup.includes('data-testid="error-state-illustration"')) {
    failures.push("missing ErrorState illustration");
  }

  if (!/Try again|Reload page/.test(markup)) {
    failures.push("missing retry button label");
  }

  if (!markup.includes("Back to dashboard")) {
    failures.push("missing back to dashboard link");
  }

  if (
    !markup.includes("Something went wrong") &&
    !markup.includes("POS terminal unavailable") &&
    !markup.includes("App updated")
  ) {
    failures.push("missing error title");
  }

  return { ok: failures.length === 0, failures };
}

/** Simulates the user tapping Retry — error boundaries must wire reset to onRetry. */
export function simulateErrorBoundaryRetry(reset: () => void): void {
  reset();
}
