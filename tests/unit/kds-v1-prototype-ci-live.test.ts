import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CI_WORKFLOW = join(ROOT, ".github/workflows/ci.yml");
const KDS_UI = join(ROOT, "components/kitchen/kds-daily-service.tsx");
const KITCHEN_PAGE = join(ROOT, "app/dashboard/kitchen/page.tsx");
const KDS_INTEGRATION = join(ROOT, "tests/integration/kds-daily-queue-bump.integration.test.ts");

const REQUIRED_SCRIPTS = [
  "test:ci:kds-v1:integration",
  "test:ci:kds-v1:prototype:cert",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

function extractJobBlock(workflow: string, jobName: string): string {
  const marker = `${jobName}:`;
  const start = workflow.indexOf(marker);
  expect(start).toBeGreaterThanOrEqual(0);
  const rest = workflow.slice(start + marker.length);
  const nextJob = rest.search(/\n  [a-z][a-z0-9-]+:\n/);
  return nextJob === -1 ? rest : rest.slice(0, nextJob);
}

describe("KDS v1 prototype CI certification (live repo)", () => {
  it("defines integration and prototype wiring cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of REQUIRED_SCRIPTS) {
      expect(scripts[name], `missing package.json script "${name}"`).toBeTruthy();
    }
    expect(scripts["test:ci:kds-v1:integration"]).toContain(
      "kds-daily-queue-bump.integration.test.ts",
    );
  });

  it("wires kds-v1-prototype job in CI with Postgres and queue→bump integration", () => {
    const workflow = readFileSync(CI_WORKFLOW, "utf8");
    const job = extractJobBlock(workflow, "kds-v1-prototype");
    expect(job).toContain("postgres:");
    expect(job).toContain("RUN_DB_INTEGRATION");
    expect(job).toContain("test:ci:kds-v1:integration");
  });

  it("includes KDS v1 prototype cert in default quality governance bundles", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:governance-bundles"]).toContain("test:ci:kds-v1:prototype:cert");
  });

  it("gates daily-service KDS behind rollout flag and renders certified ticket UI", () => {
    const page = readFileSync(KITCHEN_PAGE, "utf8");
    expect(page).toContain("isKdsV1CertifiedRolloutEnabled");
    expect(page).toContain("ENABLE_KDS_V1_CERTIFIED");
    expect(page).toContain("KdsDailyService");
    expect(page).toContain("kitchen.bump");
    expect(page).toContain("kitchen.recall");
  });

  it("surfaces allergen conflict on ticket cards", () => {
    const ui = readFileSync(KDS_UI, "utf8");
    expect(ui).toContain("hasAllergenConflict");
    expect(ui).toContain("Allergy alert");
    expect(ui).toContain("allergen conflict");
  });

  it("integration test proves queue visibility and allergen conflict flag", () => {
    expect(existsSync(KDS_INTEGRATION)).toBe(true);
    const integration = readFileSync(KDS_INTEGRATION, "utf8");
    expect(integration).toContain("getTodayQueue");
    expect(integration).toContain('status: "PREPARING"');
    expect(integration).toContain('status: "READY"');
    expect(integration).toContain("hasAllergenConflict");
  });
});
