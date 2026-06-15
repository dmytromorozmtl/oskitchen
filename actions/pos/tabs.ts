'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { fail, ok } from '@/lib/action-result';
import { AUDIT_ACTIONS } from '@/lib/audit/audit-actions';
import { requireMutationPermission } from '@/lib/permissions/mutation-access';
import type { PermissionKey } from '@/lib/permissions/permissions';
import * as tabService from '@/services/pos/tab-service';
import { logPosPermissionDenied, logPosTabEvent } from '@/services/pos/pos-permission-audit';

const createTabSchema = z.object({
  name: z.string().min(1).max(50),
  tableId: z.string().uuid().optional(),
});

const addItemSchema = z.object({
  tabId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.coerce.number().min(1).default(1),
  unitPrice: z.coerce.number().min(0),
});

const closeTabSchema = z.object({
  tabId: z.string().uuid(),
  tip: z.coerce.number().min(0).default(0),
});

async function requirePosTabPermission(required: PermissionKey, operation: string) {
  const access = await requireMutationPermission(required);
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: required,
      operation,
    });
  }
  return access;
}

export async function createTabAction(formData: FormData) {
  const access = await requirePosTabPermission('pos.access', 'pos.tab.create');
  if (!access.ok) return fail(access.error);
  const { actor } = access;
  const parsed = createTabSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    const tab = await tabService.createTab(actor.userId, parsed.data.name, parsed.data.tableId);
    await logPosTabEvent(actor, {
      action: AUDIT_ACTIONS.POS_TAB_OPENED,
      entityId: tab.id,
      label: tab.name,
      metadata: { tableId: tab.tableId ?? null },
    });
    revalidatePath('/dashboard/pos/tabs');
    return ok({
      tab: {
        id: tab.id,
        name: tab.name,
        status: tab.status,
        subtotal: Number(tab.subtotal),
        tax: Number(tab.tax),
        tip: Number(tab.tip),
        total: Number(tab.total),
        tableId: tab.tableId,
        items: [],
      },
    });
  } catch {
    return fail("Failed to create tab");
  }
}

export async function addItemToTabAction(formData: FormData) {
  const access = await requirePosTabPermission('pos.access', 'pos.tab.item.add');
  if (!access.ok) return fail(access.error);
  const { actor } = access;
  const parsed = addItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    const totalPrice = parsed.data.unitPrice * parsed.data.quantity;
    const tab = await tabService.addItemToTab(parsed.data.tabId, actor.userId, parsed.data);
    await logPosTabEvent(actor, {
      action: AUDIT_ACTIONS.POS_TAB_ITEM_ADDED,
      entityId: tab.id,
      label: tab.name,
      metadata: {
        productName: parsed.data.productName,
        quantity: parsed.data.quantity,
        unitPrice: parsed.data.unitPrice,
        totalPrice,
      },
    });
    revalidatePath('/dashboard/pos/tabs');
    return ok({
      item: {
        id: `sync-${Date.now()}`,
        productName: parsed.data.productName,
        quantity: parsed.data.quantity,
        unitPrice: parsed.data.unitPrice,
        totalPrice,
      },
    });
  } catch {
    return fail("Failed to add item");
  }
}

export async function closeTabAction(formData: FormData) {
  const access = await requirePosTabPermission('pos.checkout', 'pos.tab.close');
  if (!access.ok) return fail(access.error);
  const { actor } = access;
  const parsed = closeTabSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    const tab = await tabService.closeTab(parsed.data.tabId, actor.userId, parsed.data.tip);
    await logPosTabEvent(actor, {
      action: AUDIT_ACTIONS.POS_TAB_CLOSED,
      entityId: tab.id,
      label: tab.name,
      metadata: {
        tip: parsed.data.tip,
        subtotal: Number(tab.subtotal),
        tax: Number(tab.tax),
        total: Number(tab.total),
      },
    });
    revalidatePath('/dashboard/pos/tabs');
    return ok(undefined);
  } catch {
    return fail("Failed to close tab");
  }
}
