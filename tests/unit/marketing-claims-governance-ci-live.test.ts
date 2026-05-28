import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  MARKETING_CLAIMS_CANONICAL_DOC_PATHS,
  MARKETING_CLAIMS_CI_SCRIPTS,
  MARKETING_CLAIMS_GOVERNANCE_POLICY_ID,
  MARKETING_CLAIMS_LINKED_POLICY_IDS,
  MARKETING_CLAIMS_REGISTRY_PATH,
  MARKETING_CLAIMS_SCAN_ROOTS,
  MARKETING_CLAIMS_UNIT_TESTS,
  findForbiddenPhraseViolations,
  findRoadmapTermViolations,
} from "@/lib/governance/marketing-claims-governance-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function readScannedMarketingText(): string {
  const chunks: string[] = [];
  for (const rel of MARKETING_CLAIMS_SCAN_ROOTS) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    try {
      const stat = statSync(full);
      if (stat.isFile()) {
        chunks.push(readFileSync(full, "utf8"));
        continue;
      }
      for (const name of readdirSync(full)) {
        const path = join(full, name);
        if (/\.(tsx?|md)$/.test(name) && statSync(path).isFile()) {
          chunks.push(readFileSync(path, "utf8"));
        }
      }
    } catch {
      /* skip */
    }
  }
  return chunks.join("\n");
}

describe("marketing claims governance CI certification (live repo)", () => {
  it("locks era7 marketing claims governance policy id", () => {
    expect(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID).toBe("era7-marketing-claims-governance-v1");
    expect(MARKETING_CLAIMS_LINKED_POLICY_IDS.length).toBeGreaterThanOrEqual(5);
  });

  it("defines marketing claims governance CI scripts in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of MARKETING_CLAIMS_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(governanceBundlesIncludesCert(scripts, "test:ci:marketing-claims-governance:cert")).toBe(
      true,
    );
    expect(governanceBundlesIncludesCert(scripts, "test:ci:marketing-claims-governance")).toBe(
      true,
    );
    expect(scripts["verify-claims"]).toContain("verify-marketing-claims.ts");
  });

  it("has policy module, claims registry, and unit tests on disk", () => {
    expect(existsSync(join(ROOT, "lib/governance/marketing-claims-governance-policy.ts"))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, MARKETING_CLAIMS_REGISTRY_PATH))).toBe(true);
    for (const rel of MARKETING_CLAIMS_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("scanned marketing surfaces contain no forbidden phrases", () => {
    const text = readScannedMarketingText();
    expect(text.length).toBeGreaterThan(100);
    const forbidden = findForbiddenPhraseViolations(text, "live-marketing-scan");
    expect(forbidden, forbidden.map((v) => v.termId).join(", ")).toEqual([]);
  });

  it("scanned marketing surfaces qualify roadmap integration terms", () => {
    const text = readScannedMarketingText();
    const roadmap = findRoadmapTermViolations(text, "live-marketing-scan");
    expect(roadmap, roadmap.map((v) => `${v.termId}: ${v.context}`).join("\n")).toEqual([]);
  });

  it("documents policy in canonical commercial and CI docs", () => {
    for (const rel of MARKETING_CLAIMS_CANONICAL_DOC_PATHS) {
      const content = readFileSync(join(ROOT, rel), "utf8");
      expect(content).toContain(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID);
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(MARKETING_CLAIMS_GOVERNANCE_POLICY_ID);
  });
});
