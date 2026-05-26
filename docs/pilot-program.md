# KitchenOS — Pilot Program

**Version:** 1.0 · **Date:** 23 May 2026  
**Related:** [sales-deck.md](sales-deck.md) · [PILOT_PLAYBOOK.md](PILOT_PLAYBOOK.md) · [GTM_SALES_PLAYBOOK.md](GTM_SALES_PLAYBOOK.md)

---

## Offer Summary

| Item | Detail |
|------|--------|
| Duration | 3 months |
| Discount | **50% off** list price |
| Starter pilot | $15/mo (normally $29) |
| Pro pilot | $40/mo (normally $79) |
| Team pilot | $100/mo (normally $199) |
| Onboarding | White-glove setup (menu, products, storefront) |
| Support | Weekly 30-min check-in call |
| Feature requests | Priority queue during pilot |
| Case study | Written permission for anonymized or named publish |

---

## Target: Find 3 Pilots

| # | Segment | Why | Solution page |
|---|---------|-----|---------------|
| 1 | **Meal Prep Business** | Strongest product fit, weekly preorder model | `/solutions/meal-prep` |
| 2 | **Ghost Kitchen / Virtual Brand** | Multi-brand + shared KDS narrative | `/solutions/ghost-kitchens` |
| 3 | **Small Restaurant or Café** | POS + KDS + tables proof point | `/solutions/restaurants` |

---

## Qualification Checklist

Before inviting to pilot, confirm:

- [ ] US or Canada, cloud-delivered (no on-site install needed)
- [ ] Accepts **web-first POS** (tablet/laptop, not proprietary terminal)
- [ ] Does **not** require offline card processing or Stripe Terminal hardware
- [ ] Understands delivery app sync is **Woo/Shopify/manual** today (not native Uber/DoorDash)
- [ ] Decision-maker available for weekly 30-min calls
- [ ] Willing to provide feedback + case study permission

**Disqualify early:** needs SSO/SOC2 today, SMS-primary guest comms, or native delivery marketplace sync as day-one requirement.

---

## Onboarding Timeline (Week 1)

| Day | Activity |
|-----|----------|
| D0 | Signed pilot agreement + Stripe subscription at 50% coupon |
| D1 | Kickoff call — goals, menu structure, channels |
| D2 | Menu + products imported (or built in dashboard) |
| D3 | Storefront theme + checkout tested |
| D4 | Staff accounts + POS register created |
| D5 | Production + packing walkthrough |
| D7 | First live order (supervised) |

---

## Weekly Check-in Agenda (30 min)

1. Orders processed this week / any blockers (5 min)
2. Feature friction — what's slow or confusing (10 min)
3. Metrics: time saved, waste, order volume (5 min)
4. Next week goals + action items (10 min)

Log notes in `docs/pilot-reports/` using [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md).

---

## Case Study Template

Use after pilot month 2–3 when operator has measurable results.

```markdown
# Case Study: [Company Name or "Anonymous Meal Prep Operator"]

## Overview
- **Company:** [name or anonymized]
- **Type:** [meal prep / ghost kitchen / restaurant / catering]
- **Location:** [city, state/province]
- **Size:** [orders/week, staff count]
- **Plan:** [Starter / Pro / Team]

## Before KitchenOS
[2–3 sentences: chaos, tools used, pain points]
- Spreadsheets for weekly demand
- Manual packing lists
- [Specific pain]

## After KitchenOS
[2–3 sentences: workflow today]
- Single order hub from storefront + POS
- Production board drives batch prep
- Packing verification reduced errors

## Key Metrics
| Metric | Before | After |
|--------|--------|-------|
| Time on weekly planning | X hrs | Y hrs |
| Packing errors / week | X | Y |
| Preorder volume | X | Y |
| Food waste estimate | X% | Y% |

## Quote
> "[Quote from owner/chef/operator]"
> — [Name], [Title]

## Screenshots
- [ ] Today dashboard
- [ ] Production board
- [ ] Storefront (public URL)
- [ ] Packing verification

## Permission
- [ ] Written consent to publish (named / anonymized)
- [ ] Logo usage approved (if named)
```

---

## Pilot Success Metrics (GA Gates)

From [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md):

- **Activation:** ≥ 3 core modules used in week 1 (orders, production OR POS, storefront OR packing)
- **Retention:** operator active week 4 of pilot
- **Support load:** < 2 critical tickets/month after week 2
- **NPS:** ≥ 40 at pilot end
- **Conversion:** ≥ 2 of 3 pilots convert to full price at month 4

---

## Sales Scripts

### Opening (email / call)

> We're selecting **3 operators** for a discounted 3-month pilot with white-glove onboarding. You'd get weekly check-ins and priority on features that matter to your kitchen. In return we'd love to document your results as a case study. Would a 15-minute fit call make sense?

### Objection: "We already have Toast/Square"

> Most teams we talk to keep their payment POS but still run kitchen on paper or a second tablet. KitchenOS replaces the **second system** — production, preorder, and packing — on devices you own. We can start there and expand to full floor POS when you're ready.

---

## Contacts & Tracking

| Pilot # | Company | Segment | Start date | Status | Case study |
|---------|---------|---------|------------|--------|------------|
| 1 | _TBD_ | Meal prep | — | Prospect | — |
| 2 | _TBD_ | Ghost kitchen | — | Prospect | — |
| 3 | _TBD_ | Restaurant/café | — | Prospect | — |

Update this table as pilots are signed.
