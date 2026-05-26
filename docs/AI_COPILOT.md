# AI operations copilot

## What it does

`/dashboard/copilot` aggregates deterministic operational signals (open orders, webhook backlog, margin snapshots below threshold language via costing inputs, forecast disclaimers). With `OPENAI_API_KEY`, `services/ai/copilot.ts` may attach a short narrative — otherwise bullets render verbatim.

## Setup

Add `OPENAI_API_KEY` on the server only (never commit). Leave unset for deterministic mode.

## Limitations

- Copilot avoids medical/nutrition claims and never guarantees forecasts.
- Narratives summarize aggregate bullets — do **not** paste secrets into prompts elsewhere.

## Future improvements

- Scoped tools (e.g., fetch anonymized aggregates via explicit buttons).
