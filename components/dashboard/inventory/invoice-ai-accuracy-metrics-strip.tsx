import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { INVOICE_AI_ACCURACY_METRICS_ROUTE } from '@/lib/marketing/invoice-ai-accuracy-metrics-absolute-final-policy';

export function InvoiceAiAccuracyMetricsStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="invoice-ai-accuracy-metrics-strip"
    >
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Public pilot accuracy metrics</p>
          <p className="text-sm text-muted-foreground">
            Field-level extraction rates from our pilot cohort — AI-assisted; verify every field before
            confirm. Not a third-party audited benchmark.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={INVOICE_AI_ACCURACY_METRICS_ROUTE}>View accuracy metrics</Link>
      </Button>
    </div>
  );
}
