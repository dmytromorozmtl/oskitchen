import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA9_GOVERNANCE_CERT_ADDITIONS,
  ERA9_REAUDIT_DECISION,
  ERA9_SCORECARD_DOCS,
  ERA9_SCORECARD_POLICY_ID,
  ERA9_SCORECARD_ROWS,
} from "@/lib/governance/era9-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era9ScoreRowPattern(row: (typeof ERA9_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era9End}\\*\\*`;
  const start = String(row.era8End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era9 scorecard CI certification (live repo)", () => {
  it("locks era9 scorecard policy and four completed cycles", () => {
    expect(ERA9_SCORECARD_POLICY_ID).toBe("era9-scorecard-refresh-v1");
    expect(ERA9_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era9 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era9-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era9-scorecard-policy.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("publishes Era 9 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA9_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA9_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA9_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 9");
    expect(index).toContain("era9-scorecard-refresh-v1");
    expect(scorecard).toContain("era9-scorecard-refresh-v1");
    expect(promptInput).toContain("96");

    for (const row of ERA9_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era9ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era9ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era9ScoreRowPattern(row));
    }
  });

  it("documents Era 9 re-audit deferral with era10 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA9_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA9_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era9.md");
    expect(scorecard).toMatch(/Era 10|era 10/i);
  });

  it("retains era9 governance cert additions in governance bundles", () => {
    const scripts = readPackageScripts();
    const platform = scripts["test:ci:governance-bundles:partition-platform"] ?? "";
    expect(platform).toContain("test:ci:typecheck-slice:cert");
    expect(scripts["test:ci:typecheck-slice:cert"]).toContain(
      "governance-bundles-partition-ci-live",
    );
    for (const script of ERA9_GOVERNANCE_CERT_ADDITIONS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("requires era9 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA9_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era9-scorecard-policy.ts"))).toBe(true);
  });
});
