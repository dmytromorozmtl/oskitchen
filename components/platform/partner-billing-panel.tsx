"use client";

import { useState, useTransition } from "react";
import { DollarSign, Loader2, RefreshCw } from "lucide-react";

import {
  generatePartnerBillingStatementAction,
  markPartnerBillingStatementPaidAction,
  syncPartnerBillingMetersAction,
} from "@/actions/partner-billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  PartnerBillingOverviewRow,
  PartnerBillingStatementView,
} from "@/services/platform/partner-billing-service";

type PartnerBillingPanelProps = {
  disclosure: string;
  periodMonth: string;
  rows: PartnerBillingOverviewRow[];
  totals: { activeInstallations: number; accruedCents: number; currency: string };
  statements: PartnerBillingStatementView[];
  canWrite: boolean;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function PartnerBillingPanel({
  disclosure,
  periodMonth,
  rows,
  totals,
  statements,
  canWrite,
}: PartnerBillingPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        {disclosure}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current period" value={periodMonth} />
        <MetricCard
          label="Active installs (mapped apps)"
          value={String(totals.activeInstallations)}
        />
        <MetricCard
          label="Accrued this period"
          value={formatMoney(totals.accruedCents, totals.currency)}
        />
      </div>

      {canWrite ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-zinc-700"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setMessage(null);
                const result = await syncPartnerBillingMetersAction();
                if ("error" in result && result.error) {
                  setMessage(result.error);
                  return;
                }
                setMessage(
                  `Synced active installs — scanned ${result.scanned}, recorded ${result.recorded} new meters.`,
                );
              })
            }
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Sync active install meters</span>
          </Button>
        </div>
      ) : null}

      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}

      <section className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-900/80 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2">Publisher</th>
              <th className="px-3 py-2">Active installs</th>
              <th className="px-3 py-2">Platform fee / install</th>
              <th className="px-3 py-2">Rev share</th>
              <th className="px-3 py-2">Accrued ({periodMonth})</th>
              {canWrite ? <th className="px-3 py-2">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 6 : 5} className="px-3 py-6 text-center text-zinc-500">
                  No partner billing accounts yet — meters accrue when OAuth apps install.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.publisherKey} className="border-t border-zinc-800">
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">{row.publisherName}</p>
                    <p className="font-mono text-xs text-zinc-500">{row.publisherKey}</p>
                  </td>
                  <td className="px-3 py-3 text-zinc-300">{row.activeInstallations}</td>
                  <td className="px-3 py-3 text-zinc-300">
                    {formatMoney(row.monthlyPlatformFeeCentsPerInstall, row.currency)}/mo
                  </td>
                  <td className="px-3 py-3 text-zinc-300">{(row.revenueShareBps / 100).toFixed(2)}%</td>
                  <td className="px-3 py-3 font-medium text-white">
                    {formatMoney(row.currentPeriodAccruedCents, row.currency)}
                  </td>
                  {canWrite ? (
                    <td className="px-3 py-3">
                      <form
                        action={async (formData) => {
                          formData.set("publisherKey", row.publisherKey);
                          formData.set("periodMonth", periodMonth);
                          formData.set("finalize", "true");
                          await generatePartnerBillingStatementAction(formData);
                        }}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="rounded-full border-zinc-700"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          <span className="ml-1">Finalize statement</span>
                        </Button>
                      </form>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Statements</h2>
        {statements.length === 0 ? (
          <p className="text-sm text-zinc-500">No statements generated yet.</p>
        ) : (
          statements.map((statement) => (
            <article key={statement.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-white">
                    {statement.publisherName} · {statement.periodMonth}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {formatMoney(statement.totalAccruedCents, statement.currency)}
                  </p>
                </div>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  {statement.status}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                {statement.lineItems.map((item) => (
                  <li key={`${statement.id}-${item.kind}`}>
                    {item.label}: {item.quantity} × {formatMoney(item.amountCents, statement.currency)}
                  </li>
                ))}
              </ul>
              {canWrite && statement.status === "FINALIZED" ? (
                <form
                  className="mt-3"
                  action={async (formData) => {
                    formData.set("statementId", statement.id);
                    await markPartnerBillingStatementPaidAction(formData);
                  }}
                >
                  <Button type="submit" size="sm" className="rounded-full">
                    Mark paid
                  </Button>
                </form>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
