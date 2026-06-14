import { Prisma } from "@prisma/client";

import type { PosCartJson } from "@/lib/pos/pos-types";
import { prisma } from "@/lib/prisma";
import {
  posHeldOrderListWhereForOwner,
  posRegisterByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function createHeldPosCart(input: {
  userId: string;
  registerId: string;
  staffId: string;
  cart: PosCartJson;
  label: string;
  customerName?: string | null;
}) {
  const registerWhere = await posRegisterByIdWhereForOwner(input.userId, input.registerId);
  const register = await prisma.pOSRegister.findFirst({
    where: registerWhere,
    select: { id: true, workspaceId: true, locationId: true },
  });
  if (!register) throw new Error("NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    const cart = await tx.pOSCart.create({
      data: {
        userId: input.userId,
        workspaceId: register.workspaceId,
        locationId: register.locationId,
        registerId: register.id,
        staffId: input.staffId,
        status: "HELD",
        cartJson: input.cart as unknown as Prisma.InputJsonValue,
      },
    });
    const held = await tx.pOSHeldOrder.create({
      data: {
        userId: input.userId,
        workspaceId: register.workspaceId,
        cartId: cart.id,
        label: input.label,
        customerName: input.customerName ?? undefined,
        heldByStaffId: input.staffId,
      },
    });
    return { cart, held };
  });
}

export async function listHeldPosOrders(userId: string) {
  const where = await posHeldOrderListWhereForOwner(userId);
  return prisma.pOSHeldOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { cart: true },
  });
}
