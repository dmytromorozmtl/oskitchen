import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA13_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA13_REAUDIT_DECISION,
  ERA13_SCORECARD_DOCS,
  ERA13_SCORECARD_POLICY_ID,
  ERA13_SCORECARD_ROWS,
} from "@/lib/governance/era13-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era13ScoreRowPattern(row: (typeof ERA13_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era13End}\\*\\*`;
  const start = String(row.era12End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era13 scorecard CI certification (live repo)", () => {
  it("locks era13 scorecard policy and four completed cycles", () => {
    expect(ERA13_SCORECARD_POLICY_ID).toBe("era13-scorecard-refresh-v1");
    expect(ERA13_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era13 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era13-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era13-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 13 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA13_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA13_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA13_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 13");
    expect(index).toContain("era13-scorecard-refresh-v1");
    expect(scorecard).toContain("era13-scorecard-refresh-v1");
    expect(promptInput).toContain("100");

    for (const row of ERA13_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era13ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era13ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era13ScoreRowPattern(row));
    }
  });

  it("documents Era 13 re-audit deferral with era14 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA13_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA13_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era13.md");
    expect(scorecard).toMatch(/Era 14|era 14/i);
  });

  it("retains era13 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA13_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era13 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA13_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era13-scorecard-policy.ts"))).toBe(true);
  });
});
