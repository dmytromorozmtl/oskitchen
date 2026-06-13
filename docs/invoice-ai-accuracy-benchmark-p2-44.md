# Invoice AI accuracy benchmark (P2-44)

**Policy:** `invoice-ai-accuracy-benchmark-p2-44-v1`  
**Department:** AI  
**Registry:** [`artifacts/invoice-ai-accuracy-benchmark-p2-44-registry.json`](../artifacts/invoice-ai-accuracy-benchmark-p2-44-registry.json)

---

## 95% target scope

Golden-corpus benchmark over **50 invoice** fixtures — supplier, amount, line-item, and overall accuracy must each meet the **95% target**. Uses the shared invoice scanner corpus (no live OpenAI in CI).

| Step | Action |
|------|--------|
| **Load corpus 50** | `buildInvoiceAiAccuracyBenchmarkCorpusP2_44()` |
| **Score all invoices** | `runInvoiceAiAccuracyBenchmarkP2_44()` |
| **Assert benchmark threshold 95** | Fail CI when any metric drops below 95% |

> **BETA** — golden corpus validates scoring wiring and regression gates; production OCR accuracy is **not certified**. Operators should verify extracted totals before posting AP.

---

## Relationship to other gates

| Policy | Invoices | Threshold | Purpose |
|--------|----------|-----------|---------|
| P2-33 regression | 50 | 80% | Catch accuracy regressions |
| **P2-44 benchmark** | **50** | **95%** | High-bar AI accuracy target |
| P2-96 OCR benchmark | 100 | 85% | Extended corpus coverage |

---

## Commands

```bash
npm run benchmark:invoice-ai-accuracy-p2-44
npm run audit:invoice-ai-accuracy-benchmark-p2-44
npm run check:invoice-ai-accuracy-benchmark-p2-44
```

Artifact: `artifacts/invoice-ai-accuracy-benchmark-p2-44-summary.json`

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Invoice AI accuracy benchmark P2-44 audit step.
