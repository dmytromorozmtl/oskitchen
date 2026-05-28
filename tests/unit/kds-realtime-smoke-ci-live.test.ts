import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  KDS_REALTIME_FORBIDDEN_GTM_PHRASES,
  KDS_REALTIME_SMOKE_CI_SCRIPTS,
  KDS_REALTIME_SMOKE_POLICY_ID,
  KDS_REALTIME_SMOKE_UNIT_TESTS,
} from "@/lib/kitchen/kds-realtime-smoke-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("kds realtime smoke CI certification (live repo)", () => {
  it("locks era6 kds realtime smoke policy id", () => {
    expect(KDS_REALTIME_SMOKE_POLICY_ID).toBe("era6-kds-realtime-smoke-v1");
  });

  it("defines realtime smoke CI scripts in package.json", () => {
    const scripts = readPackageScripts();
    for (const name of KDS_REALTIME_SMOKE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-realtime-smoke"]).toContain("kds-realtime-smoke-wiring");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-realtime-smoke:cert")).toBe(true);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:kds-realtime-smoke")).toBe(true);
  });

  it("has policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/kitchen/kds-realtime-smoke-policy.ts"))).toBe(true);
    for (const rel of KDS_REALTIME_SMOKE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("documents realtime smoke in feature matrix without forbidden claims", () => {
    const matrix = readFileSync(join(ROOT, "docs/feature-maturity-matrix.md"), "utf8");
    expect(matrix).toContain("era6-kds-realtime-smoke-v1");
    expect(matrix).toMatch(/poll fallback|realtime smoke/i);
    for (const phrase of KDS_REALTIME_FORBIDDEN_GTM_PHRASES) {
      expect(matrix, `forbidden phrase "${phrase}"`).not.toContain(phrase);
    }
  });

  it("extends staging checklist with realtime tier", () => {
    const checklist = readFileSync(join(ROOT, "docs/kds-staging-smoke-checklist.md"), "utf8");
    expect(checklist).toContain("era6-kds-realtime-smoke-v1");
    expect(checklist).toMatch(/Tier D|Realtime verification/i);
  });
});
