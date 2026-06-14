"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-policy";
import {
  computeDoorDashUberVsOwnedCommission,
  DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
  formatCommissionComparisonUsd,
  type DoorDashUberVsOwnedInputs,
} from "@/lib/marketing/commission-comparison-calculator-p2-54-measurement";

export function CommissionComparisonDoorDashUberPanel() {
  const [inputs, setInputs] = React.useState<DoorDashUberVsOwnedInputs>(
    DOORDASH_UBER_VS_OWNED_DEFAULT_INPUTS,
  );
  const result = computeDoorDashUberVsOwnedCommission(inputs);

  function setNumber<K extends keyof DoorDashUberVsOwnedInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-primary/5 p-6"
      data-testid="commission-comparison-doordash-uber-p2-54"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Interactive — DoorDash {COMMISSION_COMPARISON_CALCULATOR_P2_54_DOORDASH_BENCHMARK_PCT}% vs Uber Eats{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P2_54_UBER_EATS_BENCHMARK_PCT}% vs owned{" "}
        {COMMISSION_COMPARISON_CALCULATOR_P2_54_OWNED_MARKETPLACE_PCT}%
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter delivery volume and channel mix — savings update instantly. Directional benchmarks
        only; verify against your DoorDash and Uber Eats settlement statements. Results are{" "}
        <strong>not guaranteed</strong>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          label="DoorDash mix %"
          value={inputs.doordashMixPct}
          onChange={(v) => setNumber("doordashMixPct", v)}
        />
        <Field
          label="Uber Eats mix %"
          value={inputs.uberEatsMixPct}
          onChange={(v) => setNumber("uberEatsMixPct", v)}
        />
        <Field
          label="Own-channel processing %"
          value={inputs.ownChannelProcessingPct}
          onChange={(v) => setNumber("ownChannelProcessingPct", v)}
        />
      </div>

      {result.mixTotalPct > 0 && result.mixTotalPct !== 100 ? (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          Mix normalized to 100% (entered {result.mixTotalPct}% total).
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[result.doordash, result.uberEats].map((row) => (
          <div
            key={row.provider}
            className="rounded-xl border border-border/80 bg-card p-4"
            data-testid={`commission-comparison-${row.provider.toLowerCase()}-row`}
          >
            <p className="text-xs font-medium uppercase text-muted-foreground">{row.label} commission</p>
            <p className="mt-1 text-2xl font-bold">
              {formatCommissionComparisonUsd(row.commissionMonthly)}
              <span className="text-sm font-normal text-muted-foreground"> / mo</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.commissionRatePct}% on {formatCommissionComparisonUsd(row.grossMonthly)} gross
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Savings vs owned: {formatCommissionComparisonUsd(row.monthlySavingsVsOwned)}/mo
            </p>
          </div>
        ))}
      </div>

      <div
        className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
        data-testid="commission-comparison-doordash-uber-savings"
      >
        <p className="text-xs font-medium uppercase text-emerald-800 dark:text-emerald-200">
          Combined directional savings vs owned channel
        </p>
        <p className="mt-1 text-3xl font-bold text-emerald-900 dark:text-emerald-100">
          {formatCommissionComparisonUsd(result.combinedMonthlySavingsVsOwned)}
          <span className="text-base font-normal text-muted-foreground"> / month</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ~{formatCommissionComparisonUsd(result.combinedAnnualSavingsVsOwned)} / year — marketplace{" "}
          {formatCommissionComparisonUsd(result.combinedMarketplaceCommissionMonthly)} vs owned fees{" "}
          {formatCommissionComparisonUsd(result.ownedFeesMonthly)}
        </p>
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
