"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logPosPermissionDenied, logPosTabEvent } from "@/services/pos/pos-permission-audit";
import {
  getServerBankingSummary,
  getTipsReconciliation,
  mergeRestaurantTables,
  mergeTabs,
  transferSeatOnTab,
} from "@/services/pos/table-service-depth-service";

const mergeTabsSchema = z.object({
  sourceTabId: z.string().uuid(),
  targetTabId: z.string().uuid(),
});

const transferSeatSchema = z.object({
  tabId: z.string().uuid(),
  fromSeatId: z.string().min(1).max(64),
  toSeatId: z.string().min(1).max(64),
});

const mergeTablesSchema = z.object({
  sourceTableId: z.string().uuid(),
  targetTableId: z.string().uuid(),
});

const tipsReconcileSchema = z.object({
  declaredTips: z.coerce.number().nonnegative(),
});

async function requireTableServiceAccess(operation: string) {
  const access = await requireMutationPermission("pos.access");
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: "pos.access",
      operation,
    });
  }
  return access;
}

export async function mergeTabsAction(input: z.infer<typeof mergeTabsSchema>) {
  const access = await requireTableServiceAccess("pos.table.merge_tabs");
  if (!access.ok) return fail(access.error);

  const parsed = mergeTabsSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid merge request");

  try {
    const result = await mergeTabs(
      access.actor.userId,
      parsed.data.sourceTabId,
      parsed.data.targetTabId,
    );
    await logPosTabEvent(access.actor, {
      action: AUDIT_ACTIONS.POS_TAB_CLOSED,
      entityId: parsed.data.sourceTabId,
      label: "Merged into target tab",
      metadata: {
        targetTabId: parsed.data.targetTabId,
        mergedItemCount: result.mergedItemCount,
        operation: "merge_tabs",
      },
    });
    revalidatePath("/dashboard/pos/tabs");
    revalidatePath("/dashboard/pos/table-service");
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Merge failed");
  }
}

export async function transferSeatAction(input: z.infer<typeof transferSeatSchema>) {
  const access = await requireTableServiceAccess("pos.table.transfer_seat");
  if (!access.ok) return fail(access.error);

  const parsed = transferSeatSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid transfer request");

  try {
    const result = await transferSeatOnTab(
      access.actor.userId,
      parsed.data.tabId,
      parsed.data.fromSeatId,
      parsed.data.toSeatId,
    );
    revalidatePath("/dashboard/pos/tabs");
    revalidatePath("/dashboard/pos/table-service");
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Transfer failed");
  }
}

export async function mergeTablesAction(input: z.infer<typeof mergeTablesSchema>) {
  const access = await requireTableServiceAccess("pos.table.merge");
  if (!access.ok) return fail(access.error);

  const parsed = mergeTablesSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid table merge request");

  try {
    const result = await mergeRestaurantTables(
      access.actor.userId,
      parsed.data.sourceTableId,
      parsed.data.targetTableId,
    );
    revalidatePath("/dashboard/tables");
    revalidatePath("/dashboard/pos/tabs");
    revalidatePath("/dashboard/pos/table-service");
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Table merge failed");
  }
}

export async function getServerBankingSummaryAction() {
  const access = await requireTableServiceAccess("pos.table.server_banking");
  if (!access.ok) return fail(access.error);

  try {
    const rows = await getServerBankingSummary(access.actor.userId);
    return ok({ rows });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load server banking");
  }
}

export async function getTipsReconciliationAction(input: z.infer<typeof tipsReconcileSchema>) {
  const access = await requireTableServiceAccess("pos.table.tips_reconcile");
  if (!access.ok) return fail(access.error);

  const parsed = tipsReconcileSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid tips input");

  try {
    const result = await getTipsReconciliation(access.actor.userId, parsed.data.declaredTips);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Tips reconciliation failed");
  }
}
