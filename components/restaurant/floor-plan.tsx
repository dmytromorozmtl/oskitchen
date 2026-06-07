'use client';

import { getActionError, isActionSuccess } from "@/lib/action-result";


import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

import {
  createRestaurantTable,
  deleteRestaurantTable,
  updateTableStatusAction,
} from '@/actions/restaurant/tables';
import { useSyncedServerState } from '@/hooks/use-synced-server-state';
import { tablesideOrderHref } from '@/lib/pos/tableside-ordering-flow-policy';

export interface TableData {
  id: string;
  name: string;
  section: string | null;
  capacity: number;
  status: string;
  shape: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  currentOrderId: string | null;
  currentOrderCustomer: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 border-emerald-400 text-emerald-800',
  OCCUPIED: 'bg-rose-100 border-rose-400 text-rose-800',
  RESERVED: 'bg-amber-100 border-amber-400 text-amber-800',
  DIRTY: 'bg-orange-100 border-orange-400 text-orange-800',
  CLEANING: 'bg-blue-100 border-blue-400 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Free',
  OCCUPIED: 'Seated',
  RESERVED: 'Reserved',
  DIRTY: 'Dirty',
  CLEANING: 'Cleaning',
};

function actionErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') return 'Please check the form and try again.';
  return 'Something went wrong';
}

export function FloorPlan({ tables: initialTables }: { tables: TableData[] }) {
  const [tables, setTables] = useSyncedServerState(initialTables);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await createRestaurantTable(formData);
      const _err = getActionError(result);
      if (_err) {
        toast.error(_err);
        return;
      }
      if (isActionSuccess<{ table: TableData }>(result) && result.data?.table) {
        const table = result.data.table;
        setTables((prev) => [...prev, table]);
      }
      toast.success('Table created');
      setShowAddForm(false);
      router.refresh();
    });
  }

  function handleStatusChange(tableId: string, status: string) {
    const previous = tables.find((t) => t.id === tableId)?.status;
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
    setShowStatusMenu(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('tableId', tableId);
      fd.append('status', status);
      const result = await updateTableStatusAction(fd);
      const _err = getActionError(result);
      if (_err) {
        if (previous) {
          setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: previous } : t)));
        }
        toast.error(_err);
        router.refresh();
        return;
      }
      toast.success(`Table marked ${STATUS_LABELS[status] ?? status}`);
      router.refresh();
    });
  }

  function handleDelete(tableId: string) {
    if (!confirm('Delete this table?')) return;
    const snapshot = tables;
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    setShowStatusMenu(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('tableId', tableId);
      const result = await deleteRestaurantTable(fd);
      const _err = getActionError(result);
      if (_err) {
        setTables(snapshot);
        toast.error(_err);
        router.refresh();
        return;
      }
      toast.success('Table removed');
      router.refresh();
    });
  }

  const sections = [...new Set(tables.map((t) => t.section || 'Main'))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Floor Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tables.length} table{tables.length !== 1 ? 's' : ''} · Click a table to change status
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add Table
        </button>
      </div>

      {showAddForm && (
        <form action={handleAdd} className="rounded-xl border bg-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input
              name="name"
              placeholder="Table name (e.g. T1)"
              required
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
            <input
              name="section"
              placeholder="Section (e.g. Patio)"
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
            <input
              name="capacity"
              type="number"
              defaultValue={4}
              min={1}
              max={20}
              disabled={pending}
              className="h-10 rounded-xl border px-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm disabled:opacity-60"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs">
            <span className={`h-3 w-3 rounded-full border ${STATUS_COLORS[status].split(' ')[1]}`} />
            {label}
          </div>
        ))}
      </div>

      {sections.map((section) => (
        <div key={section}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {section}
          </h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {tables
              .filter((t) => (t.section || 'Main') === section)
              .map((table) => (
                <div key={table.id} className="relative">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setShowStatusMenu(showStatusMenu === table.id ? null : table.id)
                    }
                    className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-md ${STATUS_COLORS[table.status]}`}
                  >
                    <span className="text-lg font-bold">{table.name}</span>
                    <span className="text-[10px]">{table.capacity}p</span>
                    {table.currentOrderCustomer && (
                      <span className="text-[9px] mt-0.5 truncate max-w-full px-1">
                        {table.currentOrderCustomer}
                      </span>
                    )}
                  </button>

                  {showStatusMenu === table.id && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-40 rounded-xl border bg-popover shadow-lg p-1">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          type="button"
                          disabled={pending}
                          onClick={() => handleStatusChange(table.id, status)}
                          className={`w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-muted ${table.status === status ? 'font-semibold' : ''}`}
                        >
                          {label}
                        </button>
                      ))}
                      <hr className="my-1" />
                      <Link
                        href={tablesideOrderHref(table.id)}
                        className="flex w-full items-center gap-1 px-3 py-1.5 text-xs rounded-lg hover:bg-muted text-primary"
                        data-testid="floor-plan-tableside-order-link"
                        onClick={() => setShowStatusMenu(null)}
                      >
                        <UtensilsCrossed className="h-3 w-3" aria-hidden />
                        Order at table
                      </Link>
                      <hr className="my-1" />
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDelete(table.id)}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {tables.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No tables yet</p>
          <p className="text-sm">Add your first table to start managing your floor plan.</p>
        </div>
      )}
    </div>
  );
}
