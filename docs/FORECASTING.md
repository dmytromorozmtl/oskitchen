# Production forecasting

## What it does

`services/forecasting/production-forecast.ts` builds a **deterministic** outlook from recent in-app orders plus the active menu: projected quantities, buffers, confidence tiers, and explicit disclaimers. `/dashboard/forecast` renders the table.

## Setup

No env vars required. Optionally pair with **AI Copilot** (`OPENAI_API_KEY`) for narrative summaries that never replace the numeric forecast.

## Limitations

- Thin historical volume yields **low confidence** by design.
- External channels without mirrored OS Kitchen history trend low until synced.

## Future improvements

- Preorder velocity curve per SKU.
- Prep station capacity modeling.
- Saved forecast snapshots for week-over-week deltas.
