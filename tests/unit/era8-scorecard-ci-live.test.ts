import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA8_GOVERNANCE_CERT_ADDITIONS,
  ERA8_REAUDIT_DECISION,
  ERA8_SCORECARD_DOCS,
  ERA8_SCORECARD_POLICY_ID,
  ERA8_SCORECARD_ROWS,
} from "@/lib/governance/era8-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era8ScoreRowPattern(row: (typeof ERA8_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era8End}\\*\\*`;
  const start = String(row.era7End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era8 scorecard CI certification (live repo)", () => {
  it("locks era8 scorecard policy and four completed cycles", () => {
    expect(ERA8_SCORECARD_POLICY_ID).toBe("era8-scorecard-refresh-v1");
    expect(ERA8_SCORECARD_ROWS).toHaveLength(12);
  });

  it("includes era8 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era8-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era8-scorecard-policy.test.ts");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:scorecard:cert");
  });

  it("publishes Era 8 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA8_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA8_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA8_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 8");
    expect(index).toContain("era8-scorecard-refresh-v1");
    expect(scorecard).toContain("era8-scorecard-refresh-v1");
    expect(promptInput).toContain("94");

    for (const row of ERA8_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era8ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era8ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era8ScoreRowPattern(row));
    }
  });

  it("documents Era 8 re-audit deferral with era9 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA8_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA8_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era8.md");
    expect(scorecard).toMatch(/Era 9|era 9/i);
  });

  it("retains era8 governance cert additions in governance bundles", () => {
    const bundle = readPackageScripts()["test:ci:governance-bundles"];
    for (const script of ERA8_GOVERNANCE_CERT_ADDITIONS) {
      expect(bundle, script).toContain(script);
    }
  });

  it("requires era8 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA8_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era8-scorecard-policy.ts"))).toBe(true);
  });
});
