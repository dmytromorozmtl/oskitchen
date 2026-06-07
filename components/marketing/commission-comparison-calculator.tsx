'use client';

import * as React from 'react';

import { MarketingButton } from '@/components/marketing/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  COMMISSION_COMPARISON_DEFAULT_INPUTS,
  COMMISSION_COMPARISON_DISCLAIMER,
  computeCommissionComparison,
  formatCommissionUsd,
  type CommissionComparisonInputs,
} from '@/lib/marketing/commission-comparison-calculator-content';
import { COMMISSION_COMPARISON_DASHBOARD_ROUTE } from '@/lib/marketing/commission-comparison-calculator-absolute-final-policy';
import { OWN_YOUR_CHANNEL_UPSELL_ROUTE } from '@/lib/marketing/own-your-channel-upsell-absolute-final-policy';

type MixField = 'doordashMixPct' | 'uberEatsMixPct' | 'grubhubMixPct' | 'uberDirectMixPct';

const MIX_FIELDS: Array<{ key: MixField; label: string }> = [
  { key: 'doordashMixPct', label: 'DoorDash mix %' },
  { key: 'uberEatsMixPct', label: 'Uber Eats mix %' },
  { key: 'grubhubMixPct', label: 'Grubhub mix %' },
  { key: 'uberDirectMixPct', label: 'Uber Direct mix %' },
];

export function CommissionComparisonCalculator({ compact = false }: { compact?: boolean }) {
  const [inputs, setInputs] = React.useState<CommissionComparisonInputs>(
    COMMISSION_COMPARISON_DEFAULT_INPUTS,
  );

  const result = computeCommissionComparison(inputs);

  function setNumber<K extends keyof CommissionComparisonInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="space-y-8"
      data-testid="commission-comparison-calculator"
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        Compare marketplace delivery commission using{' '}
        <strong>estimated benchmark</strong> rates (same source as the delivery-commissions dashboard)
        vs an owned storefront with payment processing only.{' '}
        {COMMISSION_COMPARISON_DISCLAIMER} Results are{' '}
        <strong>not guaranteed</strong> savings — reconcile every channel against your settlement
        statement.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Delivery volume
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Monthly delivery orders"
              value={inputs.monthlyOrders}
              onChange={(v) => setNumber('monthlyOrders', v)}
            />
            <Field
              label="Average order value ($)"
              value={inputs.averageOrderValue}
              onChange={(v) => setNumber('averageOrderValue', v)}
            />
            <Field
              label="Own-channel processing %"
              value={inputs.ownChannelProcessingPct}
              onChange={(v) => setNumber('ownChannelProcessingPct', v)}
              hint="Payment processing estimate — not marketplace commission"
            />
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Channel mix
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {MIX_FIELDS.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                value={inputs[field.key]}
                onChange={(v) => setNumber(field.key, v)}
              />
            ))}
          </div>
          {result.mixTotalPct > 0 && result.mixTotalPct !== 100 ? (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              Mix normalized to 100% (entered {result.mixTotalPct}% total).
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Marketplace commission (estimated benchmark)
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatCommissionUsd(result.marketplaceCommissionMonthly)}
              <span className="text-base font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Effective rate{' '}
              {result.marketplaceEffectiveRatePct != null
                ? `${result.marketplaceEffectiveRatePct}%`
                : '—'}{' '}
              on {formatCommissionUsd(result.marketplaceGrossMonthly)} gross
            </p>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Own channel (payment processing only)
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {formatCommissionUsd(result.ownChannelFeesMonthly)}
              <span className="text-base font-normal text-muted-foreground"> / month</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              At {inputs.ownChannelProcessingPct}% processing on the same gross volume
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-200">
              Directional monthly delta
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              {formatCommissionUsd(result.monthlySavingsVsMarketplace)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ~{formatCommissionUsd(result.annualSavingsVsMarketplace)} / year if volume stayed constant
            </p>
          </div>
        </div>
      </div>

      {!compact ? (
        <div className="overflow-x-auto rounded-2xl border border-border/80">
          <table className="w-full min-w-[640px] text-sm" aria-label="Per-channel commission breakdown">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Channel</th>
                <th className="px-4 py-3 text-right font-medium">Orders/mo</th>
                <th className="px-4 py-3 text-right font-medium">Gross</th>
                <th className="px-4 py-3 text-right font-medium">Benchmark %</th>
                <th className="px-4 py-3 text-right font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {result.channels.map((row) => (
                <tr key={row.provider} className="border-t border-border/60" data-testid={`commission-row-${row.provider}`}>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-right">{row.orders}</td>
                  <td className="px-4 py-3 text-right">{formatCommissionUsd(row.grossMonthly)}</td>
                  <td className="px-4 py-3 text-right">{row.commissionRatePct}%</td>
                  <td className="px-4 py-3 text-right">{formatCommissionUsd(row.commissionMonthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <MarketingButton href="/signup" size="sm">
          Start free trial
        </MarketingButton>
        <MarketingButton href={COMMISSION_COMPARISON_DASHBOARD_ROUTE} variant="secondary" size="sm">
          Track live commissions
        </MarketingButton>
        <MarketingButton href={OWN_YOUR_CHANNEL_UPSELL_ROUTE} variant="ghost" size="sm">
          Own your channel flow
        </MarketingButton>
        {!compact ? (
          <MarketingButton href="/pricing" variant="ghost" size="sm">
            View pricing
          </MarketingButton>
        ) : (
          <MarketingButton href="/commission-comparison" variant="ghost" size="sm">
            Full calculator
          </MarketingButton>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        step={label.includes('%') ? 1 : label.includes('value') ? 0.01 : 1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
