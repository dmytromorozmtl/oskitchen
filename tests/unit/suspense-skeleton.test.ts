import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
});

import { DashboardPageSkeleton, PageSkeleton } from "@/components/feedback/loading-skeleton";
import { TodaySkeleton } from "@/components/dashboard/today-skeleton";
import {
  auditSkeletonLayoutStability,
  auditSkeletonMarkup,
  countSuspenseBoundaries,
  runWithSlowNetworkThrottle,
  waitForSuspenseBoundary,
} from "@/lib/testing/suspense-skeleton-harness";
import {
  SUSPENSE_SKELETON_CRITICAL_LOADING_MODULES,
  SUSPENSE_SKELETON_PAGE_PATH,
  SUSPENSE_SKELETON_POLICY_ID,
  SUSPENSE_SKELETON_SLOW_NETWORK_MS,
  SUSPENSE_SKELETON_TODAY_SECTIONS,
  SUSPENSE_SKELETON_MAX_HANG_MS,
} from "@/lib/testing/suspense-skeleton-policy";
import { auditLoadingSkeletonModule } from "@/lib/design/loading-skeleton-audit-policy";

const ROOT = process.cwd();

function renderSkeletonMarkup(
  section?: "hero" | "wizard" | "playbook",
): string {
  return renderToStaticMarkup(createElement(TodaySkeleton, { section }));
}

describe("Suspense / skeleton tests (Task 19)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks suspense skeleton policy", () => {
    expect(SUSPENSE_SKELETON_POLICY_ID).toBe("absolute-final-suspense-skeleton-v1");
    expect(SUSPENSE_SKELETON_TODAY_SECTIONS).toHaveLength(3);
  });

  it.each(SUSPENSE_SKELETON_TODAY_SECTIONS)(
    "renders $id skeleton with pulse, aria-busy, and stable layout",
    ({ id }) => {
      const markup = renderSkeletonMarkup(id as "hero" | "wizard" | "playbook");
      const audit = auditSkeletonMarkup(markup);
      expect(audit.ok, audit.failures.join("; ")).toBe(true);
    },
  );

  it("TodaySkeleton source passes layout stability audit (no CLS flash)", () => {
    const source = readFileSync(join(ROOT, "components/dashboard/today-skeleton.tsx"), "utf8");
    const audit = auditSkeletonLayoutStability(source);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("DashboardPageSkeleton renders page-level fallback without layout collapse", () => {
    const markup = renderToStaticMarkup(createElement(DashboardPageSkeleton));
    const audit = auditSkeletonMarkup(markup);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(markup).toContain('data-testid="page-skeleton"');
  });

  it("PageSkeleton uses pulse placeholders for slow route loading", () => {
    const markup = renderToStaticMarkup(createElement(PageSkeleton));
    expect(markup).toContain("animate-pulse");
    expect(markup).toContain('aria-busy="true"');
  });

  it("simulates slow network throttle before async section resolves", async () => {
    const throttleMs = 40;
    const { result, elapsedMs } = await runWithSlowNetworkThrottle(
      async () => "section-ready",
      throttleMs,
    );
    expect(result).toBe("section-ready");
    expect(elapsedMs).toBeGreaterThanOrEqual(throttleMs - 5);
  });

  it("resolves Suspense boundary under slow network within hang budget", async () => {
    vi.useFakeTimers();
    const promise = waitForSuspenseBoundary(async () => "loaded", {
      throttleMs: SUSPENSE_SKELETON_SLOW_NETWORK_MS,
      maxWaitMs: SUSPENSE_SKELETON_MAX_HANG_MS,
    });
    await vi.advanceTimersByTimeAsync(SUSPENSE_SKELETON_SLOW_NETWORK_MS);
    await expect(promise).resolves.toBe("loaded");
  });

  it("rejects when Suspense boundary hangs beyond max wait", async () => {
    vi.useFakeTimers();
    const promise = waitForSuspenseBoundary(async () => "loaded", {
      throttleMs: SUSPENSE_SKELETON_MAX_HANG_MS + 500,
      maxWaitMs: SUSPENSE_SKELETON_MAX_HANG_MS,
    });
    const assertion = expect(promise).rejects.toThrow(/hung/);
    await vi.advanceTimersByTimeAsync(SUSPENSE_SKELETON_MAX_HANG_MS);
    await assertion;
  });

  it("Today page wires three Suspense fallbacks to TodaySkeleton sections", () => {
    const page = readFileSync(join(ROOT, SUSPENSE_SKELETON_PAGE_PATH), "utf8");
    const skeletonSource = readFileSync(
      join(ROOT, "components/dashboard/today-skeleton.tsx"),
      "utf8",
    );
    expect(countSuspenseBoundaries(page)).toBeGreaterThanOrEqual(3);

    for (const section of SUSPENSE_SKELETON_TODAY_SECTIONS) {
      expect(page).toContain(section.suspenseFallback);
      expect(page).toContain(section.asyncComponent);
      expect(skeletonSource).toContain(section.testId);
    }
  });

  it.each(SUSPENSE_SKELETON_CRITICAL_LOADING_MODULES)(
    "critical loading module %s uses skeleton primitive",
    (modulePath) => {
      const audit = auditLoadingSkeletonModule(modulePath, ROOT);
      expect(audit.passed, modulePath).toBe(true);
    },
  );
});
