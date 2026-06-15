'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { fail, ok } from '@/lib/action-result';
import { requireMutationPermission } from '@/lib/permissions/mutation-access';
import { logPosPermissionDenied } from '@/services/pos/pos-permission-audit';
import {
  assignTabItemParticipant,
  clearTabItemParticipants,
} from '@/services/pos/bill-splitting-service';

const assignSchema = z.object({
  tabId: z.string().uuid(),
  itemId: z.string().uuid(),
  participantId: z.string().min(1).max(64).nullable(),
});

const clearSchema = z.object({
  tabId: z.string().uuid(),
});

async function requirePosSplitAccess(operation: string) {
  const access = await requireMutationPermission('pos.access');
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: 'pos.access',
      operation,
    });
  }
  return access;
}

export async function assignTabItemParticipantAction(input: z.infer<typeof assignSchema>) {
  const access = await requirePosSplitAccess('pos.tab.split.assign');
  if (!access.ok) return fail(access.error);

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return fail('Invalid split assignment');

  try {
    await assignTabItemParticipant({
      tabId: parsed.data.tabId,
      itemId: parsed.data.itemId,
      userId: access.actor.userId,
      participantId: parsed.data.participantId,
    });
    revalidatePath('/dashboard/pos/tabs');
    return ok(undefined);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to assign item');
  }
}

export async function clearTabSplitAssignmentsAction(input: z.infer<typeof clearSchema>) {
  const access = await requirePosSplitAccess('pos.tab.split.clear');
  if (!access.ok) return fail(access.error);

  const parsed = clearSchema.safeParse(input);
  if (!parsed.success) return fail('Invalid tab');

  try {
    await clearTabItemParticipants(parsed.data.tabId, access.actor.userId);
    revalidatePath('/dashboard/pos/tabs');
    return ok(undefined);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to clear split assignments');
  }
}
