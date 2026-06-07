import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditInvoiceAiAccuracyMetricsWiring } from "@/lib/marketing/invoice-ai-accuracy-metrics-audit";
import {
  INVOICE_AI_ACCURACY_FIELD_METRICS,
  INVOICE_AI_ACCURACY_METRICS_PATH,
  INVOICE_AI_ACCURACY_PILOT_COHORT,
} from "@/lib/marketing/invoice-ai-accuracy-metrics-content";
import {
  INVOICE_AI_ACCURACY_METRICS_ABSOLUTE_FINAL_POLICY_ID,
  INVOICE_AI_ACCURACY_METRICS_CI_SCRIPTS,
  INVOICE_AI_ACCURACY_METRICS_ROUTE,
  INVOICE_AI_ACCURACY_METRICS_UNIT_TEST,
} from "@/lib/marketing/invoice-ai-accuracy-metrics-absolute-final-policy";

const ROOT = process.cwd();

describe("Invoice AI accuracy metrics (Absolute Final Task 84)", () => {
  it("locks absolute final policy and /invoice-ai-accuracy route", () => {
    expect(INVOICE_AI_ACCURACY_METRICS_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "invoice-ai-accuracy-metrics-absolute-final-v1",
    );
    expect(INVOICE_AI_ACCURACY_METRICS_ROUTE).toBe("/invoice-ai-accuracy");
    expect(INVOICE_AI_ACCURACY_METRICS_PATH).toBe("/invoice-ai-accuracy");
  });

  it("ships eight field-level pilot metrics with honest cohort size", () => {
    expect(INVOICE_AI_ACCURACY_FIELD_METRICS).toHaveLength(8);
    expect(INVOICE_AI_ACCURACY_PILOT_COHORT.totalInvoices).toBe(48);
    expect(INVOICE_AI_ACCURACY_FIELD_METRICS.every((m) => m.pilotAccuracyPct >= 70)).toBe(true);
  });

  it("passes wiring audit", () => {
    const audit = auditInvoiceAiAccuracyMetricsWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of INVOICE_AI_ACCURACY_METRICS_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(INVOICE_AI_ACCURACY_METRICS_UNIT_TEST).toBe(
      "tests/unit/invoice-ai-accuracy-metrics-absolute-final.test.ts",
    );
  });
});
