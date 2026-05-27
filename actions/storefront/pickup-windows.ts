'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ok } from '@/lib/action-result';
import { requireStorefrontAdminPermission } from '@/lib/storefront/storefront-admin-access';
import { requireTenantActor } from '@/lib/scope/require-tenant-actor';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().min(4).max(8),
  endTime: z.string().min(4).max(8),
  maxOrders: z.coerce.number().min(1).max(500).default(20),
});

export async function createPickupWindowFormAction(formData: FormData) {
  await createPickupWindowAction(formData);
}

export async function createPickupWindowAction(formData: FormData) {
  await requireStorefrontAdminPermission('storefront.settings');
  const { userId } = await requireTenantActor();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'Invalid data' };

  try {
    await prisma.pickupWindow.create({
      data: {
        userId,
        storeSlug: parsed.data.storeSlug,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        maxOrders: parsed.data.maxOrders,
      },
    });
    revalidatePath('/dashboard/storefront/pickup-windows');
    revalidatePath(`/s/${parsed.data.storeSlug}/checkout`);
    return ok(undefined);
  } catch {
    return { error: 'Failed to create pickup window' };
  }
}
