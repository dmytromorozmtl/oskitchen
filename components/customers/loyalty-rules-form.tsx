"use client";

import { getActionError } from "@/lib/action-result";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateLoyaltyProgramAction } from "@/actions/loyalty";

export type LoyaltyProgramForm = {
  pointsPerDollar: number;
  redeemPointsThreshold: number;
  redeemValueCents: number;
  active: boolean;
};

export function LoyaltyRulesForm({ program }: { program: LoyaltyProgramForm }) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(program);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);

    const fd = new FormData();
    fd.append("pointsPerDollar", String(form.pointsPerDollar));
    fd.append("redeemPointsThreshold", String(form.redeemPointsThreshold));
    fd.append("redeemValueCents", String(form.redeemValueCents));
    fd.append("active", String(form.active));

    const result = await updateLoyaltyProgramAction(fd);
    setPending(false);

    const _err = getActionError(result); if (_err) { toast.error(_err);
      return;
    }

    toast.success("Loyalty program updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 space-y-4 max-w-lg">
      <div>
        <label className="text-sm font-medium">Points earned per $1 spent</label>
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={form.pointsPerDollar}
          onChange={(e) => setForm({ ...form, pointsPerDollar: Number(e.target.value) })}
          className="mt-1 w-full h-10 rounded-xl border px-3 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Points needed to redeem</label>
          <input
            type="number"
            min={1}
            value={form.redeemPointsThreshold}
            onChange={(e) => setForm({ ...form, redeemPointsThreshold: Number(e.target.value) })}
            className="mt-1 w-full h-10 rounded-xl border px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Redeem value (cents)</label>
          <input
            type="number"
            min={1}
            value={form.redeemValueCents}
            onChange={(e) => setForm({ ...form, redeemValueCents: Number(e.target.value) })}
            className="mt-1 w-full h-10 rounded-xl border px-3 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="h-4 w-4 rounded"
        />
        <span className="text-sm">Program active</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save rules"}
      </button>
    </form>
  );
}
