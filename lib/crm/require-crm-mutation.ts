import { prisma } from "@/lib/prisma";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";

export type CrmMutationGate =
  | { ok: true; actor: WorkspacePermissionActor }
  | { ok: false; error: string };

export async function requireCrmMutation(): Promise<CrmMutationGate> {
  return requireMutationPermission("customers.manage");
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
