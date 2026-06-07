import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INVOICE_AI_ACCURACY_HONESTY_MARKERS,
  INVOICE_AI_ACCURACY_INVOICE_SCANNER_PAGE,
  INVOICE_AI_ACCURACY_INVOICE_SCANNER_STRIP_PATH,
  INVOICE_AI_ACCURACY_KB_ARTICLE_PATH,
  INVOICE_AI_ACCURACY_METRICS_COMPONENT_PATH,
  INVOICE_AI_ACCURACY_METRICS_CONTENT_PATH,
  INVOICE_AI_ACCURACY_METRICS_PAGE_PATH,
  INVOICE_AI_ACCURACY_METRICS_ROUTE,
  INVOICE_AI_ACCURACY_REQUIRED_MARKERS,
  INVOICE_AI_ACCURACY_WIRING_PATHS,
} from "@/lib/marketing/invoice-ai-accuracy-metrics-absolute-final-policy";

export type InvoiceAiAccuracyMetricsAudit = {
  ok: boolean;
  failures: string[];
};

export function auditInvoiceAiAccuracyMetricsWiring(
  root = process.cwd(),
): InvoiceAiAccuracyMetricsAudit {
  const failures: string[] = [];

  for (const rel of INVOICE_AI_ACCURACY_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, INVOICE_AI_ACCURACY_METRICS_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, INVOICE_AI_ACCURACY_METRICS_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, INVOICE_AI_ACCURACY_METRICS_PAGE_PATH), "utf8");
  const scannerPageSource = readFileSync(join(root, INVOICE_AI_ACCURACY_INVOICE_SCANNER_PAGE), "utf8");
  const stripSource = readFileSync(join(root, INVOICE_AI_ACCURACY_INVOICE_SCANNER_STRIP_PATH), "utf8");
  const kbSource = readFileSync(join(root, INVOICE_AI_ACCURACY_KB_ARTICLE_PATH), "utf8");

  for (const marker of INVOICE_AI_ACCURACY_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of INVOICE_AI_ACCURACY_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(INVOICE_AI_ACCURACY_METRICS_ROUTE)) {
    failures.push("content missing marketing route");
  }

  if (!pageSource.includes("InvoiceAiAccuracyMetrics")) {
    failures.push("page missing InvoiceAiAccuracyMetrics");
  }

  if (!scannerPageSource.includes("InvoiceAiAccuracyMetricsStrip")) {
    failures.push("invoice scanner page missing accuracy metrics strip");
  }

  if (!stripSource.includes(INVOICE_AI_ACCURACY_METRICS_ROUTE)) {
    failures.push("strip missing public metrics route");
  }

  if (!kbSource.includes(INVOICE_AI_ACCURACY_METRICS_ROUTE)) {
    failures.push("KB article missing invoice-ai-accuracy link");
  }

  return { ok: failures.length === 0, failures };
}
