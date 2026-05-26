import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ModelAudit = {
  model: string;
  hasUserId: boolean;
  hasWorkspaceId: boolean;
  status: "scoped" | "needs_migration" | "no_user_scope";
};

export type WorkspaceAuditReport = {
  totalModels: number;
  scoped: number;
  needsMigration: number;
  noUserScope: number;
  needsMigrationModels: string[];
  scopedModels: string[];
  models: ModelAudit[];
};

export function loadPrismaSchema(schemaPath = join(process.cwd(), "prisma/schema.prisma")): string {
  return readFileSync(schemaPath, "utf8");
}

export function parseModelsFromSchema(schema: string): ModelAudit[] {
  const blocks = schema.split(/^model /m).slice(1);
  const results: ModelAudit[] = [];

  for (const block of blocks) {
    const nameMatch = block.match(/^(\w+)\s*\{/);
    if (!nameMatch) continue;
    const model = nameMatch[1];
    const body = block.slice(nameMatch[0].length);
    const end = body.indexOf("\n}");
    const fields = end >= 0 ? body.slice(0, end) : body;

    const hasUserId = /^\s+userId\s/m.test(fields);
    const hasWorkspaceId = /^\s+workspaceId\s/m.test(fields);

    let status: ModelAudit["status"];
    if (hasUserId && !hasWorkspaceId) {
      status = "needs_migration";
    } else if (hasWorkspaceId) {
      status = "scoped";
    } else {
      status = "no_user_scope";
    }

    results.push({ model, hasUserId, hasWorkspaceId, status });
  }

  return results.sort((a, b) => a.model.localeCompare(b.model));
}

export function buildWorkspaceAuditReport(schema?: string): WorkspaceAuditReport {
  const parsed = parseModelsFromSchema(schema ?? loadPrismaSchema());
  const needsMigration = parsed.filter((m) => m.status === "needs_migration");
  const scoped = parsed.filter((m) => m.status === "scoped");
  const noUserScope = parsed.filter((m) => m.status === "no_user_scope");

  return {
    totalModels: parsed.length,
    scoped: scoped.length,
    needsMigration: needsMigration.length,
    noUserScope: noUserScope.length,
    needsMigrationModels: needsMigration.map((m) => m.model),
    scopedModels: scoped.map((m) => m.model),
    models: parsed,
  };
}

/** % of user-scoped models that declare workspaceId */
export function workspaceIdCoveragePercent(report: WorkspaceAuditReport): number {
  const userScoped = report.scoped + report.needsMigration;
  if (userScoped === 0) return 100;
  return Math.round((report.scoped / userScoped) * 1000) / 10;
}
