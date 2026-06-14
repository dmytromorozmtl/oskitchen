"use client";

import { useState, useTransition } from "react";

import { saveNativeBudgetTargetsAction } from "@/actions/finance/native-budgeting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES } from "@/lib/finance/native-budgeting-p3-91-content";
import type {
  NativeBudgetCategoryKey,
  NativeBudgetSettings,
  NativeBudgetVsActualModel,
} from "@/lib/finance/native-budgeting-types";
import { cn } from "@/lib/utils";

type NativeBudgetingPanelProps = {
  model: NativeBudgetVsActualModel;
  settings: NativeBudgetSettings;
  canEdit: boolean;
};

function pctInputValue(key: NativeBudgetCategoryKey, settings: NativeBudgetSettings): string {
  const override = settings.categoryOverrides[key];
  if (override != null) return String(Math.round(override * 1000) / 10);
  const def = NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.find((c) => c.key === key);
  return String(Math.round((def?.percentOfRevenue ?? 0) * 1000) / 10);
}

export function NativeBudgetingPanel({ model, settings, canEdit }: NativeBudgetingPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [revenueTarget, setRevenueTarget] = useState(
    settings.revenueTargetUsd != null ? String(settings.revenueTargetUsd) : "",
  );
  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const cat of NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES) {
      init[cat.key] = pctInputValue(cat.key, settings);
    }
    return init;
  });

  function handleSave() {
    setMessage(null);
    const categoryOverrides: Partial<Record<NativeBudgetCategoryKey, number>> = {};
    for (const cat of NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES) {
      const raw = overrides[cat.key];
      if (!raw?.trim()) continue;
      const pct = Number(raw) / 100;
      if (!Number.isFinite(pct)) continue;
      categoryOverrides[cat.key] = pct;
    }
    const revenueTargetUsd = revenueTarget.trim() ? Number(revenueTarget) : null;

    startTransition(async () => {
      const result = await saveNativeBudgetTargetsAction({
        revenueTargetUsd,
        categoryOverrides,
      });
      setMessage(result.ok ? "Budget targets saved." : result.error);
    });
  }

  return (
    <div className="space-y-6" data-testid="native-budgeting-panel">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Revenue actual
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ${model.revenueActual.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Revenue budget
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            ${model.revenueBudget.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Target source
          </p>
          <p className="mt-1 text-sm font-medium">
            {model.usesOperatorTargets ? "Operator targets" : "Industry defaults"}
          </p>
        </div>
      </div>

      {canEdit ? (
        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
          <h2 className="text-sm font-semibold">Set budget targets (no accountant required)</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="revenue-target">Monthly revenue target (USD)</Label>
              <Input
                id="revenue-target"
                type="number"
                min={0}
                placeholder="Uses actual revenue if blank"
                value={revenueTarget}
                onChange={(e) => setRevenueTarget(e.target.value)}
              />
            </div>
            {NATIVE_BUDGETING_P3_91_DEFAULT_CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-1.5">
                <Label htmlFor={`budget-${cat.key}`}>{cat.label} (% of revenue)</Label>
                <Input
                  id={`budget-${cat.key}`}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={overrides[cat.key] ?? ""}
                  onChange={(e) =>
                    setOverrides((prev) => ({ ...prev, [cat.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={handleSave} disabled={pending}>
              {pending ? "Saving…" : "Save budget targets"}
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm" aria-label="Budget vs actual">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-muted-foreground">
              <th className="px-4 py-2">Line</th>
              <th className="px-4 py-2 text-right">Actual</th>
              <th className="px-4 py-2 text-right">Budget</th>
              <th className="px-4 py-2 text-right">Variance</th>
              <th className="px-4 py-2 text-right">Var %</th>
            </tr>
          </thead>
          <tbody>
            {model.lines.map((line) => (
              <tr
                key={line.key}
                className={cn(
                  "border-b border-border/60",
                  line.isSubtotal && "bg-muted/30 font-semibold",
                )}
                data-testid={`native-budget-line-${line.key}`}
              >
                <td className="px-4 py-2">{line.label}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  ${line.actual.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">
                  ${line.budget.toLocaleString()}
                </td>
                <td
                  className={cn(
                    "px-4 py-2 text-right tabular-nums",
                    line.variance > 0 ? "text-destructive" : "text-emerald-600",
                  )}
                >
                  {line.variance >= 0 ? "+" : ""}
                  {line.variance.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                  {line.variancePct != null ? `${line.variancePct}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
