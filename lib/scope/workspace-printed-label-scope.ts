import type { Prisma } from "@prisma/client";

import {
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

/**
 * PrintedLabel has no `workspaceId` column. Tenant boundary is enforced via:
 * - product → workspace-scoped catalog row
 * - order → workspace-scoped order row
 * - legacy rows with neither FK → owner `userId` only (pilot: same as dataUserId)
 */
export async function printedLabelListWhereForOwner(
  ownerUserId: string,
): Promise<Prisma.PrintedLabelWhereInput> {
  const [productScope, orderScope] = await Promise.all([
    productListWhereForOwner(ownerUserId),
    orderListWhereForOwner(ownerUserId),
  ]);

  return {
    OR: [
      { product: productScope },
      { order: orderScope },
      { productId: null, orderId: null, userId: ownerUserId },
    ],
  };
}

export async function printedLabelListWhereForOwnerAnd(
  ownerUserId: string,
  extra: Prisma.PrintedLabelWhereInput,
): Promise<Prisma.PrintedLabelWhereInput> {
  const base = await printedLabelListWhereForOwner(ownerUserId);
  return { AND: [base, extra] };
}

export async function printedLabelByIdWhereForOwner(
  ownerUserId: string,
  labelId: string,
): Promise<Prisma.PrintedLabelWhereInput> {
  const base = await printedLabelListWhereForOwner(ownerUserId);
  return { AND: [base, { id: labelId }] };
}
