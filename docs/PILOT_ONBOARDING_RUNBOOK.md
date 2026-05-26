# Pilot Onboarding Runbook

**Related:** `docs/pilot-program.md` · `docs/GTM_EXECUTION_PLAN_24MAY2026.md`  
**Target:** 3 paid pilots in 90 days · White-glove onboarding ≤ 4 hours active time

---

## Pre-qualification (15 min call)

Use checklist from `docs/pilot-program.md`:

- [ ] US/CA, cloud-only, web POS acceptable
- [ ] No offline card processing requirement
- [ ] Vertical fits: meal prep, ghost kitchen, or café
- [ ] Willing to provide metrics + case study permission (named or anonymized)
- [ ] Signed pilot agreement (legal-reviewed)

**Record in CRM/spreadsheet:** operator name, vertical, weekly order volume, current stack, start date.

---

## Day 0 — Kickoff (60 min)

| Step | Action | KitchenOS surface |
|------|--------|-------------------|
| 1 | Create workspace + invite team | Settings → Team |
| 2 | Connect Stripe Connect | Settings → Billing / Storefront |
| 3 | Import menu or seed demo | Import Center or Templates |
| 4 | Configure production day | Today / Operating mode |
| 5 | Walkthrough: order → KDS → packing | Orders, Kitchen, Packing |
| 6 | Share KB | `/dashboard/support/kb` |

**Deliverable:** Operator completes one test order end-to-end.

---

## Week 1 — Stabilize (30 min check-in)

- [ ] Live orders flowing (POS or storefront)
- [ ] KDS used during service window
- [ ] Packing/labels if applicable
- [ ] Support channel confirmed (widget + email)
- [ ] Capture **baseline metrics** (see below)

### Baseline metrics template

| Metric | Week 0 value |
|--------|----------------|
| Orders / week | |
| Avg prep time (min) | |
| Packing error rate % | |
| Software tools replaced (#) | |
| Hours/week on manual coordination | |

---

## Day 30 — Review + NPS (30 min)

1. In-app NPS prompt (or Typeform backup).
2. Review metrics vs baseline.
3. Log top 3 friction points → GitHub/issues or internal backlog.
4. Ask for case study quote if results positive.

**Convert to paid:** offer list price minus pilot discount ending; confirm Stripe subscription.

---

## Day 60–90 — Case study

| Section | Content |
|---------|---------|
| Context | Vertical, size, city (optional) |
| Problem | Tools, pain, before state |
| Solution | Modules used (POS, KDS, storefront, …) |
| Results | **Numbers** — orders, time saved, error reduction |
| Quote | Operator voice |

Publish on `/blog` or future `/customers` — link from homepage social proof.

---

## Escalation

| Issue | Response |
|-------|----------|
| P0 outage | Status page + fix within 4h |
| Data wrong | Platform support session |
| Feature gap | Log in pilot feedback sheet; do not promise date |

---

## Internal time budget

| Phase | Founder time |
|-------|----------------|
| Pre-sale + legal | 2h |
| Day 0 kickoff | 1h |
| Week 1–4 check-ins | 4 × 30m = 2h |
| Case study write-up | 2h |
| **Total per pilot** | **~7h** |
