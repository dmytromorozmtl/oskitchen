# AI briefing accuracy benchmarks (P2-61)

**Policy:** `ai-briefing-accuracy-benchmark-p2-61-v1`  
**Updated:** 2026-06-16  
**Toast IQ parity:** Deterministic hub-signal briefing — comparable daily ops summary category to Toast IQ, without claiming certified parity.

Gap closure for AI task P2-61: real metrics from hub ground truth → insight recall, route accuracy, hallucination rate.

## Corpus

25 hub-snapshot scenarios (`buildAiBriefingAccuracyCorpusP261`) with expected insight types derived from executive overview aggregates. No live LLM in CI — pure deterministic ground truth via `buildDeterministicInsightsFromOverview`.

Upstream narrative policy: [`docs/ai-briefing-narrative.md`](./ai-briefing-narrative.md)  
Core engine: `lib/ai/deterministic-insights-from-overview.ts`

## Metrics

| Metric | Threshold | Current |
|--------|-----------|---------|
| Insight recall | ≥95% | 100% |
| Action route accuracy | ≥95% | 100% |
| Hallucination (unexpected insight types) | 0% | 0% |

Scoring compares emitted insight types and `actionRoute` values against the corpus ground truth.

## CI

```bash
npm run check:ai-briefing-accuracy-benchmark-p2-61
```

## Artifact

`artifacts/ai-briefing-accuracy-benchmark-p2-61.json`

## Insight types covered

throughput_today, failed_integrations, production_overdue, packing_accuracy_low, failed_delivery_stops, inventory_shortage, inventory_shortage_upcoming, purchasing_open, catering_followup_overdue, meal_plan_cycles_missing, overdue_tasks, low_margin_item, low_repeat_rate
