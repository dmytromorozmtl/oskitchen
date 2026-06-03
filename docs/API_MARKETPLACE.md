# API Marketplace

In-dashboard developer marketplace for OAuth apps: submission, platform review, publish, and **70/30 revenue share**.

## Route

`/dashboard/developers`

## Flow

1. **Submit** — developer fills OAuth app manifest → `IN_REVIEW` in `partner_oauth_app_registry`
2. **Review** — platform staff (or superadmin) approves/rejects from review queue on same page
3. **Publish** — `PUBLISHED` or `SANDBOX` status → installable from `/dashboard/integrations/oauth-apps`

## Revenue share

- **Developer: 70%** of net app revenue
- **Platform: 30%** OS Kitchen marketplace fee

Documented in UI; billing meters use `PartnerBillingAccount` for production settlement.

## Services

```
services/platform/app-marketplace-service.ts
services/platform/partner-app-review-service.ts
lib/platform/app-marketplace-builders.ts
```

## Related

- Public developer portal: `/developers`
- Platform queue: `/platform/partner-apps`
- OAuth installs: `/dashboard/integrations/oauth-apps`
