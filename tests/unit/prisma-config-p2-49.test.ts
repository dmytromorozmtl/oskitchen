import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPrismaConfigP249,
  formatPrismaConfigP249AuditLines,
} from "@/lib/prisma/prisma-config-p2-49-audit";
import {
  PRISMA_CONFIG_P2_49_ARTIFACT,
  PRISMA_CONFIG_P2_49_CHECK_NPM_SCRIPT,
  PRISMA_CONFIG_P2_49_CI_NPM_SCRIPT,
  PRISMA_CONFIG_P2_49_CI_WORKFLOW,
  PRISMA_CONFIG_P2_49_CONFIG_PATH,
  PRISMA_CONFIG_P2_49_DOC,
  PRISMA_CONFIG_P2_49_MIGRATIONS_PATH,
  PRISMA_CONFIG_P2_49_POLICY_ID,
  PRISMA_CONFIG_P2_49_SCHEMA_PATH,
  PRISMA_CONFIG_P2_49_SEED_COMMAND,
  PRISMA_CONFIG_P2_49_WIRING_PATHS,
} from "@/lib/prisma/prisma-config-p2-49-policy";
import {
  PRISMA_CONFIG_POLICY_ID,
  PRISMA_CONFIG_NPM_SCRIPT,
} from "@/lib/prisma/prisma-config-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Prisma config migration (P2-49)", () => {
  it("locks P2-49 policy and prisma.config.ts path", () => {
    expect(PRISMA_CONFIG_P2_49_POLICY_ID).toBe("prisma-config-p2-49-v1");
    expect(PRISMA_CONFIG_POLICY_ID).toBe("prisma-config-p1-15-v1");
    expect(existsSync(join(ROOT, PRISMA_CONFIG_P2_49_CONFIG_PATH))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_CONFIG_P2_49_SCHEMA_PATH))).toBe(true);
    expect(existsSync(join(ROOT, PRISMA_CONFIG_P2_49_MIGRATIONS_PATH))).toBe(true);
  });

  it("passes full P2-49 audit — defineConfig, no package.json#prisma", () => {
    const summary = auditPrismaConfigP249(ROOT);
    expect(summary.configPresent).toBe(true);
    expect(summary.usesDefineConfig).toBe(true);
    expect(summary.packageJsonPrismaBlockRemoved).toBe(true);
    expect(summary.schemaDatasourceEnvRefs).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("uses prisma.config.ts with schema, migrations, and seed", () => {
    const config = readSource(PRISMA_CONFIG_P2_49_CONFIG_PATH);
    expect(config).toContain("defineConfig");
    expect(config).toContain(`schema: "${PRISMA_CONFIG_P2_49_SCHEMA_PATH}"`);
    expect(config).toContain(`path: "${PRISMA_CONFIG_P2_49_MIGRATIONS_PATH}"`);
    expect(config).toContain(`seed: "${PRISMA_CONFIG_P2_49_SEED_COMMAND}"`);

    const pkg = JSON.parse(readSource("package.json")) as { prisma?: unknown };
    expect(pkg.prisma).toBeUndefined();
  });

  it("P2-49 wiring paths exist including doc, artifact, base policy, and CI gate", () => {
    for (const path of PRISMA_CONFIG_P2_49_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${PRISMA_CONFIG_P2_49_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${PRISMA_CONFIG_P2_49_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${PRISMA_CONFIG_NPM_SCRIPT}"`);

    const ci = readSource(PRISMA_CONFIG_P2_49_CI_WORKFLOW);
    expect(ci).toContain(PRISMA_CONFIG_P2_49_CHECK_NPM_SCRIPT);

    const doc = readSource(PRISMA_CONFIG_P2_49_DOC);
    expect(doc).toContain(PRISMA_CONFIG_P2_49_POLICY_ID);

    const artifact = JSON.parse(readSource(PRISMA_CONFIG_P2_49_ARTIFACT));
    expect(artifact.policyId).toBe(PRISMA_CONFIG_P2_49_POLICY_ID);
    expect(artifact.deprecatedRemoved).toBe("package.json#prisma");
  });

  it("formats audit lines", () => {
    const summary = auditPrismaConfigP249(ROOT);
    const lines = formatPrismaConfigP249AuditLines(summary);
    expect(lines.some((line) => line.includes(PRISMA_CONFIG_P2_49_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
