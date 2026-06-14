# AI co-pilot accuracy benchmarks (P2-69)

**Policy:** `copilot-accuracy-benchmark-p2-69-v1`  
**Updated:** 2026-06-16  
**Eval suite:** Deterministic restaurant Q&A from workspace signals — answer accuracy + hallucination rate gate.

Gap closure for AI task P2-69: restaurant operator questions mapped to scoped hub insights with zero ungrounded marketing claims.

## Corpus

25 chat scenarios (`buildCopilotAccuracyCorpusP269`) covering orders, integrations, production, packing, delivery, inventory, purchasing, catering, meal plans, tasks, margin, and retention. No live LLM in CI — pure deterministic ground truth via `buildDeterministicInsightsFromOverview`.

Deterministic chat path: `answerCopilotQuestionFromSnapshot` in `lib/ai/copilot-accuracy-benchmark-p2-69-builder.ts`, wired into `services/ai/copilot-service.ts` via `buildDeterministicChatReply`.

Upstream guardrails: [`lib/ai/copilot-guardrails.ts`](../lib/ai/copilot-guardrails.ts)  
Core engine: `lib/ai/deterministic-insights-from-overview.ts`

## Metrics

| Metric | Threshold | Current |
|--------|-----------|---------|
| Answer accuracy (keywords + source type) | ≥95% | 100% |
| Hallucination (banned marketing phrases) | 0% | 0% |

Scoring compares emitted answers against expected keywords and insight source types. Hallucination detection flags guaranteed/certified/industry-leading phrasing.

## CI

```bash
npm run check:copilot-accuracy-benchmark-p2-69
```

## Artifact

`artifacts/copilot-accuracy-benchmark-p2-69.json`

## Question categories covered

throughput_today, failed_integrations, production_overdue, packing_accuracy_low, failed_delivery_stops, inventory_shortage, inventory_shortage_upcoming, purchasing_open, catering_followup_overdue, meal_plan_cycles_missing, overdue_tasks, low_margin_item, low_repeat_rate, unknown-topic fallback
