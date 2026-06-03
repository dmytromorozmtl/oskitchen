"use server";

import { revalidatePath } from "next/cache";

import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import { requestInstantVendorPayout } from "@/services/marketplace/instant-payouts-service";

async function requireVendorPayoutWrite() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canRequestPayouts) {
    return { ok: false as const, error: "You do not have permission to request payouts." };
  }
  return { ok: true as const, access };
}

export async function requestInstantVendorPayoutAction() {
  const gate = await requireVendorPayoutWrite();
  if (!gate.ok) return gate;

  const result = await requestInstantVendorPayout(gate.access.vendorId);

  if (result.ok) {
    revalidatePath("/vendor/finance");
    revalidatePath("/vendor/finance/instant-payouts");
    revalidatePath("/vendor/dashboard");
  }

  return result;
}
