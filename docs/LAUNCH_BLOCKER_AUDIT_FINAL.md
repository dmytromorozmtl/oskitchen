# Launch blocker audit (final)

This document consolidates A–G readiness dimensions for **closed beta / paid pilot**. Each row: **state**, **risk**, **who**, **where**, **fix**, **now?**, **priority**.

## A — Promise honesty
| Item | State | Risk | Affected | Where | Fix | Now? | Pri |
|------|-------|------|----------|-------|-----|------|-----|
| Uber Eats | Adapter + stub/eval paths | Over-claiming live marketplace | Operators + guests | `app/integrations/uber-eats`, webhooks | Copy + capability matrix = PARTNER_ACCESS_REQUIRED | Partially | P0 |
| Uber Direct | Placeholder dispatch | False delivery SLA | Routes UI | `lib/public-copy`, routes | Roadmap status + matrix | Partially | P0 |
| DoorDash | No native connector | Expectation gap | Sales | matrix | ROADMAP in matrix | Yes | P1 |
| SMS | Enum placeholder only | Missing alerts | CRM/notifications | `NOTIFICATION_CHANNELS` | Matrix NOT_AVAILABLE + UI | Yes | P0 |
| Stripe Terminal | Not SDK-integrated | Hardware claim | POS marketing | matrix + pricing FAQ | ROADMAP / external terminal wording | Yes | P1 |
| POS offline | Not implemented | Lost sales offline | POS | matrix + runbook | NOT_AVAILABLE + runbook | Yes | P0 |
| SSO/SOC2/SCIM | Roadmap | Enterprise procurement | Trust | `/trust` disclaimer | Honest roadmap copy | Yes | P1 |

## B — Reliability
| Item | State | Risk | Fix | Now? | Pri |
|------|-------|------|-----|------|-----|
| Inline webhooks | Default path | Timeouts at scale | `WEBHOOK_ASYNC_QUEUE` + DB jobs + cron | Woo done | P0 |
| Webhook replay | UI only | Ops cannot recover | Audited replay action + audit log | Not yet | P1 |
| Large import/export | Partial jobs | Timeouts | Background + object storage roadmap | Docs + limits | P1 |
| Queue monitoring | Partial | Blind spots | Platform webhooks + health JSON | Partial | P2 |

## C — Security / compliance
| Item | State | Fix | Pri |
|------|-------|-----|-----|
| Public API rate limit | Added IP window for beta form | Expand to other public POSTs | P1 |
| RLS | Prisma server-side default | Document in SECURITY doc | P2 |
| DPA / data rights | Template page `/legal/data-rights` | Counsel review | P0 |
| Legal gate | `LEGAL_POLICIES_PUBLISHED` | Enforce before broad marketing | P0 |

## D — QA
| Gap | Fix | Pri |
|-----|-----|-----|
| Signup→billing→order E2E | Add Playwright flow (no real Stripe in CI) | P1 |
| Storefront checkout depth | Extend storefront spec | P1 |
| Webhook contract tests | Golden payloads + signature vectors | P2 |

## E — Product depth vs nav
| Item | State | Fix | Pri |
|------|-------|-----|-----|
| Many modules | Pilot nav profile | `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` | P1 |

## F — Ops / trust
| Item | State | Fix | Pri |
|------|-------|-----|-----|
| Status | `/trust/status` + `/api/health` extras | Expand metrics | P2 |
| Runbooks | `docs/runbooks/*` | Keep updated | P1 |
| Sentry | `SENTRY_DSN` hook logs safe | Full SDK later | P2 |

## G — Dev env
| Item | Fix | Pri |
|------|-----|-----|
| Node 20 vs 22 | README + engines aligned to 22 | Done |

**P0 before paid pilot:** honesty matrix live in UI, legal gate, POS offline disclosure, webhook path choice documented, beta rate limit.
