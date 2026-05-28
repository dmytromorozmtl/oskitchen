import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";

const ROOT = process.cwd();
const CANONICAL_INDEX = join(ROOT, "docs/canonical-doc-index.md");
const DEPRECATED_NOTICE = join(ROOT, "docs/_DEPRECATED_AUDIT_FAMILY.md");

const REQUIRED_SCRIPTS = ["test:ci:doc-canon", "test:ci:doc-canon:cert"] as const;

const CORE_CANON_DOCS = [
  "docs/system-reality-model.md",
  "docs/feature-maturity-matrix.md",
  "docs/p0-hardening-roadmap.md",
  "docs/rbac-permission-architecture.md",
  "docs/implementation-backlog.md",
  "docs/definition-of-done.md",
  "docs/qa-master-test-plan.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/enterprise-procurement-pack.md",
  "docs/product-positioning.md",
  "docs/competitor-feature-gap-matrix.md",
  "docs/kds-v1-scope.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

const ERA_CANON_DOCS = [
  "docs/full-strategic-reaudit-2026-05-27.md",
  "docs/next-master-prompt-input-2026-05-27.md",
] as const;

const GATEWAY_DEPRECATED_AUDITS = [
  "docs/enterprise-full-audit-26mayafter.md",
  "docs/KITCHENOS_FULL_FINAL_READINESS_AUDIT.md",
  "docs/PRODUCTION_READINESS_NEXT_PRIORITY_AUDIT.md",
] as const;

const REQUIRED_FILES = [
  "docs/canonical-doc-index.md",
  "docs/_DEPRECATED_AUDIT_FAMILY.md",
  "tests/unit/canonical-doc-index.test.ts",
  ...CORE_CANON_DOCS,
  ...ERA_CANON_DOCS,
  ...GATEWAY_DEPRECATED_AUDITS,
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("doc canon CI certification (live repo)", () => {
  it("defines doc canon unit bundle and wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:doc-canon"]).toContain("canonical-doc-index.test.ts");
    expect(scripts["test:ci:doc-canon:cert"]).toContain("doc-canon-ci-live.test.ts");
  });

  it("includes doc canon cert before unit bundle in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(governanceBundlesIncludesCert(scripts, "test:ci:doc-canon:cert")).toBe(true);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:doc-canon")).toBe(true);
    const platform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    expect(platform).toContain("test:ci:doc-canon:cert");
    expect(platform).toContain("npm run test:ci:doc-canon &&");
    expect(platform.indexOf("test:ci:doc-canon:cert")).toBeLessThan(
      platform.indexOf("npm run test:ci:doc-canon &&"),
    );
  });

  it("indexes core and era canon with deprecated-family governance", () => {
    expect(existsSync(CANONICAL_INDEX)).toBe(true);
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    expect(index).toContain("Core canon");
    expect(index).toContain("Era / strategic canon");
    expect(index).toContain("Deprecated families");
    expect(index).toContain("_DEPRECATED_AUDIT_FAMILY.md");
    expect(index).toContain("Cycle 27–28");

    expect(existsSync(DEPRECATED_NOTICE)).toBe(true);
    const notice = readFileSync(DEPRECATED_NOTICE, "utf8");
    expect(notice).toContain("canonical-doc-index.md");
    expect(notice).toContain("New audits forbidden");
  });

  it("marks high-traffic gateway audits with deprecation banners", () => {
    for (const rel of GATEWAY_DEPRECATED_AUDITS) {
      const content = readFileSync(join(ROOT, rel), "utf8");
      expect(content.startsWith("> **DEPRECATED"), rel).toBe(true);
      expect(content).toContain("canonical-doc-index.md");
    }
  });

  it("documents doc canon validation scripts in canonical index", () => {
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    expect(index).toContain("tests/unit/canonical-doc-index.test.ts");
    expect(index).toContain("test:ci:doc-canon");
  });

  it("requires doc canon artifacts on disk", () => {
    for (const rel of REQUIRED_FILES) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
  });
});
