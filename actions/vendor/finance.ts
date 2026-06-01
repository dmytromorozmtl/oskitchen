"use server";

import { revalidatePath } from "next/cache";

import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import { requestVendorPayout } from "@/services/marketplace/vendor-finance-service";

async function requireVendorPayoutWrite() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canRequestPayouts) {
    return { ok: false as const, error: "You do not have permission to request payouts." };
  }
  return { ok: true as const, access };
}

export async function requestVendorPayoutAction() {
  const gate = await requireVendorPayoutWrite();
  if (!gate.ok) return gate;

  const result = await requestVendorPayout(gate.access.vendorId);

  if (result.ok) {
    revalidatePath("/vendor/finance");
    revalidatePath("/vendor/dashboard");
  }

  return result;
}
