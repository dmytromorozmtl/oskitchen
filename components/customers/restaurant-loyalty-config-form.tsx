"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateRestaurantLoyaltyConfigAction } from "@/actions/loyalty";
import { getActionError } from "@/lib/action-result";
import type { RestaurantLoyaltyConfig } from "@/lib/loyalty/restaurant-loyalty-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RestaurantLoyaltyConfigForm({ config }: { config: RestaurantLoyaltyConfig }) {
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(config);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData();
    fd.append("enabled", String(form.enabled));
    fd.append("visitRewardEvery", String(form.visitRewardEvery));
    fd.append("visitRewardPoints", String(form.visitRewardPoints));
    fd.append("itemBonusesJson", JSON.stringify(form.itemBonuses));
    fd.append("tiersJson", JSON.stringify(form.tiers));
    const result = await updateRestaurantLoyaltyConfigAction(fd);
    setPending(false);
    const err = getActionError(result);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success("Restaurant loyalty rules saved");
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-xl border bg-card p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold">Restaurant loyalty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Per-item bonuses, visit milestones, and tier multipliers apply at POS earn time.
        </p>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          className="h-4 w-4 rounded"
        />
        <span className="text-sm">Enable restaurant rules (tiers, visits, item bonuses)</span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="visitRewardEvery">Visit reward every N visits</Label>
          <Input
            id="visitRewardEvery"
            type="number"
            min={0}
            value={form.visitRewardEvery}
            onChange={(e) => setForm({ ...form, visitRewardEvery: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visitRewardPoints">Bonus points per milestone</Label>
          <Input
            id="visitRewardPoints"
            type="number"
            min={0}
            value={form.visitRewardPoints}
            onChange={(e) => setForm({ ...form, visitRewardPoints: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Item bonus (title contains)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            placeholder="e.g. salmon"
            value={form.itemBonuses[0]?.titleContains ?? ""}
            onChange={(e) => {
              const bonusPoints = form.itemBonuses[0]?.bonusPoints ?? 10;
              setForm({
                ...form,
                itemBonuses: e.target.value.trim()
                  ? [{ titleContains: e.target.value.trim(), bonusPoints }]
                  : [],
              });
            }}
          />
          <Input
            type="number"
            min={1}
            placeholder="Bonus points"
            value={form.itemBonuses[0]?.bonusPoints ?? 10}
            onChange={(e) => {
              const titleContains = form.itemBonuses[0]?.titleContains ?? "";
              if (!titleContains) return;
              setForm({
                ...form,
                itemBonuses: [{ titleContains, bonusPoints: Number(e.target.value) || 1 }],
              });
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tiers</Label>
        <ul className="divide-y rounded-xl border text-sm">
          {form.tiers.map((tier) => (
            <li key={tier.name} className="flex justify-between px-3 py-2">
              <span className="font-medium">{tier.name}</span>
              <span className="text-muted-foreground">
                {tier.minLifetimePoints}+ pts · {tier.multiplier}x
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Saving…" : "Save restaurant rules"}
      </Button>
    </form>
  );
}
