import { prisma } from "@/lib/prisma";
import {
  deliveryProofListWhereForOwner,
  orderByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type DeliveryProofInput = {
  userId: string;
  orderId: string;
  photoUrl?: string | null;
  signatureDataUrl?: string | null;
  driverLabel?: string | null;
  dispatchId?: string | null;
};

export async function saveDeliveryProof(input: DeliveryProofInput) {
  const order = await prisma.order.findFirst({
    where: await orderByIdWhereForOwner(input.userId, input.orderId),
    select: { id: true },
  });
  if (!order) throw new Error("Order not found");

  return prisma.deliveryProof.upsert({
    where: { orderId: input.orderId },
    create: {
      userId: input.userId,
      orderId: input.orderId,
      dispatchId: input.dispatchId ?? null,
      photoUrl: input.photoUrl ?? null,
      signatureDataUrl: input.signatureDataUrl ?? null,
      driverLabel: input.driverLabel ?? null,
      capturedAt: new Date(),
    },
    update: {
      photoUrl: input.photoUrl ?? undefined,
      signatureDataUrl: input.signatureDataUrl ?? undefined,
      driverLabel: input.driverLabel ?? undefined,
      dispatchId: input.dispatchId ?? undefined,
      capturedAt: new Date(),
    },
  });
}

export async function getDeliveryProof(userId: string, orderId: string) {
  const scope = await deliveryProofListWhereForOwner(userId);
  return prisma.deliveryProof.findFirst({
    where: { AND: [scope, { orderId }] },
  });
}
