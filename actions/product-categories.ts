"use server";


import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createCustomCategory } from "@/services/products/category-service";

async function requireProductCategoryMutationPermission(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "products.edit";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "product_categories.permission_denied",
      entityType: "ProductCategory",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function createCustomCategoryAction(formData: FormData) {
  try {
    const gate = await requireProductCategoryMutationPermission("product_categories.create");
    if (!gate.ok) return { error: gate.error };

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
