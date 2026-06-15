import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA12_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA12_REAUDIT_DECISION,
  ERA12_SCORECARD_DOCS,
  ERA12_SCORECARD_POLICY_ID,
  ERA12_SCORECARD_ROWS,
} from "@/lib/governance/era12-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era12ScoreRowPattern(row: (typeof ERA12_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era12End}\\*\\*`;
  const start = String(row.era11End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era12 scorecard CI certification (live repo)", () => {
  it("locks era12 scorecard policy and four completed cycles", () => {
    expect(ERA12_SCORECARD_POLICY_ID).toBe("era12-scorecard-refresh-v1");
    expect(ERA12_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era12 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era12-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era12-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 12 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA12_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA12_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA12_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 12");
    expect(index).toContain("era12-scorecard-refresh-v1");
    expect(scorecard).toContain("era12-scorecard-refresh-v1");
    expect(promptInput).toContain("99");

    for (const row of ERA12_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era12ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era12ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era12ScoreRowPattern(row));
    }
  });

  it("documents Era 12 re-audit deferral with era13 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA12_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA12_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era12.md");
    expect(scorecard).toMatch(/Era 13|era 13/i);
  });

  it("retains era12 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA12_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era12 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA12_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era12-scorecard-policy.ts"))).toBe(true);
  });
});
