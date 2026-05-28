import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA5_COMPLETED_CYCLES,
  ERA5_GOVERNANCE_CERT_SCRIPTS,
  ERA5_REAUDIT_DECISION,
  ERA5_SCORECARD_DOCS,
  ERA5_SCORECARD_POLICY_ID,
  ERA5_SCORECARD_ROWS,
} from "@/lib/governance/era5-scorecard-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function era5ScoreRowPattern(row: (typeof ERA5_SCORECARD_ROWS)[number]): RegExp {
  const end = `\\*\\*${row.era5End}\\*\\*`;
  const start = String(row.era4End);
  const delta = row.delta >= 0 ? `\\+${row.delta}` : String(row.delta);
  return new RegExp(
    `${row.area.replace("/", "\\/")}[^\\n|]*\\|[^\\n|]*${start}[^\\n|]*\\|[^\\n|]*${end}[^\\n|]*\\|[^\\n|]*${delta}`,
  );
}

describe("era5 scorecard CI certification (live repo)", () => {
  it("locks era5 scorecard policy and five completed cycles", () => {
    expect(ERA5_SCORECARD_POLICY_ID).toBe("era5-scorecard-refresh-v1");
    expect(ERA5_COMPLETED_CYCLES).toHaveLength(5);
  });

  it("includes era5 scorecard tests in scorecard cert bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:scorecard:cert"]).toContain("era5-scorecard-ci-live.test.ts");
    expect(scripts["test:ci:scorecard:cert"]).toContain("era5-scorecard-policy.test.ts");
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:scorecard:cert");
  });

  it("publishes Era 5 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(join(ROOT, ERA5_SCORECARD_DOCS.canonicalIndex), "utf8");
    const scorecard = readFileSync(join(ROOT, ERA5_SCORECARD_DOCS.scorecard), "utf8");
    const promptInput = readFileSync(join(ROOT, ERA5_SCORECARD_DOCS.nextPromptInput), "utf8");

    expect(index).toContain("Evolution Era 5");
    expect(index).toContain("era5-scorecard-refresh-v1");
    expect(scorecard).toContain("era5-scorecard-refresh-v1");
    expect(promptInput).toContain("86");

    for (const row of ERA5_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(era5ScoreRowPattern(row));
      expect(scorecard, row.area).toMatch(era5ScoreRowPattern(row));
      expect(promptInput, row.area).toMatch(era5ScoreRowPattern(row));
    }
  });

  it("documents Era 5 re-audit deferral with era6 handoff", () => {
    const scorecard = readFileSync(join(ROOT, ERA5_SCORECARD_DOCS.scorecard), "utf8");
    expect(ERA5_REAUDIT_DECISION.fullReauditRequiredNow).toBe(false);
    expect(scorecard).toMatch(/Defer|defer/i);
    expect(scorecard).toContain("next-master-prompt-input-2026-05-27-era5.md");
    expect(scorecard).toMatch(/Era 6|era 6/i);
  });

  it("retains Era 4 governance cert chain in quality bundles", () => {
    const bundle = readPackageScripts()["test:ci:governance-bundles"];
    for (const script of ERA5_GOVERNANCE_CERT_SCRIPTS) {
      expect(bundle, script).toContain(script);
    }
  });

  it("requires era5 scorecard source docs on disk", () => {
    for (const rel of Object.values(ERA5_SCORECARD_DOCS)) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }
    expect(existsSync(join(ROOT, "lib/governance/era5-scorecard-policy.ts"))).toBe(true);
  });
});
