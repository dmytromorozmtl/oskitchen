import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  NAV_PAGE_MATURITY_ERA14_CANONICAL_DOC_PATHS,
  NAV_PAGE_MATURITY_ERA14_CI_SCRIPTS,
  NAV_PAGE_MATURITY_ERA14_GAP_CLOSURE_PREFIXES,
  NAV_PAGE_MATURITY_ERA14_POLICY_ID,
  NAV_PAGE_MATURITY_ERA14_UNIT_TESTS,
  findNavPageMaturityHonestyGaps,
} from "@/lib/navigation/nav-page-maturity-era14-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("nav page maturity era14 CI certification (live repo)", () => {
  it("locks era14 nav page maturity recert policy id", () => {
    expect(NAV_PAGE_MATURITY_ERA14_POLICY_ID).toBe("era14-nav-page-maturity-recert-v1");
  });

  it("defines era14 nav page maturity scripts", () => {
    const scripts = readPackageScripts();
    for (const name of NAV_PAGE_MATURITY_ERA14_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:page-maturity-sweep:cert"]).toContain(
      "nav-page-maturity-era14-cert-live",
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:page-maturity-sweep:cert")).toBe(
      true,
    );
  });

  it("registers era14 gap closure prefixes in nav maturity rules", () => {
    const governance = readFileSync(
      join(ROOT, "lib/navigation/nav-maturity-governance.ts"),
      "utf8",
    );
    for (const prefix of NAV_PAGE_MATURITY_ERA14_GAP_CLOSURE_PREFIXES) {
      expect(governance).toContain(prefix);
    }
  });

  it("documents era14 nav page maturity recert in canonical docs", () => {
    for (const rel of NAV_PAGE_MATURITY_ERA14_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(NAV_PAGE_MATURITY_ERA14_POLICY_ID.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(NAV_PAGE_MATURITY_ERA14_POLICY_ID);
    for (const rel of NAV_PAGE_MATURITY_ERA14_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("has no focused-nav preview/placeholder honesty gaps", () => {
    expect(findNavPageMaturityHonestyGaps()).toEqual([]);
  });
});
