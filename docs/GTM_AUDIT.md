# OS Kitchen — Go-to-market audit

Purpose: baseline what exists for acquiring the first 100 beta customers, gaps, business impact, and implementation priority.

**Priority legend:** P0 before beta outreach · P1 conversion lift · P2 after first users.

---

## Landing page CTAs

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Primary conversion | Marketing site links to product signup and **Book demo** in header | Secondary CTA to **`/beta`** waitlist on hero if split traffic desired | Clear path for “not ready to sign up” leads | P1 |
| Trust | Polished UI, demo mode documented | Optional logos / pilot quotes when available | Reduces bounce on cold traffic | P2 |

## Demo CTAs

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Public flow | **`/book-demo`** with qualification fields + thank-you | Embedded Calendly (placeholder copy only until URL configured) | Faster time-to-meeting | P1 |
| Internal follow-up | Demo rows in **`/dashboard/growth/demo-requests`** | Playbook link in CRM row actions | Consistent founder follow-up | P2 |

## Pricing CTAs

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Upgrade intent | Billing/help docs exist | Explicit **Book demo** + **Join beta** on pricing blocks | Captures enterprise-ish leads | P1 |

## Beta page

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Waitlist | **`/beta`** with full application + **`BetaLead`** model | Optional honeypot + rate limit at edge (placeholder noted in form) | Spam resistance at scale | P0 |

## Contact forms

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Unified capture | Beta + demo forms persist to DB | Single “contact” form if non-beta inquiries spike | Less fragmentation | P2 |

## Signup flow

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Referral | **`?ref=CODE`** → cookie → hidden signup field | Referral dashboard shows counts; no reward automation | Viral loop measurement | P1 |
| Analytics | Usage + activation hooks | Funnel chart in launch analytics (DB-backed) | Visibility into drop-offs | P1 |

## Onboarding flow

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Completion | Onboarding action tracks completion | Email nudges manual only (see **`docs/BETA_EMAIL_SEQUENCES.md`**) | Higher activation | P1 |
| Checklist | Home dashboard activation card | Dismiss state persists per user | Reduces overwhelm | P1 |

## Demo mode

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Safety | Synthetic data labeling in help copy | In-product banner if demo tenant | Prevents “fake customer” mistakes | P0 |

## Analytics readiness

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Product analytics | **`UsageEvent`** + **`lib/usage.ts`**, growth usage page | No third-party pixels required for MVP | Founder-owned metrics | P1 |
| Launch dashboard | **`/dashboard/growth/launch-analytics`** | Export to Sheets manual (CSV elsewhere) | Reporting for investors/advisors | P2 |

## Lead capture

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| CRM | **`BetaLead`**, **`DemoRequest`**, scoring, CSV export | Auto-enrichment (Clearbit, etc.) | Faster qualification | P2 |

## Feedback collection

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| In-app | Feedback launcher + **`AppFeedback`** | Screenshot upload (URL field optional) | Richer bug reports | P2 |
| Roadmap | **`/dashboard/growth/roadmap`** groups feedback | Customer-facing portal deferred | Internal prioritization | P1 |

## Customer success tools

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Calls | **`OnboardingCall`** + growth route | Calendar integration | Scheduling friction | P2 |
| Health | Computed health on accounts page | Scheduled snapshots job | Proactive saves | P2 |

## Referral opportunities

| Aspect | Current state | Missing piece | Business impact | Priority |
|--------|----------------|---------------|-----------------|----------|
| Tracking | Referral codes + events | Rewards / Stripe credit | Motivated sharing | P2 |

---

## Recommended sequence (first 14 days)

1. **P0:** Confirm Owner-only growth routes, spam placeholders on public forms, demo data labeling.
2. **P1:** Drive traffic to **`/beta`** and **`/book-demo`**; use CRM daily; send manual sequences from **`docs/BETA_EMAIL_SEQUENCES.md`** when Resend is configured.
3. **P2:** Calendly embed, enrichment, customer-facing roadmap.
