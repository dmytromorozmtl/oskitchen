'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { fail, ok } from '@/lib/action-result';
import { requireTenantActor } from '@/lib/scope/require-tenant-actor';
import * as tabService from '@/services/pos/tab-service';

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

export async function createTabAction(formData: FormData) {
  const { userId } = await requireTenantActor();
  const parsed = createTabSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    const tab = await tabService.createTab(userId, parsed.data.name, parsed.data.tableId);
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
  const { userId } = await requireTenantActor();
  const parsed = addItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    await tabService.addItemToTab(parsed.data.tabId, userId, parsed.data);
    revalidatePath('/dashboard/pos/tabs');
    return ok({
      item: {
        id: `sync-${Date.now()}`,
        productName: parsed.data.productName,
        quantity: parsed.data.quantity,
        unitPrice: parsed.data.unitPrice,
        totalPrice: parsed.data.unitPrice * parsed.data.quantity,
      },
    });
  } catch {
    return fail("Failed to add item");
  }
}

export async function closeTabAction(formData: FormData) {
  const { userId } = await requireTenantActor();
  const parsed = closeTabSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    await tabService.closeTab(parsed.data.tabId, userId, parsed.data.tip);
    revalidatePath('/dashboard/pos/tabs');
    return ok(undefined);
  } catch {
    return fail("Failed to close tab");
  }
}
