"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createCustomCategory } from "@/services/products/category-service";

export async function createCustomCategoryAction(formData: FormData) {
  try {
    const { dataUserId } = await requireTenantActor();
    const name = String(formData.get("name") ?? "").trim();
    const result = await createCustomCategory(dataUserId, name);
    if (!result.ok) return { error: result.error };

    revalidatePath("/dashboard/products");
    return { ok: true as const, code: result.code, label: result.label };
  } catch (e) {
    return { error: safeError(e) };
  }
}
