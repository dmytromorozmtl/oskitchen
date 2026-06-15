"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { saveDeliveryProof } from "@/services/delivery/delivery-proof-service";

export async function uploadDeliveryProofFormAction(formData: FormData): Promise<void> {
  const access = await requireMutationPermission("orders.manage");
  if (!access.ok) return;
  const { dataUserId } = access.actor;

  const orderId = String(formData.get("orderId") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  const signatureDataUrl = String(formData.get("signatureDataUrl") ?? "").trim() || null;
  const driverLabel = String(formData.get("driverLabel") ?? "").trim() || null;
  if (!orderId) return;

  await saveDeliveryProof({
    userId: dataUserId,
    orderId,
    photoUrl,
    signatureDataUrl,
    driverLabel,
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/routes");
}
