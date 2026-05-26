# Growth — AI Insights

## Current

- **Outreach assistant** (`generateOutreachMessage`) can use OpenAI when configured; templates otherwise.
- No automated posting or emailing.

## Planned (safe patterns)

- Lead summarization (structured fields only).
- Churn explanation cards referencing heuristic reasons (no raw PII dumps).
- Campaign post-mortems on `OutreachCampaign.metricsJson`.

## Rules

Never send API keys, webhook secrets, or customer card data to models. Redact emails/phones when exporting to external LLMs if not owner-approved.
