import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { governanceBundlesIncludesCert } from "@/lib/ci/governance-bundles-partition-policy";
import {
  ERA4_COMPLETED_CYCLES,
  ERA4_GOVERNANCE_CERT_SCRIPTS,
  ERA4_SCORECARD_DOCS,
  ERA4_SCORECARD_POLICY_ID,
  ERA4_SCORECARD_ROWS,
  ERA4_REAUDIT_DECISION,
} from "@/lib/governance/era4-scorecard-policy";

const ROOT = process.cwd();
const CANONICAL_INDEX = join(ROOT, ERA4_SCORECARD_DOCS.canonicalIndex);
const ERA4_SCORECARD = join(ROOT, ERA4_SCORECARD_DOCS.scorecard);
const ERA4_PROMPT_INPUT = join(ROOT, ERA4_SCORECARD_DOCS.nextPromptInput);
const REAUDIT = join(ROOT, ERA4_SCORECARD_DOCS.strategicReaudit);

/** Era 3 increment (still referenced for continuity). */
const ERA3_SCORECARD_ROWS = [
  { area: "Overall", start: 71, end: 73, delta: 2 },
  { area: "DevOps", start: 75, end: 78, delta: 3 },
  { area: "QA", start: 71, end: 75, delta: 4 },
] as const;

const REQUIRED_SCRIPTS = ["test:ci:scorecard:cert"] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era4ScoreRowPattern(row: (typeof ERA4_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era4End}\\*\\*`;
  const start = String(row.era3End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("scorecard CI certification (live repo)", () => {
  it("defines scorecard wiring cert script in governance bundles", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:scorecard:cert"]).toContain("scorecard-ci-live.test.ts");
    expect(governanceBundlesIncludesCert(scripts, "test:ci:scorecard:cert")).toBe(true);
  });

  it("chains Era 4 governance cert scripts in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    for (const script of ERA4_GOVERNANCE_CERT_SCRIPTS) {
      expect(governanceBundlesIncludesCert(scripts, script), script).toBe(true);
    }
  });

  it("locks era4 scorecard policy and twelve completed cycles", () => {
    expect(ERA4_SCORECARD_POLICY_ID).toBe("era4-scorecard-refresh-v1");
    expect(ERA4_COMPLETED_CYCLES).toHaveLength(12);
  });

  it("publishes Era 4 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    const scorecard = readFileSync(ERA4_SCORECARD, "utf8");
    const promptInput = readFileSync(ERA4_PROMPT_INPUT, "utf8");

    expect(index).toContain("Evolution Era 4");
    expect(index).toContain("era4-scorecard-refresh-v1");
    expect(scorecard).toContain("era4-scorecard-refresh-v1");
    expect(promptInput).toContain("82");

    for (const row of ERA4_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era4ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era4ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era4ScoreRowPattern(row));
    }
  });

  it("documents Era 4 re-audit deferral with era5 handoff", () => {
    const scorecard = readFileSync(ERA4_SCORECARD, "utf8");
    expect(ERA4_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era4.md");
    expect(scorecard).toMatch(/Era 5|era 5/i);
  });

  it("retains Era 3 increment rows in canonical index for continuity", () => {
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    expect(index).toContain("Evolution Era 3 increment");
    for (const row of ERA3_SCORECARD_ROWS) {
      expect(index, row.area).toContain(String(row.end));
    }
  });

  it("requires scorecard source docs on disk", () => {
    for (const rel of [CANONICAL_INDEX, ERA4_SCORECARD, ERA4_PROMPT_INPUT, REAUDIT]) {
      expect(existsSync(rel)).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era4-scorecard-policy.ts"))).toBe(true);
  });
});
