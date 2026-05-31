# Uber Eats integration

OS Kitchen includes an **adapter skeleton** for Uber Eats Marketplace. Without Uber partner-approved credentials and official API hosts, live behavior is limited by design.

## What ships today

- Encrypted storage for client ID/secret, webhook signing secret, and store identifier fields.
- Webhook endpoint (with `cid` query) that records **`WebhookEvent`** rows and runs **stub** payload normalization into `external_orders`.
- UI messaging that explains partner approval requirements.

## What you need from Uber

- Developer program access and OAuth/client credentials for your organization.
- Store UUID / merchant context for menu + order APIs.
- Documented webhook signing algorithm for your integration tier.

## Next implementation steps

1. Replace `normalizeUberEatsOrder` with the official order JSON contract.
2. Verify signatures on ingress (do not process unsigned traffic in production).
3. Implement menu sync using Uber’s menu endpoints behind feature flags.
4. Map Uber fulfillment states to `NormalizedOrderStatus`.

## Endpoint

```text
POST /api/webhooks/uber-eats/orders?cid=<connection-id>
```

Treat this URL as **staging-only** until Uber validates your integration.
