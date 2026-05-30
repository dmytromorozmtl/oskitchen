'use server';

import type { TableStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { fail, ok } from '@/lib/action-result';
import { requireRestaurantTableMutation } from '@/lib/restaurant/require-restaurant-table-mutation';
import * as tableService from '@/services/restaurant/table-service';

const createTableSchema = z.object({
  name: z.string().min(1, 'Table name is required').max(20),
  section: z.string().optional(),
  capacity: z.coerce.number().min(1).max(20).default(4),
});

const updatePositionSchema = z.object({
  tableId: z.string().uuid(),
  positionX: z.coerce.number(),
  positionY: z.coerce.number(),
});

const updateStatusSchema = z.object({
  tableId: z.string().uuid(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'DIRTY', 'CLEANING']),
});

const deleteTableSchema = z.object({
  tableId: z.string().uuid(),
});

export async function createRestaurantTable(formData: FormData) {
  const gate = await requireRestaurantTableMutation({ operation: 'restaurant_tables.create' });
  if (!gate.ok) return fail(gate.error);
  const { userId } = gate.actor;
  const parsed = createTableSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid table data");

  try {
    const table = await tableService.createTable(userId, parsed.data);
    revalidatePath('/dashboard/tables');
    revalidatePath('/dashboard/floor-plans');
    return ok({
      table: {
        id: table.id,
        name: table.name,
        section: table.section,
        capacity: table.capacity,
        status: table.status,
        shape: table.shape,
        positionX: table.positionX,
        positionY: table.positionY,
        width: table.width,
        height: table.height,
        currentOrderId: null,
        currentOrderCustomer: null,
      },
    });
  } catch {
    return fail("Failed to create table");
  }
}

export async function updateTablePosition(formData: FormData) {
  const gate = await requireRestaurantTableMutation({ operation: 'restaurant_tables.update_position' });
  if (!gate.ok) return fail(gate.error);
  const { userId } = gate.actor;
  const parsed = updatePositionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    await tableService.updateTablePosition(parsed.data.tableId, userId, parsed.data);
    revalidatePath('/dashboard/tables');
    revalidatePath('/dashboard/floor-plans');
    return ok(undefined);
  } catch {
    return fail("Failed to update table");
  }
}

export async function updateTableStatusAction(formData: FormData) {
  const gate = await requireRestaurantTableMutation({ operation: 'restaurant_tables.update_status' });
  if (!gate.ok) return fail(gate.error);
  const { userId } = gate.actor;
  const parsed = updateStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    await tableService.updateTableStatus(
      parsed.data.tableId,
      userId,
      parsed.data.status as TableStatus,
    );
    revalidatePath('/dashboard/tables');
    revalidatePath('/dashboard/floor-plans');
    return ok(undefined);
  } catch {
    return fail("Failed to update table status");
  }
}

export async function deleteRestaurantTable(formData: FormData) {
  const gate = await requireRestaurantTableMutation({ operation: 'restaurant_tables.delete' });
  if (!gate.ok) return fail(gate.error);
  const { userId } = gate.actor;
  const parsed = deleteTableSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Invalid data");

  try {
    await tableService.deleteTable(parsed.data.tableId, userId);
    revalidatePath('/dashboard/tables');
    revalidatePath('/dashboard/floor-plans');
    return ok(undefined);
  } catch {
    return fail("Failed to delete table");
  }
}
