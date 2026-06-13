import {
  AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT,
  AI_ACCURACY_BENCHMARK_INVOICE_COUNT,
  AI_ACCURACY_BENCHMARK_INVOICE_FIXTURE_DIR,
  AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT,
  AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT,
} from "@/lib/qa/ai-accuracy-benchmark-policy";
import { buildCopilotAccuracyCorpus } from "@/lib/qa/copilot-accuracy-corpus";
import { runCopilotAccuracyBenchmark } from "@/lib/qa/copilot-accuracy-scoring";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { runInvoiceScannerAccuracyBenchmark } from "@/lib/qa/invoice-scanner-accuracy-scoring";

export type AiAccuracyBenchmarkInvoiceSlice = {
  invoiceCount: number;
  pdfFixtureDir: string;
  supplierAccuracyPct: number;
  amountAccuracyPct: number;
  lineItemAccuracyPct: number;
  overallAccuracyPct: number;
  passed: boolean;
  thresholdPct: number;
};

export type AiAccuracyBenchmarkResult = {
  invoice: AiAccuracyBenchmarkInvoiceSlice;
  copilot: ReturnType<typeof runCopilotAccuracyBenchmark>;
  passed: boolean;
};

export function buildAiAccuracyBenchmarkInvoiceCorpus() {
  return buildInvoiceScannerAccuracyCorpus()
    .slice(0, AI_ACCURACY_BENCHMARK_INVOICE_COUNT)
    .map((fixture, index) => ({
      ...fixture,
      pdfRef: `${AI_ACCURACY_BENCHMARK_INVOICE_FIXTURE_DIR}/invoice-${String(index + 1).padStart(3, "0")}.pdf`,
    }));
}

export function runAiAccuracyBenchmark(): AiAccuracyBenchmarkResult {
  const invoiceFixtures = buildAiAccuracyBenchmarkInvoiceCorpus();
  const invoiceRaw = runInvoiceScannerAccuracyBenchmark(invoiceFixtures);

  const invoice: AiAccuracyBenchmarkInvoiceSlice = {
    invoiceCount: invoiceFixtures.length,
    pdfFixtureDir: AI_ACCURACY_BENCHMARK_INVOICE_FIXTURE_DIR,
    supplierAccuracyPct: invoiceRaw.supplierAccuracyPct,
    amountAccuracyPct: invoiceRaw.amountAccuracyPct,
    lineItemAccuracyPct: invoiceRaw.lineItemAccuracyPct,
    overallAccuracyPct: invoiceRaw.overallAccuracyPct,
    passed:
      invoiceFixtures.length >= AI_ACCURACY_BENCHMARK_INVOICE_COUNT &&
      invoiceRaw.supplierAccuracyPct >= AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT &&
      invoiceRaw.amountAccuracyPct >= AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT &&
      invoiceRaw.lineItemAccuracyPct >= AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT &&
      invoiceRaw.overallAccuracyPct >= AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT,
    thresholdPct: AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT,
  };

  const copilotFixtures = buildCopilotAccuracyCorpus();
  const copilot = runCopilotAccuracyBenchmark(copilotFixtures);

  const passed =
    invoice.passed &&
    copilot.passed &&
    copilot.questionCount >= AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT &&
    copilot.accuracyPct >= AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT;

  return { invoice, copilot, passed };
}
