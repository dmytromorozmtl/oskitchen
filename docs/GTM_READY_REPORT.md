# KitchenOS — GTM layer ready report

Date reference: May 2026. This document summarizes what was added for the first 100 beta customers and how to operate it.

---

## What was added (summary)

- **Public beta funnel:** `/beta` → `BetaLead` (Zod, scoring, status workflow, optional founder notify).
- **Demo requests:** `/book-demo` → `DemoRequest` with thank-you and optional email when Resend + notify env are set.
- **Founder CRM (Owner-only):** `/dashboard/growth` with leads, demo requests, feedback, accounts (health), referrals, usage, launch analytics, onboarding calls, outreach assistant, content library, roadmap.
- **Lead scoring:** `lib/growth/lead-scoring.ts` (0–100, Hot/Warm/Cold/Poor fit).
- **Feedback loop:** In-app launcher → `AppFeedback` + growth feedback board + roadmap columns driven by feedback status.
- **Usage & activation:** `UsageEvent`, `lib/usage.ts`, `ActivationState`, home checklist card.
- **Referrals:** `?ref=CODE` cookie → signup attribution; growth referrals page.
- **Changelog:** Public `/changelog` from `ReleaseNote`; Owner drafts at `/dashboard/developer/releases`.
- **Help expansion:** `/help/order-hub`, `/help/faq`, nav links, book-demo CTA block.
- **Docs:** `docs/GTM_AUDIT.md`, `docs/OUTREACH_LIBRARY.md`, `docs/BETA_EMAIL_SEQUENCES.md`, this report.

---

## New routes (high level)

| Area | Routes |
|------|--------|
| Public | `/beta`, `/book-demo`, `/changelog` |
| Help | `/help`, `/help/getting-started`, `/help/order-hub`, `/help/integrations`, `/help/production`, `/help/packing`, `/help/billing`, `/help/faq` |
| Owner growth | `/dashboard/growth`, `.../leads`, `.../leads/[id]`, `.../demo-requests`, `.../feedback`, `.../accounts`, `.../referrals`, `.../usage`, `.../launch-analytics`, `.../onboarding-calls`, `.../outreach`, `.../content-library`, `.../roadmap` |
| Owner dev | `/dashboard/developer/releases` |

---

## New / notable database models

- `BetaLead`, `BetaLeadNote` (if present in schema)
- `DemoRequest`
- `AppFeedback`
- `OnboardingCall`
- `UsageEvent`
- `ActivationState`
- `ReferralCode`, `ReferralEvent`
- `CustomerHealthSnapshot` (optional persistence; accounts view may compute live)
- `ReleaseNote`
- `UserTourState` (schema for future product tours)

Run **`npx prisma migrate deploy`** (or your env equivalent) so tables exist before production traffic.

---

## Beta funnel status

| Stage | Status |
|-------|--------|
| Capture | Live forms persist to Postgres |
| Qualification | Rule-based score + labels in CRM |
| Notify founder | Best-effort via Resend; no-op if misconfigured |
| Spam | Placeholder fields / copy; edge rate limits recommended for scale |

---

## CRM status

- List, filter, notes, status updates, CSV export (Owner).
- Convert beta lead → demo request (action).
- “Convert to customer” remains a **placeholder** until billing/workspace provisioning rules are defined.

---

## Feedback system status

- Submit from any authenticated dashboard page (route + user context).
- Internal board with status workflow; roadmap view groups by feedback pipeline.

---

## Analytics status

- **Internal DB only** for launch analytics charts (no mandatory third-party analytics).
- Usage events fire from selected server actions; safe to extend incrementally.

---

## External tools / configuration

| Need | Notes |
|------|--------|
| **Resend** | Transactional + manual CRM sends when implemented |
| **Calendly** (optional) | Embed or link on `/book-demo` thank-you |
| **OpenAI** | Optional richer outreach copy in `/dashboard/growth/outreach` |
| **Email inbox** | `mailto:` still valid fallback on marketing |

Secrets must never be logged or exposed to the client.

---

## Next 14 days — growth plan

1. Apply DB migration; verify Owner can open `/dashboard/growth` end-to-end.
2. Post **`/beta`** and **`/book-demo`** in founder channels; track source in CRM (`source` field where used).
3. Daily CRM hygiene: NEW → CONTACTED → DEMO_BOOKED for top scores.
4. Send **manual** sequences from `docs/BETA_EMAIL_SEQUENCES.md` after key events.
5. Review `/dashboard/growth/launch-analytics` weekly; add usage hooks where drop-offs appear.

---

## First 100 leads plan

1. **20** — warm network (meal prep, catering, ghost kitchen operators you know).
2. **30** — vertical communities + LinkedIn outbound using `docs/OUTREACH_LIBRARY.md`.
3. **25** — WooCommerce / Shopify food merchants (integration angle).
4. **25** — marketplace-heavy kitchens (Uber Eats narrative; pilot disclaimers).

Target: **qualified** conversations, not raw form spam — use scoring to prioritize founder time.

---

## Verification

Run locally before shipping:

```bash
npm run typecheck
npm run build
```

Fix any TypeScript or build errors before merging.
