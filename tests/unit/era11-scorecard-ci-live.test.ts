import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA11_GOVERNANCE_CERT_CHAIN_ANCHORS,
  ERA11_REAUDIT_DECISION,
  ERA11_SCORECARD_DOCS,
  ERA11_SCORECARD_POLICY_ID,
  ERA11_SCORECARD_ROWS,
} from "@/lib/governance/era11-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era11ScoreRowPattern(row: (typeof ERA11_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era11End}\\*\\*`;
  const start = String(row.era10End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era11 scorecard CI certification (live repo)", () => {
  it("locks era11 scorecard policy and four completed cycles", () => {
    expect(ERA11_SCORECARD_POLICY_ID).toBe("era11-scorecard-refresh-v1");
    expect(ERA11_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era11 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era11-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era11-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 11 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA11_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA11_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA11_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 11");
    expect(index).toContain("era11-scorecard-refresh-v1");
    expect(scorecard).toContain("era11-scorecard-refresh-v1");
    expect(promptInput).toContain("98");

    for (const row of ERA11_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era11ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era11ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era11ScoreRowPattern(row));
    }
  });

  it("documents Era 11 re-audit deferral with era12 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA11_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA11_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era11.md");
    expect(scorecard).toMatch(/Era 12|era 12/i);
  });

  it("retains era11 governance cert chain anchors in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA11_GOVERNANCE_CERT_CHAIN_ANCHORS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era11 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA11_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era11-scorecard-policy.ts"))).toBe(true);
  });
});
