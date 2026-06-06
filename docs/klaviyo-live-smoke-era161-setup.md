# Klaviyo LIVE integration setup (Era 161)

Era 161 certifies Klaviyo LIVE integration wiring: API key verification, campaign triggers, and segment export — with live proof via era84 smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-klaviyo-live.ts` | Live API key → segment → campaign orchestrator |
| `services/integrations/klaviyo/campaign-triggers.service.ts` | Campaign trigger batch |
| `services/integrations/klaviyo/segment-export.service.ts` | Segment list + export |
| `services/integrations/klaviyo/klaviyo-api.ts` | API key verify + Klaviyo REST |
| `services/integrations/klaviyo/klaviyo-live-service.ts` | Connection + dashboard |
| `app/api/integrations/klaviyo/connect/route.ts` | API key connect |
| `app/api/integrations/klaviyo/export-segment/route.ts` | Segment export API |
| `app/api/integrations/klaviyo/trigger-campaign/route.ts` | Campaign trigger API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:klaviyo-live-era161` | Full era161 cert + wiring audit |
| `npm run test:ci:klaviyo-live-smoke-era161` | Era161 + era84 + integration tests |
| `npm run test:ci:klaviyo-live-smoke-era161:cert` | Wiring cert only (CI gate) |
| `npm run smoke:klaviyo-live` | Live API key proof |

## Human activation

1. Provision Klaviyo private API key (real key, not placeholder).
2. Connect in Dashboard → Integrations → Klaviyo; note a segment ID for export smoke.
3. Set `KLAVIYO_API_KEY` (+ optional `KLAVIYO_SEGMENT_ID`) in `.env.smoke.local`.
4. Run `npm run smoke:klaviyo-live` — live path PASSED.
5. Run `npm run smoke:klaviyo-live-era161` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `api_key` | `verifyKlaviyoApiKey` + connect route |
| `campaign_triggers` | `triggerKlaviyoCampaignBatch` |
| `segment_export` | `exportKlaviyoSegmentProfiles` |

## Artifact

Summary written to `artifacts/klaviyo-live-smoke-era161-smoke-summary.json` (gitignored).

See also: [klaviyo-live-smoke-setup.md](./klaviyo-live-smoke-setup.md)
