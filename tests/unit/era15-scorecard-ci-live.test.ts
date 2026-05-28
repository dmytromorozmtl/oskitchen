import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA15_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA15_PARENT_CERT_CHAINS,
  ERA15_REAUDIT_DECISION,
  ERA15_SCORECARD_DOCS,
  ERA15_SCORECARD_POLICY_ID,
  ERA15_SCORECARD_ROWS,
  ERA15_SMOKE_SCRIPTS,
} from "@/lib/governance/era15-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era15ScoreRowPattern(row: (typeof ERA15_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era15End}\\*\\*`;
  const start = String(row.era14End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era15 scorecard CI certification (live repo)", () => {
  it("locks era15 scorecard policy and five completed cycles", () => {
    expect(ERA15_SCORECARD_POLICY_ID).toBe("era15-scorecard-refresh-v1");
    expect(ERA15_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era15 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era15-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era15-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 15 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA15_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA15_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA15_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 15");
    expect(index).toContain("era15-scorecard-refresh-v1");
    expect(scorecard).toContain("era15-scorecard-refresh-v1");
    expect(promptInput).toContain("100");

    for (const row of ERA15_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era15ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era15ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era15ScoreRowPattern(row));
    }
  });

  it("documents Era 15 re-audit deferral with era16 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA15_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA15_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era15.md");
    expect(scorecard).toMatch(/Era 16|era 16/i);
  });

  it("retains era15 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA15_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("chains era15 cert-live modules from parent cert scripts", () => {
    const scripts = readPackageScripts();
    for (const chain of ERA15_PARENT_CERT_CHAINS) {
      expect(scripts[chain.parent], chain.parent).toContain(chain.certLiveModule);
    }
  });

  it("defines era15 smoke scripts in package.json", () => {
    const scripts = readPackageScripts();
    for (const name of ERA15_SMOKE_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("requires era15 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA15_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era15-scorecard-policy.ts"))).toBe(true);
  });
});
