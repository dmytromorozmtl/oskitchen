import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
});

import { ErrorState } from "@/components/feedback/error-state";
import { ErrorStateIllustration } from "@/components/feedback/error-state-illustration";
import { RouteError } from "@/components/dashboard/route-states";
import { auditErrorStateFleet } from "@/lib/design/error-state-fleet-audit-policy";
import {
  ERROR_STATE_CARD_CLASS,
  ERROR_STATE_DARK_MODE_TOKENS,
  ERROR_STATE_FLEET_AUDIT_POLICY_ID,
  ERROR_STATE_ILLUSTRATION_TEST_ID,
  ERROR_STATE_PATTERNS_POLICY_ID,
  ERROR_STATE_TEST_ID,
} from "@/lib/design/error-state-patterns";

const ROOT = process.cwd();

describe("error state design system (Task 22)", () => {
  it("locks DES-34 fleet audit and illustration tokens", () => {
    expect(ERROR_STATE_FLEET_AUDIT_POLICY_ID).toBe("error-state-fleet-audit-des34-v1");
    expect(ERROR_STATE_ILLUSTRATION_TEST_ID).toBe("error-state-illustration");
    expect(ERROR_STATE_PATTERNS_POLICY_ID).toBe("error-state-patterns-des33-v1");
    expect(ERROR_STATE_DARK_MODE_TOKENS).toEqual([
      "dark:border-destructive/40",
      "dark:bg-destructive/10",
      "dark:text-destructive/80",
    ]);
    expect(ERROR_STATE_CARD_CLASS).toContain("dark:border-destructive/40");
    expect(ERROR_STATE_CARD_CLASS).toContain("dark:bg-destructive/10");
  });

  it("renders ErrorState with illustration, retry, and back link", () => {
    const markup = renderToStaticMarkup(
      createElement(ErrorState, {
        title: "Something went wrong",
        description: "Test failure",
        retryLabel: "Try again",
        onRetry: () => {},
      }),
    );
    expect(markup).toContain(`data-testid="${ERROR_STATE_TEST_ID}"`);
    expect(markup).toContain(`data-testid="${ERROR_STATE_ILLUSTRATION_TEST_ID}"`);
    expect(markup).toContain("Try again");
    expect(markup).toContain("Back to dashboard");
    expect(markup).toContain('role="alert"');
  });

  it("renders illustration with dark-mode-safe tokens", () => {
    const source = readFileSync(
      join(ROOT, "components/feedback/error-state-illustration.tsx"),
      "utf8",
    );
    expect(source).toContain("dark:text-destructive/80");
    const markup = renderToStaticMarkup(createElement(ErrorStateIllustration));
    expect(markup).toContain(`data-testid="${ERROR_STATE_ILLUSTRATION_TEST_ID}"`);
    expect(markup).toContain('aria-hidden="true"');
  });

  it("RouteError delegates to ErrorState with illustration", () => {
    const markup = renderToStaticMarkup(
      createElement(RouteError, {
        error: new Error("boom") as Error & { digest?: string },
        reset: () => {},
      }),
    );
    expect(markup).toContain(`data-testid="${ERROR_STATE_ILLUSTRATION_TEST_ID}"`);
    expect(markup).toContain("Something went wrong");
    expect(markup).toContain("Try again");
  });

  it("passes fleet audit for all dashboard error.tsx routes", () => {
    const report = auditErrorStateFleet(ROOT);
    expect(report.totalRoutes).toBeGreaterThanOrEqual(500);
    const failures = report.modules.filter((m) => !m.passed);
    expect(failures, failures.map((m) => m.module).join(", ")).toEqual([]);
    expect(report.passed).toBe(true);
  });
});
