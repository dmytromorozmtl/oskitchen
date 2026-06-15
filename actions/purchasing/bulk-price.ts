"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  bulkUpdateSupplierPrices,
  undoLastBulkPriceChange,
} from "@/services/purchasing/bulk-price-service";

const updatesSchema = z.array(
  z.object({
    supplierItemId: z.string().uuid(),
    unitCost: z.number().nonnegative(),
  }),
);

async function requirePurchasingBulkPricePermission(
  permission: PermissionKey,
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "purchasing.permission_denied",
      entityType: "PurchaseOrder",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function bulkUpdatePricesAction(
  formData: FormData,
): Promise<{ error?: string; updated?: number } | void> {
  const gate = await requirePurchasingBulkPricePermission(
    "reports.read.financial",
    "purchasing.bulk_update_prices",
  );
  if (!gate.ok) return { error: gate.error };

  const raw = String(formData.get("updates") ?? "[]");
  let parsed: z.infer<typeof updatesSchema>;
  try {
    parsed = updatesSchema.parse(JSON.parse(raw));
  } catch {
    return { error: "Invalid price updates payload" };
  }

  const { dataUserId } = await requireTenantActor();
  await bulkUpdateSupplierPrices(dataUserId, parsed);
  revalidatePath("/dashboard/purchasing/bulk-pricing");
  return { updated: parsed.length };
}

export async function undoBulkPricesAction(): Promise<{ error?: string; undone?: number } | void> {
  const gate = await requirePurchasingBulkPricePermission(
    "reports.read.financial",
    "purchasing.undo_bulk_prices",
  );
  if (!gate.ok) return { error: gate.error };

  const { dataUserId } = await requireTenantActor();
  const { undone } = await undoLastBulkPriceChange(dataUserId);
  revalidatePath("/dashboard/purchasing/bulk-pricing");
  return { undone };
}
