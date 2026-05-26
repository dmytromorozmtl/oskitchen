# Data Processing Agreement (template) — B2B pilots

> Send to counsel before first signed pilot. Not legal advice.

## 1. Roles

- **Customer:** Data Controller (operator)
- **KitchenOS:** Data Processor

## 2. Subprocessors

| Vendor | Purpose | Region |
|--------|---------|--------|
| Supabase | PostgreSQL, auth | US/EU per project |
| Vercel | Hosting, edge | Global |
| Stripe | Payments, Connect | US |
| OpenAI | OCR, copilot (optional) | US |
| Upstash | Redis cache/rate limits | Configurable |

## 3. Data retention

Operator production data: **90 days** after subscription cancellation unless legal hold.

## 4. Security measures

- TLS in transit, encryption at rest (Supabase)
- Workspace-scoped queries (`workspaceId` migration program)
- Audit logs for sensitive actions

## 5. Breach notification

Processor notifies Controller within **72 hours** of confirmed breach affecting Customer data.

## 6. Data subject requests

Controller may request export/delete via `/legal/data-rights` flows; Processor assists within 30 days.
