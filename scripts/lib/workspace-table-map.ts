import { join } from "node:path";

import { loadPrismaSchema, parseModelsFromSchema, type ModelAudit } from "./prisma-workspace-audit";

export type ScopedTableRef = {
  model: string;
  table: string;
  userIdRequired: boolean;
};

function tableForModel(model: string, schema: string): string {
  const re = new RegExp(`model ${model} \\{[\\s\\S]*?@@map\\("([^"]+)"\\)`, "m");
  const m = schema.match(re);
  if (!m) {
    throw new Error(`@@map not found for model ${model}`);
  }
  return m[1]!;
}

function userIdIsRequired(fieldsBlock: string): boolean {
  return /^\s+userId\s+String\s/m.test(fieldsBlock) && !/^\s+userId\s+String\?/m.test(fieldsBlock);
}

function fieldsBlockForModel(model: string, schema: string): string {
  const re = new RegExp(`model ${model} \\{([\\s\\S]*?)\\n\\}`, "m");
  const m = schema.match(re);
  return m?.[1] ?? "";
}

export function listScopedUserTables(schemaPath?: string): ScopedTableRef[] {
  const path = schemaPath ?? join(process.cwd(), "prisma/schema.prisma");
  const schema = loadPrismaSchema(path);
  const models = parseModelsFromSchema(schema).filter((m) => m.status === "scoped");

  return models.map((m: ModelAudit) => {
    const fields = fieldsBlockForModel(m.model, schema);
    return {
      model: m.model,
      table: tableForModel(m.model, schema),
      userIdRequired: userIdIsRequired(fields),
    };
  });
}
