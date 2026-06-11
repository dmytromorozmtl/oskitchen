import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT,
  PRISMA_INDEX_AUDIT_MODEL_EXEMPTIONS,
  PRISMA_INDEX_AUDIT_POLICY_ID,
  PRISMA_INDEX_AUDIT_SCHEMA_PATH,
  PRISMA_TENANT_SCOPE_INDEX_FIELDS,
} from "@/lib/prisma/prisma-index-audit-policy";

export type PrismaModelIndexReport = {
  model: string;
  foreignKeyFields: string[];
  indexedFields: string[];
  missingForeignKeyIndexes: string[];
  missingTenantScopeIndexes: string[];
};

export type PrismaIndexAuditSummary = {
  policyId: typeof PRISMA_INDEX_AUDIT_POLICY_ID;
  modelCount: number;
  expectedModelCount: typeof PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT;
  modelsWithForeignKeys: number;
  modelsWithGaps: number;
  totalMissingForeignKeyIndexes: number;
  totalMissingTenantScopeIndexes: number;
  reports: PrismaModelIndexReport[];
  passed: boolean;
};

function splitModelBlocks(schema: string): Map<string, string> {
  const models = new Map<string, string>();
  const pattern = /^model\s+(\w+)\s*\{/gm;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(schema)) !== null) {
    const name = match[1]!;
    const start = match.index + match[0].length;
    let depth = 1;
    let index = start;
    while (index < schema.length && depth > 0) {
      const char = schema[index];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;
      index += 1;
    }
    models.set(name, schema.slice(start, index - 1));
  }

  return models;
}

function parseFieldNames(body: string): string[] {
  const names: string[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("@@")) continue;
    const fieldMatch = /^(\w+)\s+/.exec(trimmed);
    if (fieldMatch) names.push(fieldMatch[1]!);
  }
  return names;
}

function parseForeignKeyFields(body: string): string[] {
  const fields = new Set<string>();
  const relationPattern = /@relation\([^)]*fields:\s*\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = relationPattern.exec(body)) !== null) {
    for (const part of match[1]!.split(",")) {
      const name = part.trim();
      if (name) fields.add(name);
    }
  }
  return [...fields];
}

function parseIndexedFields(body: string, fieldNames: readonly string[]): Set<string> {
  const indexed = new Set<string>();

  for (const name of fieldNames) {
    const fieldLine = body
      .split("\n")
      .find((line) => line.trim().startsWith(`${name} `));
    if (!fieldLine) continue;
    if (/@id\b/.test(fieldLine) || /@unique\b/.test(fieldLine)) {
      indexed.add(name);
    }
  }

  const blockPattern = /@@(id|index|unique)\(\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(body)) !== null) {
    for (const part of match[2]!.split(",")) {
      const name = part.trim();
      if (name) indexed.add(name);
    }
  }

  return indexed;
}

export function auditPrismaModelIndexes(
  model: string,
  body: string,
): PrismaModelIndexReport {
  const fieldNames = parseFieldNames(body);
  const foreignKeyFields = parseForeignKeyFields(body);
  const indexedFields = [...parseIndexedFields(body, fieldNames)].sort();
  const indexedSet = new Set(indexedFields);

  const missingForeignKeyIndexes = foreignKeyFields.filter((field) => !indexedSet.has(field));
  const missingTenantScopeIndexes = PRISMA_TENANT_SCOPE_INDEX_FIELDS.filter(
    (field) => fieldNames.includes(field) && !indexedSet.has(field),
  );

  return {
    model,
    foreignKeyFields,
    indexedFields,
    missingForeignKeyIndexes,
    missingTenantScopeIndexes,
  };
}

export function auditPrismaSchemaIndexes(
  schemaPath = join(process.cwd(), PRISMA_INDEX_AUDIT_SCHEMA_PATH),
): PrismaIndexAuditSummary {
  const schema = readFileSync(schemaPath, "utf8");
  const blocks = splitModelBlocks(schema);
  const exempt = new Set<string>(PRISMA_INDEX_AUDIT_MODEL_EXEMPTIONS);

  const reports: PrismaModelIndexReport[] = [];
  for (const [model, body] of blocks) {
    if (exempt.has(model)) continue;
    reports.push(auditPrismaModelIndexes(model, body));
  }

  const modelsWithGaps = reports.filter(
    (report) =>
      report.missingForeignKeyIndexes.length > 0 ||
      report.missingTenantScopeIndexes.length > 0,
  );
  const totalMissingForeignKeyIndexes = reports.reduce(
    (sum, report) => sum + report.missingForeignKeyIndexes.length,
    0,
  );
  const totalMissingTenantScopeIndexes = reports.reduce(
    (sum, report) => sum + report.missingTenantScopeIndexes.length,
    0,
  );

  const modelCount = blocks.size;
  const passed =
    modelCount === PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT &&
    totalMissingTenantScopeIndexes === 0;

  return {
    policyId: PRISMA_INDEX_AUDIT_POLICY_ID,
    modelCount,
    expectedModelCount: PRISMA_INDEX_AUDIT_EXPECTED_MODEL_COUNT,
    modelsWithForeignKeys: reports.filter((report) => report.foreignKeyFields.length > 0).length,
    modelsWithGaps: modelsWithGaps.length,
    totalMissingForeignKeyIndexes,
    totalMissingTenantScopeIndexes,
    reports,
    passed,
  };
}

export function formatPrismaIndexAuditLines(summary: PrismaIndexAuditSummary): string[] {
  const lines = [
    `Prisma index audit (${summary.policyId})`,
    `Models: ${summary.modelCount}/${summary.expectedModelCount}`,
    `Models with FK fields: ${summary.modelsWithForeignKeys}`,
    `Models with index gaps: ${summary.modelsWithGaps}`,
    `Missing tenant-scope indexes: ${summary.totalMissingTenantScopeIndexes}`,
    `Missing FK indexes (informational): ${summary.totalMissingForeignKeyIndexes}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];

  const tenantGaps = summary.reports.filter((report) => report.missingTenantScopeIndexes.length);
  if (tenantGaps.length > 0) {
    lines.push("", "Critical tenant-scope gaps:");
    for (const report of tenantGaps.slice(0, 25)) {
      lines.push(
        `  ${report.model}: missing ${report.missingTenantScopeIndexes.join(", ")}`,
      );
    }
    if (tenantGaps.length > 25) {
      lines.push(`  … and ${tenantGaps.length - 25} more`);
    }
  }

  return lines;
}
