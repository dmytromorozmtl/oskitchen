import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
});

import { ErrorState } from "@/components/feedback/error-state";
import {
  KDSSkeleton,
  MarketplaceSkeleton,
  POSSkeleton,
  TodaySkeleton,
} from "@/components/dashboard/async-page-skeletons";
import {
  auditErrorSkeletonDarkMode,
  ERROR_SKELETON_DARK_MODE_PATTERN_EXPORTS,
  ERROR_SKELETON_DARK_MODE_POLICY_ID,
  findErrorSkeletonDarkModeViolations,
} from "@/lib/design/error-skeleton-dark-mode-audit-policy";
import {
  ERROR_SKELETON_DARK_MODE_MODULES,
  SKELETON_DARK_MODE_TOKENS,
} from "@/lib/design/loading-skeleton-patterns";
import { ERROR_STATE_DARK_MODE_TOKENS } from "@/lib/design/error-state-patterns";

const ROOT = process.cwd();

describe("error and skeleton dark mode audit (Task 25)", () => {
  it("locks DES-37 policy and shared dark-mode tokens", () => {
    expect(ERROR_SKELETON_DARK_MODE_POLICY_ID).toBe("error-skeleton-dark-mode-audit-des37-v1");
    expect(ERROR_SKELETON_DARK_MODE_MODULES).toHaveLength(11);
    expect(SKELETON_DARK_MODE_TOKENS).toContain("dark:bg-muted/40");
    expect(ERROR_STATE_DARK_MODE_TOKENS).toContain("dark:bg-destructive/10");
    expect(ERROR_SKELETON_DARK_MODE_PATTERN_EXPORTS.skeletonPulse).toContain("dark:bg-muted/40");
  });

  it("detects missing dark-mode signal in synthetic source", () => {
    const violations = findErrorSkeletonDarkModeViolations(`
      export function Demo() {
        return <div className="bg-white text-black">oops</div>;
      }
    `);
    expect(violations.some((v) => v.kind === "light-only")).toBe(true);
    expect(violations.some((v) => v.kind === "missing-dark-signal")).toBe(true);
  });

  it("passes fleet audit for all error and skeleton modules", () => {
    const report = auditErrorSkeletonDarkMode(ROOT);
    const failures = report.modules.filter((m) => !m.passed);
    expect(
      failures,
      failures
        .map((m) => `${m.module}: ${m.violations.map((v) => v.kind).join(",")}`)
        .join("; "),
    ).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it.each([
    ["TodaySkeleton", TodaySkeleton],
    ["MarketplaceSkeleton", MarketplaceSkeleton],
    ["POSSkeleton", POSSkeleton],
    ["KDSSkeleton", KDSSkeleton],
  ] as const)("renders %s without light-only surface classes", (_name, Component) => {
    const markup = renderToStaticMarkup(createElement(Component));
    expect(markup).not.toContain("bg-white");
    expect(markup).toContain("animate-pulse");
  });

  it("renders ErrorState with dark-mode card classes", () => {
    const markup = renderToStaticMarkup(
      createElement(ErrorState, {
        description: "Failed",
        retryLabel: "Try again",
        onRetry: () => {},
      }),
    );
    expect(markup).toContain("dark:border-destructive/40");
    expect(markup).toContain("dark:bg-destructive/10");
    expect(markup).toContain('data-testid="error-state-illustration"');
  });
});
