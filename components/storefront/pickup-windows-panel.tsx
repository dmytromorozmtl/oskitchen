'use client';

import { getActionError } from "@/lib/action-result";
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createPickupWindowAction } from '@/actions/storefront/pickup-windows';
import { useSyncedServerState } from '@/hooks/use-synced-server-state';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface PickupWindowRow {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  active: boolean;
}

function actionErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}

export function PickupWindowsPanel({
  storeSlug,
  initialWindows,
}: {
  storeSlug: string;
  initialWindows: PickupWindowRow[];
}) {
  const [windows, setWindows] = useSyncedServerState(initialWindows);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createPickupWindowAction(formData);
      const _err = getActionError(result);
      if (_err) {
        toast.error(_err);
        return;
      }

      const dayOfWeek = Number(formData.get('dayOfWeek'));
      const startTime = String(formData.get('startTime') ?? '');
      const endTime = String(formData.get('endTime') ?? '');
      const maxOrders = Number(formData.get('maxOrders') ?? 20);

      setWindows((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          dayOfWeek,
          startTime,
          endTime,
          maxOrders,
          currentOrders: 0,
          active: true,
        },
      ]);

      toast.success('Pickup window added');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleCreate} className="rounded-xl border bg-card p-4 space-y-3">
        <input type="hidden" name="storeSlug" value={storeSlug} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Day
            <select
              name="dayOfWeek"
              disabled={pending}
              className="mt-1 w-full h-10 rounded-lg border px-2 text-sm"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Max orders
            <input
              name="maxOrders"
              type="number"
              defaultValue={20}
              min={1}
              disabled={pending}
              className="mt-1 w-full h-10 rounded-lg border px-2 text-sm"
            />
          </label>
          <label className="text-sm">
            Start
            <input
              name="startTime"
              placeholder="08:00"
              required
              disabled={pending}
              className="mt-1 w-full h-10 rounded-lg border px-2 text-sm"
            />
          </label>
          <label className="text-sm">
            End
            <input
              name="endTime"
              placeholder="10:00"
              required
              disabled={pending}
              className="mt-1 w-full h-10 rounded-lg border px-2 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add window'}
        </button>
      </form>

      <ul className="space-y-2">
        {windows.map((w) => (
          <li key={w.id} className="rounded-lg border px-4 py-3 text-sm flex justify-between">
            <span>
              {DAY_LABELS[w.dayOfWeek]} · {w.startTime}–{w.endTime}
            </span>
            <span className="text-muted-foreground">
              {w.currentOrders}/{w.maxOrders} booked · {w.active ? 'Active' : 'Off'}
            </span>
          </li>
        ))}
        {windows.length === 0 && (
          <li className="text-sm text-muted-foreground py-6 text-center">
            No windows yet for this store.
          </li>
        )}
      </ul>
    </div>
  );
}
