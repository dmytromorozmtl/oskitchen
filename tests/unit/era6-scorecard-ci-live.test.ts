import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA6_COMPLETED_CYCLES,
  ERA6_GOVERNANCE_CERT_SCRIPTS,
  ERA6_REAUDIT_DECISION,
  ERA6_SCORECARD_DOCS,
  ERA6_SCORECARD_POLICY_ID,
  ERA6_SCORECARD_ROWS,
} from "@/lib/governance/era6-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era6ScoreRowPattern(row: (typeof ERA6_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era6End}\\*\\*`;
  const start = String(row.era5End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era6 scorecard CI certification (live repo)", () => {
  it("locks era6 scorecard policy and five completed cycles", () => {
    expect(ERA6_SCORECARD_POLICY_ID).toBe("era6-scorecard-refresh-v1");
    expect(ERA6_COMPLETED_CYCLES).toHaveLength(5);
  });

  it("includes era6 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era6-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era6-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 6 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA6_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA6_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA6_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 6");
    expect(index).toContain("era6-scorecard-refresh-v1");
    expect(scorecard).toContain("era6-scorecard-refresh-v1");
    expect(promptInput).toContain("90");

    for (const row of ERA6_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era6ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era6ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era6ScoreRowPattern(row));
    }
  });

  it("documents Era 6 re-audit deferral with era7 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA6_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA6_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era6.md");
    expect(scorecard).toMatch(/Era 7|era 7/i);
  });

  it("retains governance cert chain including era6 additions", () => {
    const scripts = readPackageScripts();
    for (const script of ERA6_GOVERNANCE_CERT_SCRIPTS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era6 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA6_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era6-scorecard-policy.ts"))).toBe(true);
  });
});
