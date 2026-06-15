import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA16_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA16_NEXT_ERA_DECISION,
  ERA16_PARENT_CERT_CHAINS,
  ERA16_REAUDIT_DECISION,
  ERA16_SCORECARD_DOCS,
  ERA16_SCORECARD_POLICY_ID,
  ERA16_SCORECARD_ROWS,
  ERA16_SMOKE_SCRIPTS,
} from "@/lib/governance/era16-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era16ScoreRowPattern(row: (typeof ERA16_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era16End}\\*\\*`;
  const start = String(row.era15End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era16 scorecard CI certification (live repo)", () => {
  it("locks era16 scorecard policy and twelve completed cycles", () => {
    expect(ERA16_SCORECARD_POLICY_ID).toBe("era16-scorecard-refresh-v1");
    expect(ERA16_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era16 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era16-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era16-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 16 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA16_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA16_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA16_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 16");
    expect(index).toContain("era16-scorecard-refresh-v1");
    expect(scorecard).toContain("era16-scorecard-refresh-v1");
    expect(promptInput).toContain("100");

    for (const row of ERA16_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era16ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era16ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era16ScoreRowPattern(row));
    }
  });

  it("documents Era 16 re-audit deferral with era17 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA16_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA16_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(ERA16_NEXT_ERA_DECISION.recommendEra17).toBe(true);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-28-era16.md");
    expect(scorecard).toMatch(/Era 17|era 17/i);
  });

  it("retains era16 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA16_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("chains era16 cert-live modules from parent cert scripts", () => {
    const scripts = readPackageScripts();
    for (const chain of ERA16_PARENT_CERT_CHAINS) {
      expect(scripts[chain.parent], chain.parent).toContain(chain.certLiveModule);
    }
  });

  it("defines era16 smoke scripts in package.json", () => {
    const scripts = readPackageScripts();
    for (const name of ERA16_SMOKE_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
  });

  it("requires era16 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA16_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era16-scorecard-policy.ts"))).toBe(true);
  });
});
