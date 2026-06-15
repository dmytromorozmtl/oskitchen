"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  previewLoyalty2ProgramAction,
  saveLoyalty2ProgramAction,
} from "@/actions/loyalty-2";
import { getActionError } from "@/lib/action-result";
import type { ItemBonusRule, RestaurantLoyaltyConfig } from "@/lib/loyalty/restaurant-loyalty-settings";
import { LOYALTY_2_TIER_LADDER } from "@/lib/loyalty/restaurant-loyalty-settings";
import type { Loyalty2Program } from "@/services/loyalty/loyalty-2.0-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LoyaltyProgramBuilderProps = {
  program: Loyalty2Program;
  sampleProducts: Array<{ id: string; title: string; price: number }>;
};

export function LoyaltyProgramBuilder({ program, sampleProducts }: LoyaltyProgramBuilderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [rules, setRules] = useState<RestaurantLoyaltyConfig>({
    enabled: program.enabled,
    visitRewardEvery: program.visitRewardEvery,
    visitRewardPoints: program.visitRewardPoints,
    itemBonuses: program.itemBonuses,
    tiers: program.tiers,
    birthdayRewardEnabled: program.birthdayRewardEnabled,
    birthdayRewardPoints: program.birthdayRewardPoints,
    referralBonusEnabled: program.referralBonusEnabled,
    referralBonusPoints: program.referralBonusPoints,
    visitFreeItemEvery: program.visitFreeItemEvery,
    visitFreeItemTitleContains: program.visitFreeItemTitleContains,
  });
  const [pointsPerDollar, setPointsPerDollar] = useState(program.pointsPerDollar);
  const [previewItemId, setPreviewItemId] = useState(sampleProducts[0]?.id ?? "");

  const previewProduct = sampleProducts.find((p) => p.id === previewItemId) ?? sampleProducts[0];

  const tierSummary = useMemo(
    () =>
      LOYALTY_2_TIER_LADDER.map((t) => (
        <Badge key={t.name} variant="secondary" className="mr-1">
          {t.name} {t.minLifetimePoints}+
        </Badge>
      )),
    [],
  );

  function updateItemBonus(index: number, patch: Partial<ItemBonusRule>) {
    setRules((prev) => {
      const next = [...prev.itemBonuses];
      next[index] = { ...next[index]!, ...patch };
      return { ...prev, itemBonuses: next };
    });
  }

  function addItemBonus() {
    setRules((prev) => ({
      ...prev,
      itemBonuses: [...prev.itemBonuses, { titleContains: "latte", bonusPoints: 10 }],
    }));
  }

  function onSave() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("pointsPerDollar", String(pointsPerDollar));
      fd.set("redeemPointsThreshold", String(program.redeemPointsThreshold));
      fd.set("redeemValueCents", String(program.redeemValueCents));
      fd.set("programActive", String(program.programActive));
      fd.set("configJson", JSON.stringify(rules));
      const res = await saveLoyalty2ProgramAction(fd);
      const err = getActionError(res);
      if (err) {
        setPreviewText(`Error: ${err}`);
        return;
      }
      router.refresh();
      setPreviewText("Program saved.");
    });
  }

  function onPreview() {
    startTransition(async () => {
      const lines = previewProduct
        ? [
            {
              title: previewProduct.title,
              productId: previewProduct.id,
              quantity: 1,
              lineTotal: previewProduct.price,
            },
          ]
        : [];
      const fd = new FormData();
      fd.set("orderTotal", String(previewProduct?.price ?? 12));
      fd.set("linesJson", JSON.stringify(lines));
      fd.set("visitCount", String(rules.visitFreeItemEvery || 10));
      const res = await previewLoyalty2ProgramAction(fd);
      const err = getActionError(res);
      if (err) {
        setPreviewText(`Preview error: ${err}`);
        return;
      }
      if ("data" in res && res.data?.preview) {
        setPreviewText(res.data.preview.humanSummary);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loyalty 2.0 program builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-assisted rule design — points per item, visit rewards, birthdays, referrals, and
          Silver / Gold / Platinum tiers. Review the preview before saving.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">{tierSummary}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base earn</CardTitle>
          <CardDescription>Fallback when an item has no specific bonus rule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="ppd">Points per dollar</Label>
          <Input
            id="ppd"
            type="number"
            step="0.1"
            className="mt-2 max-w-[140px]"
            value={pointsPerDollar}
            onChange={(e) => setPointsPerDollar(Number(e.target.value) || 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Points per menu item</CardTitle>
          <CardDescription>e.g. Espresso = 5 pts, Latte = 10 pts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.itemBonuses.map((rule, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Title contains"
                value={rule.titleContains ?? ""}
                onChange={(e) => updateItemBonus(i, { titleContains: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Bonus pts"
                value={rule.bonusPoints}
                onChange={(e) =>
                  updateItemBonus(i, { bonusPoints: Number(e.target.value) || 0 })
                }
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addItemBonus}>
            Add item rule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visit & birthday rewards</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Free item every N visits (title match)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                value={rules.visitFreeItemEvery}
                onChange={(e) =>
                  setRules({ ...rules, visitFreeItemEvery: Number(e.target.value) || 0 })
                }
              />
              <Input
                placeholder="e.g. coffee"
                value={rules.visitFreeItemTitleContains}
                onChange={(e) =>
                  setRules({ ...rules, visitFreeItemTitleContains: e.target.value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Example: 10th coffee free when order includes &quot;coffee&quot;.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={rules.birthdayRewardEnabled}
              onChange={(e) => setRules({ ...rules, birthdayRewardEnabled: e.target.checked })}
            />
            Birthday reward (customer tagsJson.birthday as MM-DD)
          </label>
          <div className="space-y-2">
            <Label>Birthday bonus points</Label>
            <Input
              type="number"
              value={rules.birthdayRewardPoints}
              onChange={(e) =>
                setRules({ ...rules, birthdayRewardPoints: Number(e.target.value) || 0 })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rules.referralBonusEnabled}
              onChange={(e) => setRules({ ...rules, referralBonusEnabled: e.target.checked })}
            />
            Refer a friend — both get bonus pts
          </label>
          <div className="space-y-2">
            <Label>Referral bonus (each)</Label>
            <Input
              type="number"
              value={rules.referralBonusPoints}
              onChange={(e) =>
                setRules({ ...rules, referralBonusPoints: Number(e.target.value) || 0 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>Simulate earn for a sample item and visit count.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleProducts.length > 0 ? (
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={previewItemId}
              onChange={(e) => setPreviewItemId(e.target.value)}
            >
              {sampleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — ${p.price.toFixed(2)}
                </option>
              ))}
            </select>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={pending}
              onClick={onPreview}
            >
              Preview earn
            </Button>
            <Button
              type="button"
              className="rounded-full"
              disabled={pending}
              onClick={onSave}
            >
              {pending ? "Saving…" : "Save program"}
            </Button>
          </div>
          {previewText ? (
            <p className="rounded-lg bg-muted/60 p-3 text-sm">{previewText}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
