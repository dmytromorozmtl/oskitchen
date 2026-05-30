import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  buildWorkspaceAuditReport,
  loadPrismaSchema,
  parseModelsFromSchema,
} from "./prisma-workspace-audit";

export const PRISMA_PERFORMANCE_AUDIT_ARTIFACT =
  "artifacts/prisma-performance-audit.json" as const;

export const PRISMA_PERFORMANCE_AUDIT_POLICY_ID = "prisma-performance-audit-v1" as const;

/** Business tables that should eventually adopt deletedAt (see docs/soft-delete-standard.md). */
export const SOFT_DELETE_CANDIDATE_MODELS = [
  "Order",
  "Product",
  "KitchenCustomer",
  "Menu",
  "MenuItem",
  "StaffMember",
  "WorkspaceMember",
  "IntegrationConnection",
  "PurchaseOrder",
  "Recipe",
  "Ingredient",
] as const;

export type PrismaIndexRow = {
  model: string;
  indexes: string[];
  hasUserIdIndex: boolean;
  hasWorkspaceIdIndex: boolean;
};

export type NPlusOneFinding = {
  file: string;
  line: number;
  pattern: "for_await_prisma" | "map_async_prisma";
  snippet: string;
  severity: "high" | "medium";
};

export type OomRiskFinding = {
  file: string;
  line: number;
  model: string | null;
  hasTake: boolean;
  hasWhere: boolean;
  severity: "high" | "medium";
  snippet: string;
};

export type PrismaPerformanceAuditReport = {
  version: typeof PRISMA_PERFORMANCE_AUDIT_POLICY_ID;
  generatedAt: string;
  schema: {
    totalModels: number;
    totalIndexDeclarations: number;
    workspaceScoped: number;
    needsWorkspaceMigration: number;
  };
  indexes: {
    userScopedMissingTenantIndex: string[];
    rows: PrismaIndexRow[];
  };
  softDelete: {
    modelsWithDeletedAt: string[];
    candidateModelsMissingDeletedAt: string[];
    coveragePercent: number;
  };
  nPlusOne: {
    count: number;
    findings: NPlusOneFinding[];
  };
  oomRisk: {
    unboundedFindManyCount: number;
    findings: OomRiskFinding[];
  };
  overall: "PASSED" | "NEEDS_ATTENTION";
  recommendations: string[];
};

function parseModelIndexes(schema: string): PrismaIndexRow[] {
  const blocks = schema.split(/^model /m).slice(1);
  const rows: PrismaIndexRow[] = [];

  for (const block of blocks) {
    const nameMatch = block.match(/^(\w+)\s*\{/);
    if (!nameMatch) continue;
    const model = nameMatch[1];
    const body = block.slice(nameMatch[0].length);
    const end = body.indexOf("\n}");
    const fields = end >= 0 ? body.slice(0, end) : body;

    const indexMatches = [...fields.matchAll(/@@index\(\[([^\]]+)\]/g)].map((m) => m[1].trim());
    const hasUserId = /^\s+userId\s/m.test(fields);
    const hasWorkspaceId = /^\s+workspaceId\s/m.test(fields);
    const indexBlob = indexMatches.join(" ");
    const hasUserIdIndex = indexBlob.includes("userId") || indexBlob.includes("user_id");
    const hasWorkspaceIdIndex =
      indexBlob.includes("workspaceId") || indexBlob.includes("workspace_id");

    rows.push({
      model,
      indexes: indexMatches,
      hasUserIdIndex,
      hasWorkspaceIdIndex,
    });

    void hasUserId;
    void hasWorkspaceId;
  }

  return rows.sort((a, b) => a.model.localeCompare(b.model));
}

function modelsWithDeletedAt(schema: string): string[] {
  const blocks = schema.split(/^model /m).slice(1);
  const out: string[] = [];
  for (const block of blocks) {
    const nameMatch = block.match(/^(\w+)\s*\{/);
    if (!nameMatch) continue;
    const body = block.slice(nameMatch[0].length);
    if (/^\s+deletedAt\s/m.test(body) || /^\s+deleted_at\s/m.test(body)) {
      out.push(nameMatch[1]);
    }
  }
  return out.sort();
}

function listServiceFiles(root: string): string[] {
  const dir = join(root, "services");
  const out: string[] = [];

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (entry === "_experiments") continue;
        walk(full);
        continue;
      }
      if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
        out.push(full);
      }
    }
  }

  walk(dir);
  return out.sort();
}

function scanNPlusOne(files: string[], root: string): NPlusOneFinding[] {
  const findings: NPlusOneFinding[] = [];

  for (const file of files) {
    const rel = relative(root, file);
    const lines = readFileSync(file, "utf8").split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/for\s*\(/.test(line)) {
        const window = lines.slice(i, Math.min(i + 12, lines.length)).join("\n");
        if (/await\s+prisma\./.test(window)) {
          findings.push({
            file: rel,
            line: i + 1,
            pattern: "for_await_prisma",
            snippet: line.trim().slice(0, 120),
            severity: "high",
          });
        }
      }
      if (/\.map\s*\(\s*async/.test(line) && /prisma\./.test(lines.slice(i, i + 8).join("\n"))) {
        findings.push({
          file: rel,
          line: i + 1,
          pattern: "map_async_prisma",
          snippet: line.trim().slice(0, 120),
          severity: "medium",
        });
      }
    }
  }

  return findings.slice(0, 100);
}

function scanOomRisk(files: string[], root: string): OomRiskFinding[] {
  const findings: OomRiskFinding[] = [];

  for (const file of files) {
    const rel = relative(root, file);
    const source = readFileSync(file, "utf8");
    const findManyRe = /prisma\.(\w+)\.findMany\s*\(\s*\{/g;
    let match: RegExpExecArray | null;

    while ((match = findManyRe.exec(source)) !== null) {
      const model = match[1];
      const start = match.index;
      let depth = 0;
      let end = start;
      for (let i = start; i < source.length; i++) {
        if (source[i] === "{") depth += 1;
        if (source[i] === "}") {
          depth -= 1;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
      const block = source.slice(start, end);
      const hasTake = /\btake\s*:/.test(block);
      const hasWhere = /\bwhere\s*:/.test(block);
      if (hasTake) continue;

      const line = source.slice(0, start).split("\n").length;
      findings.push({
        file: rel,
        line,
        model,
        hasTake,
        hasWhere,
        severity: hasWhere ? "medium" : "high",
        snippet: block.split("\n")[0]?.trim().slice(0, 120) ?? "",
      });
    }
  }

  return findings
    .sort((a, b) => {
      const rank = (s: OomRiskFinding["severity"]) => (s === "high" ? 0 : 1);
      return rank(a.severity) - rank(b.severity);
    })
    .slice(0, 150);
}

export function buildPrismaPerformanceAuditReport(root = process.cwd()): PrismaPerformanceAuditReport {
  const schema = loadPrismaSchema(join(root, "prisma/schema.prisma"));
  const workspaceReport = buildWorkspaceAuditReport(schema);
  const indexRows = parseModelIndexes(schema);
  const deletedAtModels = modelsWithDeletedAt(schema);
  const parsedModels = parseModelsFromSchema(schema);

  const userScopedMissingTenantIndex = indexRows
    .filter((row) => {
      const modelMeta = parsedModels.find((m) => m.model === row.model);
      if (!modelMeta) return false;
      return (
        (modelMeta.hasUserId || modelMeta.hasWorkspaceId) &&
        !row.hasUserIdIndex &&
        !row.hasWorkspaceIdIndex
      );
    })
    .map((row) => row.model);

  const candidateMissing = SOFT_DELETE_CANDIDATE_MODELS.filter(
    (model) => !deletedAtModels.includes(model),
  );
  const softDeleteCoverage =
    SOFT_DELETE_CANDIDATE_MODELS.length === 0
      ? 100
      : Math.round(
          ((SOFT_DELETE_CANDIDATE_MODELS.length - candidateMissing.length) /
            SOFT_DELETE_CANDIDATE_MODELS.length) *
            1000,
        ) / 10;

  const serviceFiles = listServiceFiles(root);
  const nPlusOne = scanNPlusOne(serviceFiles, root);
  const oomRisk = scanOomRisk(serviceFiles, root);

  const indexDeclCount = (schema.match(/@@index\(/g) ?? []).length;

  const recommendations: string[] = [];
  if (workspaceReport.needsMigration > 0) {
    recommendations.push(
      `Migrate ${workspaceReport.needsMigration} models from userId-only to workspaceId composite indexes.`,
    );
  }
  if (userScopedMissingTenantIndex.length > 0) {
    recommendations.push(
      `Add @@index on userId or workspaceId for: ${userScopedMissingTenantIndex.slice(0, 8).join(", ")}${userScopedMissingTenantIndex.length > 8 ? "…" : ""}.`,
    );
  }
  if (candidateMissing.length > 0) {
    recommendations.push(
      "Adopt deletedAt soft-delete standard on high-churn entities (Order, Product, Customer).",
    );
  }
  if (nPlusOne.length > 0) {
    recommendations.push("Review N+1 loops in services — batch with findMany + in-memory map or include.");
  }
  if (oomRisk.length > 20) {
    recommendations.push("Cap findMany with take + cursor pagination; use SERVICE_DEFAULT_TAKE in list paths.");
  }

  const overall =
    userScopedMissingTenantIndex.length > 25 ||
    oomRisk.length > 80 ||
    nPlusOne.length > 40
      ? "NEEDS_ATTENTION"
      : "PASSED";

  return {
    version: PRISMA_PERFORMANCE_AUDIT_POLICY_ID,
    generatedAt: new Date().toISOString(),
    schema: {
      totalModels: workspaceReport.totalModels,
      totalIndexDeclarations: indexDeclCount,
      workspaceScoped: workspaceReport.scoped,
      needsWorkspaceMigration: workspaceReport.needsMigration,
    },
    indexes: {
      userScopedMissingTenantIndex,
      rows: indexRows,
    },
    softDelete: {
      modelsWithDeletedAt: deletedAtModels,
      candidateModelsMissingDeletedAt: [...candidateMissing],
      coveragePercent: softDeleteCoverage,
    },
    nPlusOne: {
      count: nPlusOne.length,
      findings: nPlusOne,
    },
    oomRisk: {
      unboundedFindManyCount: oomRisk.length,
      findings: oomRisk,
    },
    overall,
    recommendations,
  };
}
