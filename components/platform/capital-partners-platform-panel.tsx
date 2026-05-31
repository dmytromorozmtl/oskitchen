"use client";

import { useState, useTransition } from "react";
import { Building2, CheckCircle2, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import {
  finalizeCapitalPartnerBillingStatementAction,
  syncCapitalPartnerBillingStatementsAction,
} from "@/actions/capital-partner-billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CapitalPartnerBillingOverview,
  CapitalPartnerBillingStatementView,
} from "@/services/commercial/capital-partner-billing-service";

type CapitalPartnersPlatformPanelProps = {
  overview: CapitalPartnerBillingOverview;
  statements: CapitalPartnerBillingStatementView[];
  canWrite: boolean;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function lifecycleBadge(status: string) {
  switch (status) {
    case "live":
      return <Badge className="bg-emerald-600/90">Live</Badge>;
    case "paused":
      return <Badge variant="outline">Paused</Badge>;
    default:
      return <Badge variant="secondary">Sandbox</Badge>;
  }
}

export function CapitalPartnersPlatformPanel({
  overview,
  statements,
  canWrite,
}: CapitalPartnersPlatformPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        {overview.disclosure}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current period" value={overview.periodMonth} />
        <MetricCard label="Live lender partners" value={String(overview.totals.livePartnerCount)} />
        <MetricCard
          label="Referral fees accrued"
          value={formatMoney(overview.totals.accruedCents, overview.totals.currency)}
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
                const result = await syncCapitalPartnerBillingStatementsAction();
                if ("error" in result && result.error) {
                  setMessage(result.error);
                  return;
                }
                setMessage(`Synced ${result.upserted} draft statement(s).`);
              })
            }
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Sync statements</span>
          </Button>
        </div>
      ) : null}

      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-zinc-900/80 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2">Partner</th>
              <th className="px-3 py-2">Lifecycle</th>
              <th className="px-3 py-2">Regions</th>
              <th className="px-3 py-2">Referral fee</th>
              <th className="px-3 py-2">Integration</th>
              <th className="px-3 py-2">Funded (period)</th>
              <th className="px-3 py-2">Accrued</th>
            </tr>
          </thead>
          <tbody>
            {overview.rows.map((row) => (
              <tr key={row.slug} className="border-t border-zinc-800">
                <td className="px-3 py-3">
                  <p className="font-medium text-zinc-100">{row.name}</p>
                  <p className="text-xs text-zinc-500">{row.slug}</p>
                  {row.partnerAgreementEffectiveDate ? (
                    <p className="mt-1 text-xs text-zinc-500">
                      Agreement: {row.partnerAgreementEffectiveDate}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-3">{lifecycleBadge(row.lifecycleStatus)}</td>
                <td className="px-3 py-3 text-zinc-400">{row.regions.join(", ")}</td>
                <td className="px-3 py-3 text-zinc-300">
                  {row.referralFee && row.referralFeeBps != null
                    ? `${(row.referralFeeBps / 100).toFixed(2)}%`
                    : "None"}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className={row.webhookConfigured ? "text-emerald-400" : "text-amber-400"}>
                      {row.webhookConfigured ? "Webhook configured" : "Webhook missing"}
                    </span>
                    <span className={row.applyUrlConfigured ? "text-emerald-400" : "text-amber-400"}>
                      {row.applyUrlConfigured ? "Apply URL configured" : "Apply URL missing"}
                    </span>
                    {row.stateDisclosureUrl ? (
                      <a
                        href={row.stateDisclosureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-200/90 hover:underline"
                      >
                        State disclosures
                      </a>
                    ) : (
                      <span className="text-zinc-500">No state disclosure URL</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-zinc-300">{row.fundedReferralsThisPeriod}</td>
                <td className="px-3 py-3 text-zinc-100">
                  {formatMoney(row.currentPeriodAccruedCents, row.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {statements.length > 0 ? (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Building2 className="h-5 w-5" />
            Referral fee statements
          </h2>
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 px-4 py-3"
            >
              <div>
                <p className="font-medium text-zinc-100">
                  {statement.partnerName} · {statement.periodMonth}
                </p>
                <p className="text-sm text-zinc-400">
                  {formatMoney(statement.totalAccruedCents, statement.currency)} · {statement.status}
                </p>
              </div>
              {canWrite && statement.status === "DRAFT" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full border-zinc-700"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await finalizeCapitalPartnerBillingStatementAction({
                        statementId: statement.id,
                      });
                      if ("error" in result && result.error) {
                        setMessage(result.error);
                      }
                    })
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="ml-2">Finalize</span>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <ShieldAlert className="h-4 w-4" />
          No referral fee statements yet — sync after funded webhooks arrive.
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
