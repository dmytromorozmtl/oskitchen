import { prisma } from "@/lib/prisma";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { logCrmPermissionDenied } from "@/services/crm/crm-permission-audit";

export type CrmMutationGate =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

export async function requireCrmMutation(operation = "customers.mutation"): Promise<CrmMutationGate> {
  const access = await requireMutationPermission("customers.manage");
  if (!access.ok) {
    await logCrmPermissionDenied(access.actor, {
      requiredPermission: "customers.manage",
      operation,
    });
  }
  return access;
}

/** Tenant-scoped customer lookup (IDOR-safe). */
export async function findCustomerForOwner(
  customerId: string,
  ownerUserId: string,
) {
  return prisma.kitchenCustomer.findFirst({
    where: { id: customerId, userId: ownerUserId },
  });
}

export async function findCustomerSegmentForOwner(segmentId: string, ownerUserId: string) {
  return prisma.customerSegment.findFirst({
    where: { id: segmentId, userId: ownerUserId },
  });
}

export async function findCustomerFollowUpForOwner(followUpId: string, ownerUserId: string) {
  return prisma.customerFollowUp.findFirst({
    where: { id: followUpId, userId: ownerUserId },
  });
}
