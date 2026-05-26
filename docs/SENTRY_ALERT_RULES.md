# Sentry alert rules (ops signals)

KitchenOS emits structured ops signals via `services/observability/ops-signals.ts`. Configure these in **Sentry → Alerts → Create Alert → Issues**.

## 1. Cron failure (P1)

- **When:** A new issue is created
- **Filter:** `tags[ops_signal] equals cron_failure`
- **Action:** Slack `#kitchenos-ops` + email on-call
- **Frequency:** At most once every 30 minutes per issue

## 2. Webhook signature invalid (P2)

- **Filter:** `tags[ops_signal] equals webhook_signature_invalid`
- **Action:** Slack `#kitchenos-integrations`
- **Note:** Spikes often mean rotated secrets or replay attacks — correlate with `provider` tag.

## 3. Slow cron (P3, optional)

- **Filter:** message contains `cron_slow` OR `tags[ops_signal] equals cron_slow`
- **Threshold:** > 5 events in 1 hour

## 4. Environment split

Duplicate each rule for:

| Environment | Notify |
|-------------|--------|
| `production` | Pager / on-call |
| `staging` | Slack only, no page |

## 5. Verification

After deploy, trigger a safe failure in staging:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$STAGING_URL/api/cron/health-ping?fail=1"
```

Confirm the issue appears with `ops_signal:cron_failure` before enabling production pages.
