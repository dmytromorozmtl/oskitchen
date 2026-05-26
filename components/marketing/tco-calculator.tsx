'use client';

import * as React from 'react';
import Link from 'next/link';

import { MarketingButton } from '@/components/marketing/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trackGtagEvent } from '@/lib/analytics/gtag-events';
import {
  KITCHENOS_PLAN_OPTIONS,
  TCO_HORIZON_YEARS,
  TCO_KITCHENOS_DEFAULTS,
  TCO_TRADITIONAL_DEFAULTS,
} from '@/lib/marketing/tco-defaults';

function formatUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function TcoCalculator() {
  const [terminals, setTerminals] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.terminalCount);
  const [terminalUpfront, setTerminalUpfront] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.terminalUpfrontEach);
  const [terminalLease, setTerminalLease] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.terminalLeaseMonthlyEach);
  const [legacySoftware, setLegacySoftware] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.softwareMonthly);
  const [install, setInstall] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.installAndTraining);
  const [annualSupport, setAnnualSupport] = React.useState<number>(TCO_TRADITIONAL_DEFAULTS.annualSupport);

  const [planKey, setPlanKey] = React.useState(TCO_KITCHENOS_DEFAULTS.planKey);
  const [tabletUpfront, setTabletUpfront] = React.useState<number>(TCO_KITCHENOS_DEFAULTS.tabletUpfrontEach);
  const [tabletCount, setTabletCount] = React.useState<number>(TCO_KITCHENOS_DEFAULTS.tabletCount);

  const plan = KITCHENOS_PLAN_OPTIONS.find((p) => p.key === planKey) ?? KITCHENOS_PLAN_OPTIONS[1]!;

  const months = TCO_HORIZON_YEARS * 12;

  const traditionalTotal =
    install +
    terminals * terminalUpfront +
    (legacySoftware + terminals * terminalLease) * months +
    annualSupport * TCO_HORIZON_YEARS;

  const kitchenosTotal =
    tabletCount * tabletUpfront + plan.monthly * months;

  const delta = traditionalTotal - kitchenosTotal;

  function trackChange() {
    trackGtagEvent('tco_calculator_update', { plan: planKey, horizon_years: TCO_HORIZON_YEARS });
  }

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Model five-year total cost of ownership for software and hardware — not payment processing
        rates. Adjust assumptions to match your quote from Toast, Square, or another terminal bundle.
        This is a planning tool, not financial advice.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Traditional hardware POS (typical)
          </h3>
          <div className="mt-4 grid gap-4">
            <Field label="Terminal count" value={terminals} onChange={setTerminals} onBlur={trackChange} />
            <Field
              label="Upfront cost per terminal ($)"
              value={terminalUpfront}
              onChange={setTerminalUpfront}
              onBlur={trackChange}
            />
            <Field
              label="Monthly lease per terminal ($)"
              value={terminalLease}
              onChange={setTerminalLease}
              onBlur={trackChange}
            />
            <Field
              label="Software subscription ($/mo)"
              value={legacySoftware}
              onChange={setLegacySoftware}
              onBlur={trackChange}
            />
            <Field label="Install & training ($)" value={install} onChange={setInstall} onBlur={trackChange} />
            <Field
              label="Annual support ($/yr)"
              value={annualSupport}
              onChange={setAnnualSupport}
              onBlur={trackChange}
            />
          </div>
          <p className="mt-6 text-2xl font-bold tracking-tight">{formatUsd(traditionalTotal)}</p>
          <p className="text-xs text-muted-foreground">{TCO_HORIZON_YEARS}-year estimated TCO</p>
        </div>

        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">KitchenOS (cloud)</h3>
          <div className="mt-4 grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Plan</Label>
              <Select
                value={planKey}
                onValueChange={(v) => {
                  setPlanKey(v as typeof planKey);
                  trackChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KITCHENOS_PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label} — ${p.monthly}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field
              label="Tablets to buy (if any) — count"
              value={tabletCount}
              onChange={setTabletCount}
              onBlur={trackChange}
            />
            <Field
              label="Upfront per tablet ($) — 0 if you own devices"
              value={tabletUpfront}
              onChange={setTabletUpfront}
              onBlur={trackChange}
            />
          </div>
          <p className="mt-6 text-2xl font-bold tracking-tight text-primary">{formatUsd(kitchenosTotal)}</p>
          <p className="text-xs text-muted-foreground">
            {TCO_HORIZON_YEARS}-year TCO · 14-day trial on software
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card px-6 py-5 text-center sm:text-left">
        <p className="text-sm font-medium text-foreground">Estimated difference over {TCO_HORIZON_YEARS} years</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">
          {delta >= 0 ? formatUsd(delta) : formatUsd(Math.abs(delta))}{' '}
          <span className="text-base font-normal text-muted-foreground">
            {delta >= 0 ? 'lower with KitchenOS (modeled)' : 'higher with KitchenOS (modeled)'}
          </span>
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Processing fees, chargebacks, and multi-location enterprise contracts are excluded. See{' '}
          <Link href="/compare/restaurant-pos" className="font-medium text-primary hover:underline">
            restaurant POS comparison
          </Link>{' '}
          for feature fit — not just cost.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
          <MarketingButton href="/signup?utm_source=pricing&utm_medium=tco_calculator" size="lg">
            Start free trial
          </MarketingButton>
          <MarketingButton href="/contact-sales" variant="secondary" size="lg">
            Talk to sales
          </MarketingButton>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        onBlur={onBlur}
      />
    </div>
  );
}
