"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Bell, ShieldCheck } from "lucide-react";

import { setB2bArCreditLimitAction } from "@/actions/shopify-b2b-ar-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  B2bArAutoReminderSummary,
  B2bArCreditLimitRow,
} from "@/lib/integrations/shopify-b2b-credit-limit-metadata";
import { formatCurrency } from "@/lib/utils";

function statusBadge(status: B2bArCreditLimitRow["status"]) {
  const map = {
    ok: { label: "OK", variant: "outline" as const },
    warning: { label: "Near limit", variant: "secondary" as const },
    blocked: { label: "Over limit", variant: "destructive" as const },
    unset: { label: "Unset", variant: "outline" as const },
  };
  const item = map[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function B2bArCreditLimitsPanel({ rows }: { rows: B2bArCreditLimitRow[] }) {
  if (rows.length === 0) return null;

  const atRisk = rows.filter((r) => r.status === "warning" || r.status === "blocked").length;

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm" data-testid="b2b-ar-credit-limits">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" aria-hidden />
          Credit limits
        </CardTitle>
        <CardDescription>
          Per-company net-terms exposure vs configured credit ceiling.{" "}
          {atRisk > 0 ? `${atRisk} company(ies) near or over limit.` : "All configured limits healthy."}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Open AR</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Set limit ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 12).map((row) => (
              <TableRow key={row.companyKey}>
                <TableCell className="text-sm">{row.companyName}</TableCell>
                <TableCell className="text-sm tabular-nums">
                  {row.limitCents != null ? formatCurrency(row.limitCents / 100) : "—"}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {formatCurrency(row.openAmountCents / 100)}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {row.utilizationPct != null ? `${row.utilizationPct}%` : "—"}
                </TableCell>
                <TableCell>{statusBadge(row.status)}</TableCell>
                <TableCell>
                  {row.companyAccountId ? (
                    <CreditLimitForm
                      companyAccountId={row.companyAccountId}
                      initialLimit={
                        row.limitCents != null ? String(row.limitCents / 100) : ""
                      }
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Link company first</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreditLimitForm({
  companyAccountId,
  initialLimit,
}: {
  companyAccountId: string;
  initialLimit: string;
}) {
  const [value, setValue] = useState(initialLimit);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const parsed = value.trim() ? Number(value) : null;
          await setB2bArCreditLimitAction(companyAccountId, parsed);
        });
      }}
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="50000"
        className="h-7 w-24 rounded-full text-xs"
        inputMode="decimal"
      />
      <Button type="submit" size="sm" variant="ghost" className="h-7 rounded-full px-2 text-xs" disabled={pending}>
        Save
      </Button>
    </form>
  );
}

export function B2bArAutoRemindersPanel({ summary }: { summary: B2bArAutoReminderSummary }) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm" data-testid="b2b-ar-auto-reminders">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4" aria-hidden />
          Auto-reminders
        </CardTitle>
        <CardDescription>
          Scheduled B2B dunning cadence and operator digest — complements manual bulk reminders above.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/70 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-1 text-sm font-medium">
            {summary.enabled && summary.autoDunningEnabled ? "Active" : "Paused"}
          </p>
          {!summary.enabled ? (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3" aria-hidden />
              Reminders disabled in Shopify settings
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border/70 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cadence (days)</p>
          <p className="mt-1 text-sm font-medium">{summary.cadenceDays.join(", ")}</p>
        </div>
        <div className="rounded-xl border border-border/70 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Auto sent</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.autoRemindersSent}</p>
          <p className="text-[10px] text-muted-foreground">{summary.digestsSent} operator digest(s)</p>
        </div>
        <div className="rounded-xl border border-border/70 p-3">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Last run</p>
          <p className="mt-1 text-xs">
            {summary.lastRunAt ? new Date(summary.lastRunAt).toLocaleString() : "Not yet run"}
          </p>
          {summary.nextEligibleAt ? (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Next eligible {new Date(summary.nextEligibleAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
