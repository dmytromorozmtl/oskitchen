import type { ImportType } from "@prisma/client";

import type {
  RollbackAvailability,
  RollbackPlan,
} from "@/lib/import-center/import-types";

export type RollbackEntityKind =
  | "kitchenCustomer"
  | "ingredient"
  | "product"
  | "productionTask"
  | "staffMember";

const ENTITY_LABELS: Record<RollbackEntityKind, string> = {
  kitchenCustomer: "customer",
  ingredient: "ingredient",
  product: "product",
  productionTask: "production task",
  staffMember: "staff member",
};

export function rollbackEntityLabel(kind: string): string {
  return ENTITY_LABELS[kind as RollbackEntityKind] ?? kind;
}

export function buildRollbackPlan(
  type: ImportType,
  created: { entity: RollbackEntityKind; id: string }[],
): RollbackPlan {
  return {
    type,
    createdEntities: created,
    capturedAt: new Date().toISOString(),
  };
}

export function rollbackAvailability(
  plan: RollbackPlan | null,
  alreadyRolledBack: boolean,
): RollbackAvailability {
  if (alreadyRolledBack) {
    return { available: false, reason: "Import has already been rolled back.", count: 0 };
  }
  if (!plan) {
    return { available: false, reason: "No rollback plan was recorded for this import.", count: 0 };
  }
  if (plan.createdEntities.length === 0) {
    return { available: false, reason: "No reversible rows were created by this import.", count: 0 };
  }
  return { available: true, count: plan.createdEntities.length };
}

export function parseRollbackPlan(value: unknown): RollbackPlan | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<RollbackPlan>;
  if (!candidate.type || !Array.isArray(candidate.createdEntities)) return null;
  return {
    type: candidate.type as ImportType,
    createdEntities: candidate.createdEntities.filter(
      (e): e is { entity: string; id: string } =>
        e !== null && typeof e === "object" && typeof e.entity === "string" && typeof e.id === "string",
    ) as RollbackPlan["createdEntities"],
    capturedAt: typeof candidate.capturedAt === "string" ? candidate.capturedAt : new Date().toISOString(),
  };
}
