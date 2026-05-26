# Internal alerts

Internal alerts are non-customer notifications routed to the operator
team (owners, managers, kitchen leads, drivers, catering sales).

## Helper

```ts
import { fireInternalAlert } from "@/services/notifications/alert-service";

await fireInternalAlert({
  userId,
  templateKey: "internal_failed_webhook",
  triggerType: "WEBHOOK_FAILED",
  sourceType: "channel_import",
  sourceId: importBatch.id,
  reason: "Shopify webhook returned 502 after 3 retries.",
  link: `${SITE_URL}/dashboard/channels/${importBatch.id}`,
  recipientEmail: owner.email,
});
```

The helper:

- Builds a deterministic dedupe key from
  `(templateKey, recipient, sourceType, sourceId)` so the same failure
  produces at most one row per occurrence.
- Records a `NotificationLog` with `category = INTERNAL_ALERT`.
- Honors the provider gate — in log-only mode the row is `SKIPPED`.
- Does not raise.

## Catalog

The Internal Alerts tab renders a static catalog of 11 templates with
severity (info / warning / critical), audience hint, and the module
that emits them. Severity is informational — it does not change
routing today.

## Recent activity

The tab also lists the last 20 alerts for the workspace by joining on
`category = "INTERNAL_ALERT"`.

## Limits

The current iteration sends one alert per occurrence — no escalation
chain, no SLA timer, no SMS fallback. Those are explicit roadmap
items.
