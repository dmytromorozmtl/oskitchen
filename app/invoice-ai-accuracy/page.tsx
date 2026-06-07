import type { Metadata } from 'next';

import { InvoiceAiAccuracyMetrics } from '@/components/marketing/invoice-ai-accuracy-metrics';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import {
  INVOICE_AI_ACCURACY_METRICS_META,
  INVOICE_AI_ACCURACY_METRICS_PATH,
} from '@/lib/marketing/invoice-ai-accuracy-metrics-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: INVOICE_AI_ACCURACY_METRICS_META.title,
  description: INVOICE_AI_ACCURACY_METRICS_META.description,
  path: INVOICE_AI_ACCURACY_METRICS_PATH,
  keywords: [
    'invoice OCR accuracy restaurant',
    'AI invoice scanner metrics',
    'supplier invoice extraction accuracy',
    'inventory invoice AI confidence',
  ],
});

export default function InvoiceAiAccuracyMetricsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <InvoiceAiAccuracyMetrics showHeader />
      </main>
      <SiteFooter />
    </div>
  );
}
