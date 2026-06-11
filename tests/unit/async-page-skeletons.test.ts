import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react") as typeof import("react");
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
});

import {
  InventorySkeleton,
  KDSSkeleton,
  MarketplaceSkeleton,
  POSSkeleton,
  TodaySkeleton,
} from "@/components/dashboard/async-page-skeletons";
import { auditSkeletonLayoutStability, auditSkeletonMarkup } from "@/lib/testing/suspense-skeleton-harness";
import {
  ASYNC_PAGE_SKELETON_COMPONENTS,
  LOADING_SKELETON_CRITICAL_MODULES,
} from "@/lib/design/loading-skeleton-patterns";
import { auditLoadingSkeletonModule } from "@/lib/design/loading-skeleton-audit-policy";

const ROOT = process.cwd();

describe("async page skeletons (Task 21)", () => {
  it("exports five pilot-critical skeleton components", () => {
    expect(ASYNC_PAGE_SKELETON_COMPONENTS).toHaveLength(5);
    for (const path of ASYNC_PAGE_SKELETON_COMPONENTS) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });

  it.each([
    ["TodaySkeleton", TodaySkeleton, undefined],
    ["MarketplaceSkeleton", MarketplaceSkeleton, undefined],
    ["POSSkeleton", POSSkeleton, undefined],
    ["KDSSkeleton", KDSSkeleton, undefined],
    ["InventorySkeleton", InventorySkeleton, undefined],
  ] as const)("renders %s with pulse and stable layout", (_name, Component) => {
    const markup = renderToStaticMarkup(createElement(Component));
    const audit = auditSkeletonMarkup(markup);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(markup).toContain("animate-pulse");
  });

  it("POSSkeleton register section reserves cart column height", () => {
    const markup = renderToStaticMarkup(createElement(POSSkeleton, { section: "register" }));
    expect(markup).toContain('data-testid="pos-skeleton-register"');
    expect(markup).toContain("min-h-[480px]");
  });

  it("KDSSkeleton production section uses dark-mode-safe surfaces", () => {
    const source = readFileSync(join(ROOT, "components/dashboard/kds-skeleton.tsx"), "utf8");
    const audit = auditSkeletonLayoutStability(source);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("wires marketplace, POS hub, KDS, and inventory loading routes to named skeletons", () => {
    for (const modulePath of [
      "app/dashboard/marketplace/loading.tsx",
      "app/dashboard/pos/loading.tsx",
      "app/dashboard/kitchen/loading.tsx",
      "app/dashboard/inventory/loading.tsx",
    ]) {
      const audit = auditLoadingSkeletonModule(modulePath, ROOT);
      expect(audit.passed, modulePath).toBe(true);
      expect(audit.usesSkeletonPrimitive, modulePath).toBe(true);
    }
  });

  it("passes full critical loading module audit including new routes", () => {
    for (const modulePath of LOADING_SKELETON_CRITICAL_MODULES) {
      const audit = auditLoadingSkeletonModule(modulePath, ROOT);
      expect(audit.passed, modulePath).toBe(true);
    }
  });
});
