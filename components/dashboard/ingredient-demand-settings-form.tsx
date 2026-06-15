"use client";

import { useTransition } from "react";

import { saveIngredientDemandSettingsAction } from "@/app/dashboard/inventory/demand/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMAND_SOURCE_CATALOG } from "@/lib/ingredient-demand/demand-sources";
import type { IngredientDemandSettings } from "@/lib/ingredient-demand/settings";

type Props = { initial: IngredientDemandSettings };

export function IngredientDemandSettingsForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        const globalWasteBufferPercent = Number(formData.get("globalWaste") ?? initial.globalWasteBufferPercent);
        const batchRounding = String(
          formData.get("batchRounding") ?? initial.batchRounding,
        ) as IngredientDemandSettings["batchRounding"];
        const enabledSources = { ...initial.enabledSources };
        for (const s of DEMAND_SOURCE_CATALOG) {
          enabledSources[s.id] = {
            enabled: formData.get(`src_${s.id}`) === "on",
            confidence: initial.enabledSources[s.id]?.confidence ?? s.defaultConfidence,
          };
        }
        startTransition(async () => {
          await saveIngredientDemandSettingsAction({
            globalWasteBufferPercent,
            ingredientWasteBufferPercentById: initial.ingredientWasteBufferPercentById,
            batchRounding,
            enabledSources,
          });
        });
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Waste & rounding</CardTitle>
          <CardDescription>
            Replaces the old hardcoded 5% buffer — defaults still start at 5% until you change them.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="globalWaste">Global waste buffer (%)</Label>
            <Input
              id="globalWaste"
              name="globalWaste"
              type="number"
              min={0}
              max={100}
              step={0.5}
              defaultValue={initial.globalWasteBufferPercent}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batchRounding">Batch rounding</Label>
            <select
              id="batchRounding"
              name="batchRounding"
              defaultValue={initial.batchRounding}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="none">None</option>
              <option value="ceil">Ceil</option>
              <option value="floor">Floor</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demand sources</CardTitle>
          <CardDescription>
            Turn sources on only when your ops model needs them — stubs stay informational.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMAND_SOURCE_CATALOG.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3"
            >
              <input
                type="checkbox"
                name={`src_${s.id}`}
                defaultChecked={Boolean(initial.enabledSources[s.id]?.enabled)}
                className="mt-1 h-4 w-4 rounded border-input"
              />
              <span>
                <span className="font-medium">{s.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{s.description}</span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
