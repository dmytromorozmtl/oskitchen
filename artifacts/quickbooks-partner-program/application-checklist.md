# Intuit App Partner — application checklist

**Policy:** quickbooks-certified-partner-p3-84-v1  
**Status:** APPLICATION_PREP_NOT_CERTIFIED  
**Target submit:** 2026-07-15

## Pre-application

- [ ] Intuit Developer account created at developer.intuit.com
- [ ] Sandbox QuickBooks Online company provisioned (real realm ID)
- [ ] OAuth app registered with production redirect URI
- [ ] Accounting scope enabled: `com.intuit.quickbooks.accounting`
- [ ] Privacy policy URL live: /legal/privacy
- [ ] Terms of service URL live: /legal/terms
- [ ] Support mailbox documented with SLA

## Technical gates

- [ ] OAuth callback wired: `/api/integrations/quickbooks/oauth/callback`
- [ ] Chart of accounts API: `/api/integrations/quickbooks/accounts`
- [ ] Daily journal sync: `/api/integrations/quickbooks/sync-journal`
- [ ] Export path: `/api/export/quickbooks`
- [ ] `npm run smoke:quickbooks-live` PASS (or wiring cert with honest SKIPPED note)
- [ ] Unit tests: `quickbooks-live-oauth.test.ts`, `quickbooks-daily-sales-journal.test.ts`
- [ ] Token refresh + disconnect flow documented

## Security + compliance

- [ ] Intuit security questionnaire completed
- [ ] Data handling disclosure (what QBO data is stored, retention, encryption)
- [ ] No PAN/CVV storage — accounting data only
- [ ] Cross-tenant isolation verified (workspace-scoped connections)

## Listing assets

- [ ] App logo 512×512 PNG
- [ ] 4 screenshots per asset checklist
- [ ] Listing copy finalized — 0 forbidden claims hits
- [ ] No "QuickBooks certified partner" claim until approved

## Submit

- [ ] Request production OAuth keys after sandbox QA sign-off
- [ ] Intuit Partner Portal → submit App Partner application
- [ ] Record submission date in artifact
- [ ] Do **not** claim certification until Intuit approval email received
