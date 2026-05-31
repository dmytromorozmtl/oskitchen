# OS Kitchen Copilot Roadmap

## Current State

Existing surface:

- `app/dashboard/copilot/page.tsx`
- `services/ai/*`

Current posture:

- provider-aware AI foundation exists
- deterministic/product-safe insight patterns exist
- this is not yet equivalent to Restaurant365-style AI scheduling or deep forecasting

## Guardrails

1. No raw customer PII in prompts by default.
2. Operator-facing suggestions must be explainable.
3. Every AI insight needs a deterministic fallback or explicit "AI unavailable" state.
4. Forecasting/scheduling outputs should remain reviewable, not auto-applied silently.

## Q3 2026

- sales forecast explanation
- food cost anomaly explanation
- production forecast assistant
- staff scheduling recommendation draft

## Q4 2026

- role-aware copilot widgets on `/dashboard/today`
- saved analyst/operator prompt templates
- explainability links back to source metrics

## Not Yet Claimed

- one-click AI schedule publishing
- autonomous labor optimization
- full revenue forecasting engine
