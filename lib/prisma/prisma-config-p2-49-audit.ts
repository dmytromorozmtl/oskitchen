import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRISMA_CONFIG_P2_49_ARTIFACT,
  PRISMA_CONFIG_P2_49_CONFIG_PATH,
  PRISMA_CONFIG_P2_49_MIGRATIONS_PATH,
  PRISMA_CONFIG_P2_49_POLICY_ID,
  PRISMA_CONFIG_P2_49_SCHEMA_PATH,
  PRISMA_CONFIG_P2_49_SEED_COMMAND,
} from "@/lib/prisma/prisma-config-p2-49-policy";

export type PrismaConfigP249AuditSummary = {
  policyId: typeof PRISMA_CONFIG_P2_49_POLICY_ID;
  configPresent: boolean;
  usesDefineConfig: boolean;
  packageJsonPrismaBlockRemoved: boolean;
  schemaDatasourceEnvRefs: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditPrismaConfigP249(root = process.cwd()): PrismaConfigP249AuditSummary {
  const configPath = join(root, PRISMA_CONFIG_P2_49_CONFIG_PATH);
  const schemaPath = join(root, PRISMA_CONFIG_P2_49_SCHEMA_PATH);
  const artifactPath = join(root, PRISMA_CONFIG_P2_49_ARTIFACT);
  const packagePath = join(root, "package.json");

  const configPresent = existsSync(configPath);
  let usesDefineConfig = false;
  if (configPresent) {
    const config = readFileSync(configPath, "utf8");
    usesDefineConfig =
      config.includes("defineConfig") &&
      config.includes(`schema: "${PRISMA_CONFIG_P2_49_SCHEMA_PATH}"`) &&
      config.includes(`path: "${PRISMA_CONFIG_P2_49_MIGRATIONS_PATH}"`) &&
      config.includes(`seed: "${PRISMA_CONFIG_P2_49_SEED_COMMAND}"`);
  }

  let packageJsonPrismaBlockRemoved = false;
  if (existsSync(packagePath)) {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { prisma?: unknown };
    packageJsonPrismaBlockRemoved = pkg.prisma === undefined;
  }

  let schemaDatasourceEnvRefs = false;
  if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, "utf8");
    schemaDatasourceEnvRefs =
      schema.includes('provider  = "postgresql"') &&
      schema.includes('url       = env("DATABASE_URL")') &&
      schema.includes('directUrl = env("DIRECT_URL")');
  }

  let artifactPresent = false;
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      deprecatedRemoved?: string;
    };
    artifactPresent =
      artifact.policyId === PRISMA_CONFIG_P2_49_POLICY_ID &&
      artifact.deprecatedRemoved === "package.json#prisma";
  }

  const passed =
    configPresent &&
    usesDefineConfig &&
    packageJsonPrismaBlockRemoved &&
    schemaDatasourceEnvRefs &&
    artifactPresent;

  return {
    policyId: PRISMA_CONFIG_P2_49_POLICY_ID,
    configPresent,
    usesDefineConfig,
    packageJsonPrismaBlockRemoved,
    schemaDatasourceEnvRefs,
    artifactPresent,
    passed,
  };
}

export function formatPrismaConfigP249AuditLines(summary: PrismaConfigP249AuditSummary): string[] {
  return [
    `Prisma config migration (${summary.policyId})`,
    `prisma.config.ts present: ${summary.configPresent ? "yes" : "no"}`,
    `defineConfig wired: ${summary.usesDefineConfig ? "yes" : "no"}`,
    `package.json#prisma removed: ${summary.packageJsonPrismaBlockRemoved ? "yes" : "no"}`,
    `schema datasource env refs: ${summary.schemaDatasourceEnvRefs ? "yes" : "no"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
