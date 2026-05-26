"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { bulkUpdatePricesAction, undoBulkPricesAction } from "@/actions/purchasing/bulk-price";

type Row = {
  id: string;
  supplierName: string;
  ingredientName: string;
  unitCost: number;
};

export function BulkPricingTable({ items }: { items: Row[] }) {
  const [rows, setRows] = useState(items);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setPending(true);
    const previous = [...rows];
    const fd = new FormData();
    fd.set(
      "updates",
      JSON.stringify(rows.map((r) => ({ supplierItemId: r.id, unitCost: r.unitCost }))),
    );
    const result = await bulkUpdatePricesAction(fd);
    setPending(false);

    const _err = getActionError(result); if (_err) {
      setRows(previous);
      toast.error(getActionError(result) ?? "Something went wrong");
      return;
    }

    toast.success(`Updated ${result?.updated ?? rows.length} prices`);
    router.refresh();
  }

  async function handleUndo() {
    setPending(true);
    const result = await undoBulkPricesAction();
    setPending(false);
    const _err = getActionError(result); if (_err) { toast.error(_err);
      return;
    }
    toast.success(`Reverted ${result?.undone ?? 0} price change(s)`);
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No supplier items to edit for this filter.</p>;
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2">Supplier</th>
            <th className="pb-2">Ingredient</th>
            <th className="pb-2 text-right">Unit cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, idx) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.supplierName}</td>
              <td className="py-2">{item.ingredientName}</td>
              <td className="py-2 text-right">
                <input
                  type="number"
                  step="0.0001"
                  value={item.unitCost}
                  className="w-24 rounded border px-2 py-1 text-right"
                  onChange={(e) => {
                    const next = [...rows];
                    next[idx] = { ...item, unitCost: Number(e.target.value) };
                    setRows(next);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void handleSave()}
          className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save all prices"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void handleUndo()}
          className="rounded-xl border px-4 py-2 text-sm disabled:opacity-50"
        >
          Undo last batch
        </button>
      </div>
    </div>
  );
}
