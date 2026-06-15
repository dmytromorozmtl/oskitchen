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

import { OfflineModeQueueBadge } from "@/components/dashboard/offline-mode-ui-indicator";
import { auditNewComponentsDarkModeWiring } from "@/lib/design/new-components-dark-mode-audit-audit";
import {
  auditNewComponentsDarkMode,
  findNewComponentsDarkModeViolations,
  NEW_COMPONENTS_DARK_MODE_AUDIT_POLICY_ID,
  NEW_COMPONENTS_DARK_MODE_CI_SCRIPTS,
  NEW_COMPONENTS_DARK_MODE_MODULES,
  NEW_COMPONENTS_DARK_MODE_UNIT_TEST,
} from "@/lib/design/new-components-dark-mode-audit-policy";

const ROOT = process.cwd();

vi.mock("@/hooks/use-offline-sync-status", () => ({
  useOfflineSyncStatus: () => ({
    online: false,
    queuedCount: 2,
    conflictCount: 0,
    syncState: "syncing" as const,
    refresh: async () => {},
  }),
}));

describe("new components dark mode audit (Absolute Final Task 63)", () => {
  it("locks policy and fleet module list for Tasks 56–62", () => {
    expect(NEW_COMPONENTS_DARK_MODE_AUDIT_POLICY_ID).toBe(
      "new-components-dark-mode-audit-absolute-final-v1",
    );
    expect(NEW_COMPONENTS_DARK_MODE_MODULES.length).toBeGreaterThanOrEqual(14);
    expect(NEW_COMPONENTS_DARK_MODE_MODULES).toContain("components/analytics/waterfall-chart.tsx");
    expect(NEW_COMPONENTS_DARK_MODE_MODULES).toContain("components/dashboard/offline-mode-ui-indicator.tsx");
  });

  it("detects light-only and missing dark signal in synthetic source", () => {
    const violations = findNewComponentsDarkModeViolations(`
      export function Demo() {
        return <div className="bg-white text-gray-900">oops</div>;
      }
    `);
    expect(violations.some((v) => v.kind === "light-only")).toBe(true);
    expect(violations.some((v) => v.kind === "missing-dark-signal")).toBe(true);
  });

  it("passes fleet audit for all new component modules", () => {
    const report = auditNewComponentsDarkMode(ROOT);
    const failures = report.modules.filter((m) => !m.passed);
    expect(
      failures,
      failures
        .map((m) => `${m.module}: ${m.violations.map((v) => `${v.kind}@${v.line ?? 0}`).join(",")}`)
        .join("; "),
    ).toEqual([]);
    expect(report.passed).toBe(true);
  });

  it("audits wiring paths and npm cert script", () => {
    const wiring = auditNewComponentsDarkModeWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of NEW_COMPONENTS_DARK_MODE_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(NEW_COMPONENTS_DARK_MODE_UNIT_TEST).toBe("tests/unit/new-components-dark-mode-audit.test.ts");
  });

  it("renders OfflineModeQueueBadge with theme-aware tone classes", () => {
    const markup = renderToStaticMarkup(createElement(OfflineModeQueueBadge, { compact: true }));
    expect(markup).not.toContain("bg-white");
    expect(markup).toContain("dark:bg-sky-500");
  });
});
