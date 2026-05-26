# Product Excellence Audit (1000% pass)

**Perspective:** first-time user, owner, manager, cashier, kitchen, packer, driver, platform admin, support admin, investor/demo.  
**Scale:** 1 = broken/confusing, 10 = premium SaaS. Scores are directional — use with `PRODUCT_EXCELLENCE_QA_MATRIX_1000.md` for regression testing.

## Legend

| Score | Meaning |
|-------|---------|
| 8–10 | Demo-ready / commercial |
| 5–7 | Functional, needs polish |
| 1–4 | Trust or usability risk |

## Route matrix

| Route | Clarity | Useful | Hierarchy | Actionable | Empty state | Mobile | Loading/errors | Role fit | Demo | Credibility | Top issue | Pri |
|-------|---------|--------|-----------|------------|---------------|--------|------------------|----------|------|-------------|-----------|-----|
| `/` (marketing) | 8 | 8 | 7 | 7 | n/a | 7 | 7 | n/a | 8 | 8 | Hero could be tighter vs verticals | P2 |
| `/pricing` | 8 | 8 | 8 | 8 | n/a | 7 | 7 | n/a | 8 | 8 | Align CTAs with `/demo` | P2 |
| `/demo` | 9 | 9 | 8 | 9 | n/a | 8 | 8 | n/a | 9 | 9 | Investor badge added this pass | P1 |
| `/beta`, `/book-demo` | 7 | 7 | 7 | 7 | n/a | 7 | 7 | n/a | 7 | 7 | Reduce generic form friction | P2 |
| `/onboarding` | 8 | 9 | 7 | 8 | n/a | 6 | 7 | Owner | 8 | 8 | Resume affordance on partial complete | P1 |
| `/dashboard` | 8 | 8 | 7 | 7 | 6 | 6 | 7 | Owner | 7 | 8 | KPI density vs tablet | P2 |
| `/dashboard/today` | 9 | 9 | 8 | 9 | 7 | 7 | 8 | Ops | 9 | 9 | Blocker copy vs raw enums | P1 |
| `/dashboard/pos` | 8 | 9 | 7 | 8 | 7 | 6 | 7 | Cashier | 8 | 8 | Touch targets on small phones | P1 |
| `/dashboard/orders` | 9 | 9 | 8 | 9 | **9** | 7 | 7 | Ops | 9 | 9 | Improved empty state this pass | — |
| Order detail | 8 | 9 | 7 | 8 | 6 | 6 | 7 | Ops | 7 | 8 | Sticky mobile actions | P1 |
| Order hub | 7 | 8 | 7 | 7 | 6 | 6 | 7 | Manager | 8 | 8 | Explain channel vs KitchenOS order | P1 |
| Product mapping | 7 | 8 | 6 | 7 | 6 | 6 | 6 | Manager | 7 | 7 | Reduce jargon in empty rows | P2 |
| Production | 8 | 9 | 7 | 8 | 6 | 6 | 7 | Kitchen | 8 | 8 | Empty → guided first batch | P1 |
| Kitchen screen | 8 | 9 | 7 | 8 | 6 | 6 | 7 | Kitchen | 8 | 8 | Large tap targets audit | P1 |
| Packing | 8 | 9 | 7 | 8 | 6 | 6 | 7 | Packer | 8 | 8 | Same as kitchen | P1 |
| Routes | 7 | 8 | 7 | 7 | 6 | 6 | 6 | Driver | 7 | 7 | Driver privacy copy pass | P1 |
| CRM | 7 | 8 | 7 | 7 | 6 | 6 | 6 | CS | 6 | 7 | Segment empty state | P2 |
| Analytics / reports | 8 | 8 | 7 | 7 | 6 | 6 | 7 | Owner | 7 | 7 | Skeletons on slow queries | P1 |
| Settings | 8 | 9 | 6 | 8 | n/a | 6 | 7 | Owner | 6 | 8 | Deep settings IA | P2 |
| Support | 7 | 8 | 7 | 7 | 6 | 6 | 7 | CS | 6 | 7 | Ticket empty state | P2 |
| `/platform/dashboard` | 8 | 8 | 7 | 7 | n/a | 6 | 7 | Platform | 6 | 8 | Keep honest metrics only | P1 |
| Platform support | 7 | 9 | 7 | 8 | 6 | 6 | 7 | Support | 6 | 8 | Separate internal vs customer notes | P1 |
| Integration health | 8 | 9 | 8 | 8 | 7 | 7 | 8 | Owner | 8 | 9 | Provider-missing pattern rollout | P1 |
| Error recovery | 8 | 9 | 8 | 9 | n/a | 7 | 8 | Owner | 8 | 9 | Webhook queue vs failure clarity | P1 |
| Data integrity | 7 | 8 | 7 | 8 | n/a | 6 | 7 | Owner | 6 | 8 | Explain checks vs fixes | P2 |

## Cross-cutting gaps

1. **Status language** — new `lib/status/*` + badges; adopt gradually in order/production UIs (**P1**).  
2. **Design system** — new layout/feedback primitives; migrate high-traffic pages incrementally (**P2**).  
3. **Marketing** — keep integration honesty; tighten CTAs (**P2**).

## Issue template (examples)

| Issue | Current | Why unprofessional | Fix | Pri |
|-------|---------|-------------------|-----|-----|
| Orders empty | Generic copy | Felt “dead” | Actionable empty state + demo CTA | P1 |
| Sidebar noise | Many peer groups | Cognitive overload | Final grouped nav + focused default | P1 |
| Setup hint | Label only | No “why” | `why` + minutes + deep link | P1 |
