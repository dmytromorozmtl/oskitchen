# Integration Marketplace Roadmap

Status: canonical maturity and certification roadmap for KitchenOS integrations
Primary evidence: `actions/integrations.ts`, `app/api/webhooks/`, `app/api/public/`, `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`, `docs/PRODUCTION_READINESS_NEXT_PRIORITY_AUDIT.md`

## Marketplace Rules
- No fake live integrations.
- Preview integrations must be marked as preview, beta, setup-ready, partner-access-required, or placeholder.
- Production integrations require tests and runbooks.
- Each integration card should show status, setup path, last sync, last error, retry guidance, and documentation.

## Required Integration Metadata
Every integration record should have:
- maturity status
- setup guide
- auth model
- env vars
- test mode
- production mode
- sync jobs
- webhook logs
- error recovery
- retries
- rate limits
- monitoring
- runbook
- certification checklist

## Integration Matrix
| Integration | Category | Current maturity | Auth model | Test mode | Production mode | Key gaps | Monitoring / runbook expectation | Certification target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stripe | payments | `pilot_ready` | secret key + webhook signature | yes | yes | broader failure recovery and reporting | payment webhook logs, billing runbook | verified billing + checkout lifecycle |
| Stripe Terminal | payments / hardware | `placeholder` | secret + terminal token | limited | no | no certified hardware path | internal-only diagnostics | do not claim before certification |
| Shopify | e-commerce | `pilot_ready` | admin token + webhook secret | yes | yes | broader sync certification and runbooks | sync health, webhook logs, provider smoke | live only with smoke evidence |
| WooCommerce | e-commerce | `pilot_ready` | consumer key/secret + webhook secret | yes | yes | same as Shopify | sync health, webhook logs, provider smoke | live only with smoke evidence |
| DoorDash Drive | delivery | `preview` | partner/provider credentials | limited | limited | partner approval and error recovery | delivery runbook and retry logs | partner-certified rollout only |
| Uber Direct | delivery | `preview` | partner/provider credentials | limited | limited | same as above | delivery runbook and retry logs | partner-certified rollout only |
| Uber Eats | marketplaces | `placeholder` | partner/provider credentials | limited | no broad claim | marketplace proof and operational logs | partner-gated runbook | partner-certified only |
| Grubhub | marketplaces | `placeholder` | provider credentials | limited | no broad claim | same as above | partner-gated runbook | partner-certified only |
| QuickBooks | accounting | `preview` | export/integration credentials | yes | limited | stronger export/reconciliation maturity | export audit + finance runbook | finance export certification |
| Xero | accounting | `preview` | export/integration credentials | yes | limited | same as QuickBooks | export audit + finance runbook | finance export certification |
| 7shifts | scheduling | `preview` | provider credentials | limited | limited | sync maturity and scope | sync health + runbook | pilot certification only |
| Homebase | scheduling | `preview` | provider credentials | limited | limited | same as above | sync health + runbook | pilot certification only |
| Mailchimp | email/SMS | `preview` | API key + audience config | yes | limited | campaign attribution and consent depth | send logs + consent runbook | consent-aware campaign certification |
| Klaviyo | CRM / email | `preview` | API key + event mapping | yes | limited | event/attribution maturity | event sync logs + runbook | consent-aware event certification |
| Brevo | email/SMS | `placeholder` | API key | possible later | no | no current certification path | placeholder only | roadmap only |
| Twilio | email/SMS / messaging | `preview` | API credentials | yes | limited | messaging policy and consent operations | send logs + provider runbook | policy-driven messaging certification |
| Google Maps | maps | `setup_ready` | API key | yes | yes when configured | quota and restriction guidance | geocoding quota monitoring | setup-complete checklist |
| PostHog | analytics | `beta` | project key / env | yes | yes | event governance and consent consistency | analytics event monitoring | internal analytics certification |
| GA4 | analytics | `beta` | property id / tags | yes | yes | parity and consent governance | parity reports and runbook | consent-aware analytics certification |
| Sentry | analytics / observability | `beta` | DSN | yes | yes | release discipline and alert routing | error dashboards + runbook | release observability certification |
| Public API / webhooks | webhooks / API | `beta` | API key and signed secrets | yes | yes | contract maturity and broader scope model | API usage metrics + webhook runbook | versioned contract certification |

## Certification Checklist Template
For a provider to move from `preview` or `setup_ready` to `pilot_ready` or `live`, KitchenOS should require:
1. operator-facing setup guide
2. secret and auth model documented
3. env contract documented
4. webhook or sync retries implemented if relevant
5. last sync / last error visibility
6. smoke test or certification script
7. operator runbook for failures
8. support ownership
9. marketing copy aligned to maturity
10. no hidden dependency on internal-only manual steps

## Category Priorities
### Highest near-term
- payments
- e-commerce
- webhooks / API
- analytics / observability

### Next
- accounting exports
- delivery partners
- scheduling partners

### Later
- long-tail CRM/marketing providers
- broad marketplace partners

## Product Guardrails
- Setup-ready is not live.
- Partner-access-required is not live.
- Beta is not a sales claim by itself.
- Every integration shown in-app should be mapped to a current maturity state from one source of truth.
