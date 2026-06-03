"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CloudRain, Gift, Sparkles, TrendingUp, Truck } from "lucide-react";
import { toast } from "sonner";

import {
  runAutoOrderingBatchAction,
  updateAutoOrderingSettingsAction,
} from "@/actions/auto-ordering";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type {
  AutoOrderingDashboard,
  AutoOrderingProposal,
  AutoOrderingSignal,
} from "@/lib/inventory/auto-ordering-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: AutoOrderingDashboard;
};

const SIGNAL_ICON: Record<AutoOrderingSignal["type"], typeof CloudRain> = {
  weather: CloudRain,
  holiday: Gift,
  trend: TrendingUp,
};

const URGENCY_VARIANT: Record<AutoOrderingProposal["urgency"], "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

function ProposalRow({ proposal }: { proposal: AutoOrderingProposal }) {
  return (
    <div
      className="rounded-lg border bg-background p-3 space-y-2"
      data-testid={`auto-order-proposal-${proposal.ingredientId}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium">{proposal.ingredientName}</p>
          <p className="text-xs text-muted-foreground">{proposal.supplierName}</p>
        </div>
        <Badge variant={URGENCY_VARIANT[proposal.urgency]} className="capitalize">
          {proposal.urgency}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-3 text-sm tabular-nums">
        <span>
          Qty {proposal.baseQuantity} → <strong>{proposal.adjustedQuantity}</strong> {proposal.unit}
        </span>
        <span className="text-muted-foreground">×{proposal.combinedMultiplier.toFixed(2)}</span>
        <span className="font-medium">{formatCurrency(proposal.estimatedTotal)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {proposal.signals.map((signal) => {
          const Icon = SIGNAL_ICON[signal.type];
          return (
            <Badge key={`${proposal.ingredientId}-${signal.type}`} variant="outline" className="text-[10px] gap-1">
              <Icon className="h-3 w-3" aria-hidden />
              {signal.label} ({signal.multiplier.toFixed(2)}×)
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export function AutoOrderingPanel({ dashboard }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { settings, proposals, networkSignals, summary } = dashboard;

  function toggleSetting(key: keyof typeof settings, value: boolean) {
    startTransition(async () => {
      const result = await updateAutoOrderingSettingsAction({ [key]: value });
      if (!result.ok) {
        toast.error(result.error ?? "Could not save settings.");
        return;
      }
      toast.success(result.data?.message ?? "Saved.");
      router.refresh();
    });
  }

  function runBatch(dryRun: boolean) {
    startTransition(async () => {
      const result = await runAutoOrderingBatchAction({ dryRun });
      if (!result.ok) {
        toast.error(result.error ?? "Run failed.");
        return;
      }
      toast.success(result.data?.message ?? "Done.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="auto-ordering-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Truck className="h-7 w-7 text-primary" aria-hidden />
            Advanced inventory auto-ordering
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            AI adjusts purchase quantities using weather patterns, holiday demand windows, and 14-day
            trend forecasts — then drafts POs for critical and high-urgency lines.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/inventory/purchasing-ai">Purchasing AI →</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Proposals" value={summary.proposalCount} />
        <Kpi label="Critical" value={summary.criticalCount} />
        <Kpi label="Est. spend" value={formatCurrency(summary.estimatedSpend)} />
        <Kpi label="Avg multiplier" value={`${summary.averageMultiplier.toFixed(2)}×`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Signal controls</CardTitle>
          <CardDescription>Network-wide signals applied to each line (capped 0.85×–1.35×).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {networkSignals.map((signal) => {
              const Icon = SIGNAL_ICON[signal.type];
              return (
                <Badge key={signal.type + signal.label} variant="secondary" className="gap-1">
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {signal.label}
                </Badge>
              );
            })}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingToggle
              label="Auto-ordering enabled"
              description="Allow batch PO creation from proposals."
              checked={settings.enabled}
              disabled={pending}
              onCheckedChange={(v) => toggleSetting("enabled", v)}
              testId="auto-ordering-enabled"
            />
            <SettingToggle
              label="Weather signals"
              checked={settings.useWeatherSignals}
              disabled={pending}
              onCheckedChange={(v) => toggleSetting("useWeatherSignals", v)}
            />
            <SettingToggle
              label="Holiday signals"
              checked={settings.useHolidaySignals}
              disabled={pending}
              onCheckedChange={(v) => toggleSetting("useHolidaySignals", v)}
            />
            <SettingToggle
              label="Trend signals"
              checked={settings.useTrendSignals}
              disabled={pending}
              onCheckedChange={(v) => toggleSetting("useTrendSignals", v)}
            />
          </div>
          {settings.lastRunAt ? (
            <p className="text-xs text-muted-foreground">
              Last run {new Date(settings.lastRunAt).toLocaleString()}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-testid="auto-ordering-dry-run"
              disabled={pending}
              onClick={() => runBatch(true)}
            >
              Dry run
            </Button>
            <Button
              type="button"
              size="sm"
              data-testid="auto-ordering-run"
              disabled={pending || !settings.enabled}
              onClick={() => runBatch(false)}
            >
              <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
              Run auto-order batch
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adjusted purchase proposals</CardTitle>
          <CardDescription>
            {proposals.length === 0
              ? "No lines meet confidence and urgency thresholds — check Purchasing AI for more SKUs."
              : `${proposals.length} lines ready with signal-adjusted quantities.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add ingredients with stock and supplier offers to see proposals.</p>
          ) : (
            proposals.slice(0, 24).map((proposal) => <ProposalRow key={proposal.ingredientId} proposal={proposal} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
  testId,
}: {
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
        disabled && "opacity-60",
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} data-testid={testId} />
    </label>
  );
}
