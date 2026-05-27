import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CANONICAL_INDEX = join(ROOT, "docs/canonical-doc-index.md");
const REAUDIT = join(ROOT, "docs/full-strategic-reaudit-2026-05-27.md");
const PROMPT_INPUT = join(ROOT, "docs/next-master-prompt-input-2026-05-27.md");

const REQUIRED_SCRIPTS = ["test:ci:scorecard:cert"] as const;

/** Era 3 increment (cycles 42–51 governance CI certification). Must match canonical docs. */
const ERA3_SCORECARD_ROWS = [
  { area: "Overall", start: 71, end: 73, delta: 2 },
  { area: "DevOps", start: 75, end: 78, delta: 3 },
  { area: "QA", start: 71, end: 75, delta: 4 },
  { area: "Backend/API", start: 71, end: 72, delta: 1 },
  { area: "Integrations", start: 50, end: 51, delta: 1 },
  { area: "Marketing/sales", start: 62, end: 63, delta: 1 },
  { area: "Security", start: 66, end: 67, delta: 1 },
] as const;

const GOVERNANCE_CERT_SCRIPTS = [
  "test:ci:doc-canon:cert",
  "test:ci:public-api-v1:cert",
  "test:ci:nav-governance:cert",
  "test:ci:integration-honesty:cert",
  "test:ci:storefront-money-path:cert",
  "test:ci:pos-money-path:cert",
  "test:ci:inventory-depletion:cert",
  "test:ci:cron-hygiene:cert",
  "test:ci:kds-v1:cert",
  "test:ci:kds-v1:prototype:cert",
  "test:ci:scorecard:cert",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function scoreRowPattern(row: (typeof ERA3_SCORECARD_ROWS)[number], boldEnd = true): RegExp {
  const end = boldEnd ? `\\*\\*${row.end}\\*\\*` : String(row.end);
  const start = String(row.start);
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
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:scorecard:cert");
  });

  it("chains all governance cert scripts in default quality governance bundles", () => {
    const bundle = readPackageScripts()["test:ci:governance-bundles"];
    for (const script of GOVERNANCE_CERT_SCRIPTS) {
      expect(bundle, script).toContain(script);
    }
  });

  it("publishes Era 3 scorecard increment consistently across canonical docs", () => {
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    const reaudit = readFileSync(REAUDIT, "utf8");
    const promptInput = readFileSync(PROMPT_INPUT, "utf8");

    expect(index).toContain("Evolution Era 3 increment");
    expect(reaudit).toContain("Step 20 — Evolution Era 3 Scorecard Increment");
    expect(promptInput).toContain("Evolution Era 3 increment");

    for (const row of ERA3_SCORECARD_ROWS) {
      expect(index, row.area).toMatch(scoreRowPattern(row, false));
      expect(reaudit, row.area).toMatch(scoreRowPattern(row));
      expect(promptInput, row.area).toMatch(scoreRowPattern(row, false));
    }
  });

  it("documents re-audit deferral and resolved CI wiring gap", () => {
    const reaudit = readFileSync(REAUDIT, "utf8");
    expect(reaudit).toContain("Full new re-audit required now?");
    expect(reaudit).toMatch(/Defer|No.*Era 2 scorecard|No.*incremental/i);
    expect(reaudit).toContain("CI wiring");
    expect(reaudit).toMatch(/governance-bundles|test:ci:.*:cert/);
    expect(reaudit).toMatch(/resolved|✅|RESOLVED/i);
  });

  it("records Era 3 governance certification cycles in canonical index ledger", () => {
    const index = readFileSync(CANONICAL_INDEX, "utf8");
    expect(index).toContain("Evolution Era 3 cycle ledger");
    expect(index).toContain("| 42 |");
    expect(index).toContain("test:ci:governance-bundles");
    expect(index).toContain("test:ci:scorecard:cert");
  });

  it("requires scorecard source docs on disk", () => {
    for (const rel of [CANONICAL_INDEX, REAUDIT, PROMPT_INPUT]) {
      expect(existsSync(rel)).toBe(true);
    }
  });
});
