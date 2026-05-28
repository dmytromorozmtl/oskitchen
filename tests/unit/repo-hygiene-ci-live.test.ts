import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  REPO_HYGIENE_CANONICAL_DOC_MARKERS,
  REPO_HYGIENE_CANONICAL_DOC_PATHS,
  REPO_HYGIENE_CI_SCRIPTS,
  REPO_HYGIENE_POLICY_ID,
  REPO_HYGIENE_UNIT_TESTS,
  findForbiddenTrackedPaths,
} from "@/lib/ci/repo-hygiene-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function listTrackedPathsUnderTestsNodeModules(): string[] {
  try {
    const output = execSync("git ls-files tests/node_modules", {
      encoding: "utf8",
      cwd: ROOT,
    }).trim();
    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

describe("repo hygiene CI certification (live repo)", () => {
  it("locks era7 repo hygiene policy id", () => {
    expect(REPO_HYGIENE_POLICY_ID).toBe("era7-tests-node-modules-hygiene-v1");
  });

  it("defines repo hygiene CI scripts wired into governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of REPO_HYGIENE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:repo-hygiene:cert")).toBe(true);
    expect(governanceBundlesIncludesCert(scripts, "test:ci:repo-hygiene")).toBe(true);
  });

  it("has policy module and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/ci/repo-hygiene-policy.ts"))).toBe(true);
    for (const rel of REPO_HYGIENE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("does not track files under tests/node_modules", () => {
    const tracked = listTrackedPathsUnderTestsNodeModules();
    const forbidden = findForbiddenTrackedPaths(tracked);
    expect(forbidden, `tracked nested test install paths: ${forbidden.join(", ")}`).toEqual(
      [],
    );
  });

  it("documents hygiene policy in canonical docs", () => {
    for (const rel of REPO_HYGIENE_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of REPO_HYGIENE_CANONICAL_DOC_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(REPO_HYGIENE_POLICY_ID);
  });
});
