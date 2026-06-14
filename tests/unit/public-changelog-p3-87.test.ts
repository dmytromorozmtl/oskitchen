import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPublicChangelogP387,
  formatPublicChangelogP387AuditLines,
} from "@/lib/marketing/public-changelog-p3-87-audit";
import {
  publicChangelogHasAllMaturityLevels,
  publicChangelogMaturityCounts,
  PUBLIC_CHANGELOG_RELEASES,
} from "@/lib/marketing/public-changelog-p3-87-content";
import {
  PUBLIC_CHANGELOG_P3_87_ARTIFACT,
  PUBLIC_CHANGELOG_P3_87_CHECK_NPM_SCRIPT,
  PUBLIC_CHANGELOG_P3_87_CI_WORKFLOW,
  PUBLIC_CHANGELOG_P3_87_DOC,
  PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS,
  PUBLIC_CHANGELOG_P3_87_MIN_RELEASES,
  PUBLIC_CHANGELOG_P3_87_POLICY_ID,
  PUBLIC_CHANGELOG_P3_87_UNIT_TEST,
  PUBLIC_CHANGELOG_P3_87_WIRING_PATHS,
} from "@/lib/marketing/public-changelog-p3-87-policy";

const ROOT = process.cwd();

describe("Public changelog updates (P3-87)", () => {
  it("locks policy with 3+ releases and all maturity levels", () => {
    expect(PUBLIC_CHANGELOG_P3_87_POLICY_ID).toBe("public-changelog-updates-p3-87-v1");
    expect(PUBLIC_CHANGELOG_RELEASES.length).toBeGreaterThanOrEqual(
      PUBLIC_CHANGELOG_P3_87_MIN_RELEASES,
    );
    expect(publicChangelogHasAllMaturityLevels()).toBe(true);
    const counts = publicChangelogMaturityCounts();
    for (const level of PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS) {
      expect(counts[level]).toBeGreaterThan(0);
    }
  });

  it("passes full P3-87 public changelog audit", () => {
    const summary = auditPublicChangelogP387(ROOT);
    expect(summary.releasesDefined).toBe(true);
    expect(summary.allMaturityLevels).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-87 wiring paths, CI gate, and artifact", () => {
    for (const path of PUBLIC_CHANGELOG_P3_87_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PUBLIC_CHANGELOG_P3_87_CHECK_NPM_SCRIPT]).toContain(
      PUBLIC_CHANGELOG_P3_87_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, PUBLIC_CHANGELOG_P3_87_CI_WORKFLOW), "utf8");
    expect(ci).toContain(PUBLIC_CHANGELOG_P3_87_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, PUBLIC_CHANGELOG_P3_87_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(PUBLIC_CHANGELOG_P3_87_POLICY_ID);
    expect(artifact.releaseCount).toBeGreaterThanOrEqual(3);

    const doc = readFileSync(join(ROOT, PUBLIC_CHANGELOG_P3_87_DOC), "utf8");
    expect(doc).toContain(PUBLIC_CHANGELOG_P3_87_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditPublicChangelogP387(ROOT);
    const lines = formatPublicChangelogP387AuditLines(summary);
    expect(lines.some((line) => line.includes(PUBLIC_CHANGELOG_P3_87_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
