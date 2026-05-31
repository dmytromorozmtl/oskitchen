"use client";

import type { TipPoolRules } from "@/lib/labor/tip-pool-settings";
import { saveTipPoolRulesAction } from "@/actions/labor/tip-pooling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const METHODS: { value: TipPoolRules["distributionMethod"]; label: string }[] = [
  { value: "hours_weighted", label: "By hours worked" },
  { value: "role_weighted", label: "By role weight" },
  { value: "equal", label: "Equal split" },
  { value: "hybrid_pos_pool", label: "POS-attributed + pool" },
];

type Props = {
  rules: TipPoolRules;
  canManage: boolean;
};

export function TipPoolRulesForm({ rules, canManage }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pool rules</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveTipPoolRulesAction} className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="enabled" defaultChecked={rules.enabled} disabled={!canManage} />
            Enable tip pooling
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Distribution</span>
            <select
              name="distributionMethod"
              defaultValue={rules.distributionMethod}
              disabled={!canManage}
              className="rounded-md border px-2 py-1.5"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Pool %</span>
            <input
              type="number"
              name="poolPercent"
              min={0}
              max={100}
              step={1}
              defaultValue={rules.poolPercent}
              disabled={!canManage}
              className="rounded-md border px-2 py-1.5"
            />
          </label>
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Eligible roles (comma-separated)</span>
            <input
              type="text"
              name="eligibleRoleTypes"
              defaultValue={rules.eligibleRoleTypes.join(", ")}
              disabled={!canManage}
              className="rounded-md border px-2 py-1.5 font-mono text-xs"
            />
          </label>
          {canManage && (
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground sm:col-span-2 sm:w-fit"
            >
              Save rules
            </button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
