/**
 * Absolute Final Task 84 — public invoice AI accuracy metrics.
 *
 * @see app/invoice-ai-accuracy/page.tsx
 * @see docs/INVOICE_SCANNER.md
 */

export const INVOICE_AI_ACCURACY_METRICS_ABSOLUTE_FINAL_POLICY_ID =
  "invoice-ai-accuracy-metrics-absolute-final-v1" as const;

export const INVOICE_AI_ACCURACY_METRICS_ROUTE = "/invoice-ai-accuracy" as const;

export const INVOICE_AI_ACCURACY_METRICS_PAGE_PATH = "app/invoice-ai-accuracy/page.tsx" as const;

export const INVOICE_AI_ACCURACY_METRICS_COMPONENT_PATH =
  "components/marketing/invoice-ai-accuracy-metrics.tsx" as const;

export const INVOICE_AI_ACCURACY_METRICS_CONTENT_PATH =
  "lib/marketing/invoice-ai-accuracy-metrics-content.ts" as const;

export const INVOICE_AI_ACCURACY_INVOICE_SCANNER_PAGE =
  "app/dashboard/inventory/invoice-scanner/page.tsx" as const;

export const INVOICE_AI_ACCURACY_INVOICE_SCANNER_STRIP_PATH =
  "components/dashboard/inventory/invoice-ai-accuracy-metrics-strip.tsx" as const;

export const INVOICE_AI_ACCURACY_KB_ARTICLE_PATH = "lib/kb/knowledge-base-content.ts" as const;

export const INVOICE_AI_ACCURACY_REQUIRED_MARKERS = [
  'data-testid="invoice-ai-accuracy-metrics"',
  "InvoiceAiAccuracyMetrics",
] as const;

export const INVOICE_AI_ACCURACY_HONESTY_MARKERS = [
  "AI-assisted",
  "pilot cohort",
  "verify before confirm",
  "not a third-party audited",
  "BETA",
  "Illustrative",
] as const;

export const INVOICE_AI_ACCURACY_WIRING_PATHS = [
  INVOICE_AI_ACCURACY_METRICS_PAGE_PATH,
  INVOICE_AI_ACCURACY_METRICS_COMPONENT_PATH,
  INVOICE_AI_ACCURACY_METRICS_CONTENT_PATH,
  INVOICE_AI_ACCURACY_INVOICE_SCANNER_PAGE,
  INVOICE_AI_ACCURACY_INVOICE_SCANNER_STRIP_PATH,
  "lib/marketing/invoice-ai-accuracy-metrics-absolute-final-policy.ts",
  "lib/marketing/invoice-ai-accuracy-metrics-audit.ts",
  "tests/unit/invoice-ai-accuracy-metrics-absolute-final.test.ts",
] as const;

export const INVOICE_AI_ACCURACY_METRICS_UNIT_TEST =
  "tests/unit/invoice-ai-accuracy-metrics-absolute-final.test.ts" as const;

export const INVOICE_AI_ACCURACY_METRICS_CI_SCRIPTS = [
  "test:ci:invoice-ai-accuracy-metrics",
  "test:ci:invoice-ai-accuracy-metrics:cert",
] as const;

export const INVOICE_AI_ACCURACY_UPSTREAM_POLICIES = [
  "invoice-scanner-service-v1",
] as const;
