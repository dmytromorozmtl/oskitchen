import {
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_EYEBROW =
  "Invoice OCR accuracy · 100-invoice benchmark" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_HEADLINE =
  "Supplier, line item, price variance, and confidence accuracy" as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_SUBLINE =
  "Four OCR metrics on 100 realistic invoice fixtures — golden corpus regression without live OpenAI in CI. BETA: verify production OCR variance — not certified third-party audit." as const;

export const INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRICS = [
  {
    id: "supplier-accuracy",
    label: "Accuracy by supplier",
    description: "Per-supplier match rate grouped across 8 distributor fixtures.",
    module: "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-operations.ts",
  },
  {
    id: "line-item-accuracy",
    label: "Line item %",
    description: "Line count + description match rate per invoice (≥85% descriptions).",
    module: "lib/qa/invoice-scanner-accuracy-scoring.ts",
  },
  {
    id: "price-variance",
    label: "Price variance %",
    description: "Unit price variance vs ground truth — lower variance = higher score.",
    module: "lib/ai/invoice-ocr-accuracy-benchmark-p2-96-operations.ts",
  },
  {
    id: "confidence",
    label: "Confidence",
    description: "Mean OCR confidence from fixture mapper — line + document weighted.",
    module: "lib/qa/invoice-scanner-ocr-mapper.ts",
  },
] as const;

export { INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_METRIC_COUNT };
