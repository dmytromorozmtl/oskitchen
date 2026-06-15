"use server";

import { revalidatePath } from "next/cache";

import type { MarketplaceProductStatus } from "@prisma/client";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  bulkUpdateVendorProductStatus,
  createVendorProduct,
  submitVendorProductsForReview,
  updateVendorProduct,
  type VendorProductInput,
} from "@/services/marketplace/vendor-products-service";

async function requireVendorProductsWrite() {
  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  if (!access.canManageProducts) {
    return { ok: false as const, error: "You do not have permission to manage vendor products." };
  }
  return { ok: true as const, access };
}

function revalidateVendorProducts() {
  revalidatePath("/vendor/products");
  revalidatePath("/vendor/dashboard");
  revalidatePath("/dashboard/marketplace/catalog");
}

export async function createVendorProductAction(input: VendorProductInput & { submitForReview?: boolean }) {
  const gate = await requireVendorProductsWrite();
  if (!gate.ok) return gate;

  const result = await createVendorProduct(
    gate.access.vendorId,
    input,
    input.submitForReview ? "PENDING_REVIEW" : "DRAFT",
  );

  if (result.ok) revalidateVendorProducts();
  return result;
}

export async function updateVendorProductAction(input: VendorProductInput & { productId: string }) {
  const gate = await requireVendorProductsWrite();
  if (!gate.ok) return gate;

  const result = await updateVendorProduct(gate.access.vendorId, input.productId, input);
  if (result.ok) revalidateVendorProducts();
  return result;
}

export async function bulkVendorProductStatusAction(input: {
  productIds: string[];
  status: MarketplaceProductStatus;
}) {
  const gate = await requireVendorProductsWrite();
  if (!gate.ok) return gate;

  const result = await bulkUpdateVendorProductStatus({
    vendorId: gate.access.vendorId,
    productIds: input.productIds,
    status: input.status,
  });
  if (result.ok) revalidateVendorProducts();
  return result;
}

export async function submitVendorProductsForReviewAction(productIds: string[]) {
  const gate = await requireVendorProductsWrite();
  if (!gate.ok) return gate;

  const result = await submitVendorProductsForReview(gate.access.vendorId, productIds);
  if (result.ok) revalidateVendorProducts();
  return result;
}
