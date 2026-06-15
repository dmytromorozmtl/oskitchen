"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";

export type MealBuilderComponent = {
  id: string;
  label: string;
  price: number;
  required?: boolean;
  maxSelect?: number;
};

export function MealBuilder({
  baseTitle,
  basePrice,
  currency,
  components,
  onChange,
}: {
  baseTitle: string;
  basePrice: number;
  currency: string;
  components: MealBuilderComponent[];
  onChange?: (selection: { componentIds: string[]; total: number }) => void;
}) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const requiredIds = components.filter((c) => c.required).map((c) => c.id);
  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const id of requiredIds) next[id] = true;
    setSelected((prev) => ({ ...next, ...prev }));
  }, [requiredIds.join(",")]);

  const addOnTotal = components
    .filter((c) => selected[c.id])
    .reduce((s, c) => s + c.price, 0);
  const total = basePrice + addOnTotal;

  React.useEffect(() => {
    onChange?.({
      componentIds: Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
      total,
    });
  }, [selected, total, onChange]);

  function toggle(id: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{baseTitle}</CardTitle>
        <CardDescription>
          Build your meal — base {formatCurrency(basePrice, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {components.map((c) => (
          <label
            key={c.id}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3"
          >
            <span className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={Boolean(selected[c.id])}
                disabled={c.required}
                onCheckedChange={(v) => toggle(c.id, v === true)}
              />
              {c.label}
              {c.required ? (
                <span className="text-xs text-muted-foreground">(required)</span>
              ) : null}
            </span>
            <span className="text-sm tabular-nums">
              {c.price > 0 ? `+${formatCurrency(c.price, currency)}` : "Included"}
            </span>
          </label>
        ))}
        <div className="flex items-center justify-between border-t pt-3 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(total, currency)}</span>
        </div>
        <Button type="button" className="w-full rounded-full" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add customized meal to cart
        </Button>
      </CardContent>
    </Card>
  );
}
