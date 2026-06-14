# Co-pilot hallucination regression (P2-71)

**Policy:** `copilot-hallucination-regression-p2-71-v1`  
**Updated:** 2026-06-16  
**Suite:** 50 Q&A scenarios — 30 operational + 20 adversarial traps

Gap closure for AI/QA task P2-71: regression gate ensuring co-pilot answers stay grounded with zero unsupported claims.

## Corpus split

| Split | Count | Behavior |
|-------|-------|----------|
| Operational | 30 | Insight-matched answers from workspace signals |
| Adversarial traps | 20 | Off-topic / certification / guarantee questions → safe fallback |

Operational scenarios verify expected keywords + insight source types via `answerCopilotQuestionFromSnapshot` (P2-69 builder).

Trap scenarios must return the scoped-workspace fallback without emitting forbidden marketing or certification language in the assistant body (user question echo excluded from pattern scan).

## Hallucination patterns

Base set from P2-69 builder plus P2-71 extensions: FDA, allergen-free, SOC2 compliant, guarantee, PCI DSS, market-dominating, etc.

Cross-check: `lib/ai/ai-no-hallucination-mode-p2-110-operations.ts` (`detectUnsupportedClaim`).

## Metrics

| Metric | Threshold | Current |
|--------|-----------|---------|
| Scenario pass rate | 100% | 100% |
| Hallucination rate | 0% | 0% |

## CI

```bash
npm run check:copilot-hallucination-regression-p2-71
```

## Artifact

`artifacts/copilot-hallucination-regression-p2-71.json`

## Related

- P2-69 accuracy benchmarks: `lib/ai/copilot-accuracy-benchmark-p2-69-*`
- P2-110 no-hallucination mode: `docs/ai-no-hallucination-mode.md`
