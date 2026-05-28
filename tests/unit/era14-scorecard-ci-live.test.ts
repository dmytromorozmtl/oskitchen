import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA14_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA14_PARENT_CERT_CHAINS,
  ERA14_REAUDIT_DECISION,
  ERA14_SCORECARD_DOCS,
  ERA14_SCORECARD_POLICY_ID,
  ERA14_SCORECARD_ROWS,
} from "@/lib/governance/era14-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era14ScoreRowPattern(row: (typeof ERA14_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era14End}\\*\\*`;
  const start = String(row.era13End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era14 scorecard CI certification (live repo)", () => {
  it("locks era14 scorecard policy and five completed cycles", () => {
    expect(ERA14_SCORECARD_POLICY_ID).toBe("era14-scorecard-refresh-v1");
    expect(ERA14_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era14 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era14-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era14-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 14 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA14_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA14_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA14_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 14");
    expect(index).toContain("era14-scorecard-refresh-v1");
    expect(scorecard).toContain("era14-scorecard-refresh-v1");
    expect(promptInput).toContain("100");

    for (const row of ERA14_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era14ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era14ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era14ScoreRowPattern(row));
    }
  });

  it("documents Era 14 re-audit deferral with era15 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA14_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA14_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era14.md");
    expect(scorecard).toMatch(/Era 15|era 15/i);
  });

  it("retains era14 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA14_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("chains era14 cert-live modules from parent cert scripts", () => {
    const scripts = readPackageScripts();
    for (const chain of ERA14_PARENT_CERT_CHAINS) {
      expect(scripts[chain.parent], chain.parent).toContain(chain.certLiveModule);
    }
  });

  it("requires era14 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA14_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era14-scorecard-policy.ts"))).toBe(true);
  });
});
