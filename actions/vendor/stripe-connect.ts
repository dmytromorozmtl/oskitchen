"use server";

import { revalidatePath } from "next/cache";

import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  getAccountLink,
  processPayout,
  refreshVendorConnectReadiness,
} from "@/services/marketplace/stripe-connect-service";

export async function getVendorStripeConnectLinkAction() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canRequestPayouts) {
    return { ok: false as const, error: "You do not have permission to manage payouts." };
  }

  const result = await getAccountLink(access.vendorId);
  if (result.ok) revalidatePath("/vendor/finance");
  return result;
}

export async function getVendorConnectStatusAction() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };

  const status = await refreshVendorConnectReadiness(access.vendorId);
  return { ok: true as const, status };
}

export async function processVendorStripePayoutAction() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canRequestPayouts) {
    return { ok: false as const, error: "You do not have permission to request payouts." };
  }

  const result = await processPayout(access.vendorId);
  if (result.ok) {
    revalidatePath("/vendor/finance");
    revalidatePath("/vendor/dashboard");
  }
  return result;
}
