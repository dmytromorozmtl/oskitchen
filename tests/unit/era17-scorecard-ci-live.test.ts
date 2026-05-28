import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA17_BLENDED_OVERALL,
  ERA17_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA17_NEXT_ERA_DECISION,
  ERA17_REAUDIT_DECISION,
  ERA17_SCORECARD_DOCS,
  ERA17_SCORECARD_POLICY_ID,
  ERA17_SCORECARD_ROWS,
  ERA17_SMOKE_SCRIPTS,
  ERA17_SUCCESS_CRITERIA,
} from "@/lib/governance/era17-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era17ScoreRowPattern(row: (typeof ERA17_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era17End}\\*\\*`;
  const start = String(row.era16End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era17 scorecard CI certification (live repo)", () => {
  it("locks era17 scorecard policy and twelve completed cycles", () => {
    expect(ERA17_SCORECARD_POLICY_ID).toBe("era17-scorecard-refresh-v1");
    expect(ERA17_SCORECARD_ROWS).toHaveLength(12);
    expect(ERA17_SUCCESS_CRITERIA.allMet).toBe(false);
  });

  it("includes era17 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era17-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era17-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 17 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA17_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA17_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA17_SCORECARD_DOCS.nextPromptInput), "utf8");
    const executionMap = readFileSync(join(ROOT, ERA17_SCORECARD_DOCS.executionMap), "utf8");

    expect(index).toContain("Evolution Era 17");
    expect(index).toContain("era17-scorecard-refresh-v1");
    expect(scorecard).toContain("era17-scorecard-refresh-v1");
    expect(promptInput).toContain(String(ERA17_BLENDED_OVERALL.era17End));
    expect(executionMap).toContain("era17-scorecard-refresh-v1");

    for (const row of ERA17_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era17ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era17ScoreRowPattern(row));
    }
  });

  it("documents Era 17 re-audit deferral with era18 handoff recommendation", () => {
    const scorecard = readFileSync(join(ROOT, ERA17_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA17_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(ERA17_NEXT_ERA_DECISION.recommendEra18Handoff).toBe(true);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toMatch(/Era 18|era 18/i);
    expect(scorecard).toContain("NOT MET");
  });

  it("retains era17 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA17_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(scripts[script], script).toBeTruthy();
    }
  });

  it("defines era17 smoke scripts in package.json", () => {
    const scripts = readPackageScripts();
    for (const name of ERA17_SMOKE_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("requires era17 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA17_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era17-scorecard-policy.ts"))).toBe(true);
  });
});
