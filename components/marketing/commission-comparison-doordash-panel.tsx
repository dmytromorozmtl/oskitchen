"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-policy";
import {
  computeDoorDashVsOwnedCommission,
  DOORDASH_VS_OWNED_DEFAULT_INPUTS,
  formatCommissionUsdShort,
  type DoorDashVsOwnedInputs,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-measurement";

export function CommissionComparisonDoorDashPanel() {
  const [inputs, setInputs] = React.useState<DoorDashVsOwnedInputs>(DOORDASH_VS_OWNED_DEFAULT_INPUTS);
  const result = computeDoorDashVsOwnedCommission(inputs);

  function setNumber<K extends keyof DoorDashVsOwnedInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
      data-testid="commission-comparison-doordash-p2-46"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        ChowNow parity — directional DoorDash {COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT}% vs owned{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT}%
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Directional benchmark — reconcile against your DoorDash settlement statement. Owned channel
        models {COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT}% marketplace commission
        plus payment processing only.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field
          label="Monthly delivery orders"
          value={inputs.monthlyOrders}
          onChange={(v) => setNumber("monthlyOrders", v)}
        />
        <Field
          label="Average order value ($)"
          value={inputs.averageOrderValue}
          onChange={(v) => setNumber("averageOrderValue", v)}
        />
        <Field
          label="DoorDash mix % (directional benchmark)"
          value={inputs.doordashMixPct}
          onChange={(v) => setNumber("doordashMixPct", v)}
        />
        <Field
          label="Own-channel processing %"
          value={inputs.ownChannelProcessingPct}
          onChange={(v) => setNumber("ownChannelProcessingPct", v)}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Directional DoorDash commission</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCommissionUsdShort(result.doordashCommissionMonthly)}
            <span className="text-sm font-normal text-muted-foreground"> / mo</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.doordashCommissionRatePct}% on {formatCommissionUsdShort(result.grossMonthly)} gross
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted-foreground">Owned channel fees</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCommissionUsdShort(
              result.ownedMarketplaceCommissionMonthly + result.ownedProcessingFeesMonthly,
            )}
            <span className="text-sm font-normal text-muted-foreground"> / mo</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result.ownedMarketplaceRatePct}% marketplace + {inputs.ownChannelProcessingPct}% processing
          </p>
        </div>
        <div
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          data-testid="commission-comparison-doordash-savings"
        >
          <p className="text-xs font-medium uppercase text-emerald-800 dark:text-emerald-200">
            Directional monthly savings
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCommissionUsdShort(result.monthlySavingsVsDoordash)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            ~{formatCommissionUsdShort(result.annualSavingsVsDoordash)} / year — not guaranteed
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        step={label.includes("$") ? 0.01 : 1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
