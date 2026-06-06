# Mailchimp LIVE integration setup (Era 162)

Era 162 certifies Mailchimp LIVE integration wiring: OAuth, email list sync, and campaign automation — with live proof via era85 smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-mailchimp-live.ts` | Live OAuth → list → automation orchestrator |
| `services/integrations/mailchimp/list-sync.service.ts` | Email list sync |
| `services/integrations/mailchimp/campaign-automation.service.ts` | Campaign automation |
| `services/integrations/mailchimp/mailchimp-api.ts` | Mailchimp API client |
| `services/integrations/mailchimp/mailchimp-live-service.ts` | Live connection service |
| `app/api/integrations/mailchimp/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/mailchimp/sync-list/route.ts` | List sync API |
| `app/api/integrations/mailchimp/trigger-automation/route.ts` | Automation trigger API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:mailchimp-live-era162` | Full era162 cert + wiring audit |
| `npm run test:ci:mailchimp-live-smoke-era162` | Era162 + era85 + integration tests |
| `npm run test:ci:mailchimp-live-smoke-era162:cert` | Wiring cert only (CI gate) |
| `npm run smoke:mailchimp-live` | Live OAuth proof |

## Human activation

1. Provision Mailchimp OAuth app + demo audience (real token, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Mailchimp; select an audience list.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:mailchimp-live` — live path PASSED.
5. Run `npm run smoke:mailchimp-live-era162` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Mailchimp OAuth token flow |
| `email_list` | `fetchMailchimpLists` + list sync |
| `campaign_automation` | `fetchMailchimpAutomations` |

## Artifact

Summary written to `artifacts/mailchimp-live-smoke-era162-smoke-summary.json` (gitignored).

See also: [mailchimp-live-smoke-setup.md](./mailchimp-live-smoke-setup.md)
