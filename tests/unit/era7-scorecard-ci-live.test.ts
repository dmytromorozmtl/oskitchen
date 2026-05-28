import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA7_GOVERNANCE_CERT_ADDITIONS,
  ERA7_REAUDIT_DECISION,
  ERA7_SCORECARD_DOCS,
  ERA7_SCORECARD_POLICY_ID,
  ERA7_SCORECARD_ROWS,
} from "@/lib/governance/era7-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era7ScoreRowPattern(row: (typeof ERA7_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era7End}\\*\\*`;
  const start = String(row.era6End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era7 scorecard CI certification (live repo)", () => {
  it("locks era7 scorecard policy and four completed cycles", () => {
    expect(ERA7_SCORECARD_POLICY_ID).toBe("era7-scorecard-refresh-v1");
    expect(ERA7_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era7 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era7-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era7-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 7 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA7_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA7_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA7_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 7");
    expect(index).toContain("era7-scorecard-refresh-v1");
    expect(scorecard).toContain("era7-scorecard-refresh-v1");
    expect(promptInput).toContain("92");

    for (const row of ERA7_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era7ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era7ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era7ScoreRowPattern(row));
    }
  });

  it("documents Era 7 re-audit deferral with era8 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA7_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA7_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era7.md");
    expect(scorecard).toMatch(/Era 8|era 8/i);
  });

  it("retains era7 governance cert additions in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA7_GOVERNANCE_CERT_ADDITIONS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era7 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA7_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era7-scorecard-policy.ts"))).toBe(true);
  });
});
