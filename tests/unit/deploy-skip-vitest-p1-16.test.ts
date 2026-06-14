import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEPLOY_SKIP_VITEST_P1_16_ARTIFACT,
  DEPLOY_SKIP_VITEST_P1_16_AUDITED_SCRIPTS,
  DEPLOY_SKIP_VITEST_P1_16_CHECK_NPM_SCRIPT,
  DEPLOY_SKIP_VITEST_P1_16_CI_NPM_SCRIPT,
  DEPLOY_SKIP_VITEST_P1_16_DEPLOY_PROD_GATE_WORKFLOW,
  DEPLOY_SKIP_VITEST_P1_16_DOC,
  DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN,
  DEPLOY_SKIP_VITEST_P1_16_POLICY_ID,
  DEPLOY_SKIP_VITEST_P1_16_PRIMARY_DEPLOY_SCRIPT,
  DEPLOY_SKIP_VITEST_P1_16_VITEST_GATE_PATTERN,
  DEPLOY_SKIP_VITEST_P1_16_WIRING_PATHS,
} from "@/lib/devops/deploy-skip-vitest-p1-16-policy";

const ROOT = process.cwd();

describe("DEPLOY_SKIP_VITEST removed from deploy scripts (P1-16)", () => {
  it("locks P1-16 policy and forbidden bypass token", () => {
    expect(DEPLOY_SKIP_VITEST_P1_16_POLICY_ID).toBe("p1-16-deploy-skip-vitest-removed-v1");
    expect(DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN).toBe("DEPLOY_SKIP_VITEST");
    expect(DEPLOY_SKIP_VITEST_P1_16_AUDITED_SCRIPTS.length).toBeGreaterThanOrEqual(5);
  });

  it("audited deploy scripts contain no DEPLOY_SKIP_VITEST bypass", () => {
    for (const rel of DEPLOY_SKIP_VITEST_P1_16_AUDITED_SCRIPTS) {
      const script = readFileSync(join(ROOT, rel), "utf8");
      expect(script, rel).not.toContain(DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN);
      expect(script, rel).not.toMatch(/skipping vitest/i);
    }
  });

  it("primary deploy script requires vitest before production build", () => {
    const script = readFileSync(
      join(ROOT, DEPLOY_SKIP_VITEST_P1_16_PRIMARY_DEPLOY_SCRIPT),
      "utf8",
    );
    expect(script).toContain(DEPLOY_SKIP_VITEST_P1_16_VITEST_GATE_PATTERN);
    expect(script).toContain("required gate before deploy");
  });

  it("documents P1-16 and wires npm scripts + deploy-prod-gate workflow", () => {
    for (const rel of DEPLOY_SKIP_VITEST_P1_16_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, DEPLOY_SKIP_VITEST_P1_16_DOC), "utf8");
    expect(doc).toContain(DEPLOY_SKIP_VITEST_P1_16_POLICY_ID);
    expect(doc).toContain(DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DEPLOY_SKIP_VITEST_P1_16_CHECK_NPM_SCRIPT]).toContain(
      "deploy-skip-vitest-p1-16.test.ts",
    );
    expect(pkg.scripts?.[DEPLOY_SKIP_VITEST_P1_16_CI_NPM_SCRIPT]).toContain(
      "deploy-skip-vitest-p1-16.test.ts",
    );

    const workflow = readFileSync(
      join(ROOT, DEPLOY_SKIP_VITEST_P1_16_DEPLOY_PROD_GATE_WORKFLOW),
      "utf8",
    );
    expect(workflow).toContain(DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN);
    expect(workflow).toContain(DEPLOY_SKIP_VITEST_P1_16_VITEST_GATE_PATTERN);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, DEPLOY_SKIP_VITEST_P1_16_ARTIFACT), "utf8"),
    ) as { policyId: string; status: string };
    expect(artifact.policyId).toBe(DEPLOY_SKIP_VITEST_P1_16_POLICY_ID);
    expect(artifact.status).toBe("REMOVED");
  });
});
