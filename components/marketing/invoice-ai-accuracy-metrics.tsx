'use client';

import { ScanLine, Sparkles } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SectionHeader } from '@/components/marketing/section-header';
import { Badge } from '@/components/ui/badge';
import {
  INVOICE_AI_ACCURACY_FIELD_METRICS,
  INVOICE_AI_ACCURACY_METRICS_CTA,
  INVOICE_AI_ACCURACY_METRICS_H1,
  INVOICE_AI_ACCURACY_METRICS_HONESTY_NOTE,
  INVOICE_AI_ACCURACY_METRICS_SUBTITLE,
  INVOICE_AI_ACCURACY_PILOT_COHORT,
  INVOICE_AI_ACCURACY_SUMMARY,
  invoiceAiAccuracyBandLabel,
  type InvoiceAiAccuracyBand,
} from '@/lib/marketing/invoice-ai-accuracy-metrics-content';

const BAND_STYLES: Record<InvoiceAiAccuracyBand, string> = {
  high: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  watch: 'border-destructive/30 bg-destructive/10 text-destructive',
};

type Props = {
  compact?: boolean;
  showHeader?: boolean;
};

export function InvoiceAiAccuracyMetrics({ compact = false, showHeader = true }: Props) {
  return (
    <section
      className={compact ? 'space-y-6' : 'border-t border-border/60 py-16 sm:py-20'}
      data-testid="invoice-ai-accuracy-metrics"
    >
      {showHeader ? (
        <SectionHeader
          tag="AI-assisted · pilot cohort"
          title={INVOICE_AI_ACCURACY_METRICS_H1}
          description={INVOICE_AI_ACCURACY_METRICS_SUBTITLE}
          centered={!compact}
          className={compact ? undefined : 'mx-auto'}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pilot cohort
          </p>
          <p className="mt-1 text-2xl font-semibold">{INVOICE_AI_ACCURACY_PILOT_COHORT.totalInvoices}</p>
          <p className="text-sm text-muted-foreground">invoices ({INVOICE_AI_ACCURACY_PILOT_COHORT.periodLabel})</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Mean confidence
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {INVOICE_AI_ACCURACY_SUMMARY.meanOverallConfidencePct}%
          </p>
          <p className="text-sm text-muted-foreground">overall extraction score</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Operator edits
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {INVOICE_AI_ACCURACY_SUMMARY.operatorCorrectionRatePct}%
          </p>
          <p className="text-sm text-muted-foreground">fields corrected before confirm</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/80">
        <table className="w-full min-w-[640px] text-sm" aria-label="Invoice AI field accuracy metrics">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Field</th>
              <th className="px-4 py-3 text-left font-medium">Pilot accuracy</th>
              <th className="px-4 py-3 text-left font-medium">Band</th>
              {!compact ? (
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {INVOICE_AI_ACCURACY_FIELD_METRICS.map((metric) => (
              <tr
                key={metric.id}
                className="border-t border-border/60"
                data-testid={`invoice-ai-accuracy-field-${metric.id}`}
              >
                <td className="px-4 py-3 font-medium">{metric.label}</td>
                <td className="px-4 py-3">{metric.pilotAccuracyPct}%</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${BAND_STYLES[metric.band]}`}
                  >
                    {invoiceAiAccuracyBandLabel(metric.band)}
                  </span>
                </td>
                {!compact ? (
                  <td className="px-4 py-3 text-muted-foreground">{metric.description}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">BETA</Badge>
        <span>
          Confidence bands: green ≥{INVOICE_AI_ACCURACY_SUMMARY.highConfidenceThresholdPct}%, yellow{' '}
          {INVOICE_AI_ACCURACY_SUMMARY.mediumConfidenceThresholdPct}–89%, red below{' '}
          {INVOICE_AI_ACCURACY_SUMMARY.mediumConfidenceThresholdPct}%. Operators must verify before
          confirm.
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden />
        {INVOICE_AI_ACCURACY_METRICS_HONESTY_NOTE} {INVOICE_AI_ACCURACY_PILOT_COHORT.methodology}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <MarketingButton href={INVOICE_AI_ACCURACY_METRICS_CTA.primaryHref}>
          {INVOICE_AI_ACCURACY_METRICS_CTA.primaryLabel}
        </MarketingButton>
        <MarketingButton href={INVOICE_AI_ACCURACY_METRICS_CTA.dashboardHref} variant="secondary">
          <ScanLine className="h-4 w-4" aria-hidden />
          {INVOICE_AI_ACCURACY_METRICS_CTA.dashboardLabel}
        </MarketingButton>
        {!compact ? (
          <MarketingButton href={INVOICE_AI_ACCURACY_METRICS_CTA.kbHref} variant="ghost">
            Setup guide
          </MarketingButton>
        ) : null}
      </div>
    </section>
  );
}
