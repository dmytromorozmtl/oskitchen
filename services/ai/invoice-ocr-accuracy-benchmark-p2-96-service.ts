import {
  runInvoiceOcrAccuracyBenchmarkP2_96,
  type InvoiceOcrAccuracyBenchmarkP2_96Result,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-operations";
import { INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID } from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";
import { buildInvoiceOcrAccuracyCorpusP2_96 } from "@/lib/qa/invoice-scanner-accuracy-corpus";

export type InvoiceOcrAccuracyBenchmarkP2_96Snapshot = InvoiceOcrAccuracyBenchmarkP2_96Result & {
  policyId: typeof INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID;
  generatedAt: string;
  mode: "golden-corpus-regression";
};

export function loadInvoiceOcrAccuracyBenchmarkP2_96(): InvoiceOcrAccuracyBenchmarkP2_96Snapshot {
  const fixtures = buildInvoiceOcrAccuracyCorpusP2_96();
  const result = runInvoiceOcrAccuracyBenchmarkP2_96(fixtures);

  return {
    ...result,
    policyId: INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression",
  };
}
