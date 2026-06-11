import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPrismaSchemaIndexes,
} from "@/lib/prisma/prisma-index-audit";
import {
  PRISMA_INDEX_AUDIT_CI_WORKFLOW,
  PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT,
  PRISMA_INDEX_AUDIT_NPM_SCRIPT,
  PRISMA_INDEX_AUDIT_POLICY_ID,
  PRISMA_INDEX_AUDIT_SCRIPT,
  PRISMA_INDEX_AUDIT_UNIT_TEST,
} from "@/lib/prisma/prisma-index-audit-policy";

const ROOT = process.cwd();

describe("Prisma index audit (P1-36)", () => {
  it("locks policy id and script paths", () => {
    expect(PRISMA_INDEX_AUDIT_POLICY_ID).toBe("prisma-index-audit-p1-36-v1");
    expect(existsSync(join(ROOT, PRISMA_INDEX_AUDIT_SCRIPT))).toBe(true);
    expect(PRISMA_INDEX_AUDIT_UNIT_TEST).toBe(
      "tests/unit/prisma-index-audit.test.ts",
    );
  });

  it("audits all 401 models with zero tenant-scope index gaps", () => {
    const summary = auditPrismaSchemaIndexes();

    expect(summary.modelCount).toBe(PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT);
    expect(summary.totalMissingTenantScopeIndexes).toBe(0);
    expect(summary.passed).toBe(true);
  });

  it("registers npm script and deploy-prod-gate CI step", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PRISMA_INDEX_AUDIT_NPM_SCRIPT]).toContain(
      "check-prisma-indexes.ts",
    );
    expect(pkg.scripts?.["test:ci:prisma-index-audit"]).toContain(
      "prisma-index-audit.test.ts",
    );

    const workflow = readFileSync(join(ROOT, PRISMA_INDEX_AUDIT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("check:prisma-indexes");
  });
});
