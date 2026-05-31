# Stripe Terminal — Sales One-Pager

**Status:** Preview — simulated reader E2E certified; pilot hardware (M2) next  
**Audience:** Sales, VP Operations, pilot operators  
**Technical:** [`stripe-terminal-implementation-plan.md`](./stripe-terminal-implementation-plan.md)

---

## One-line pitch

**Same card-present SDK as Square — Stripe Reader M2 from $59 — on a full restaurant OS that Toast charges $799+ for proprietary hardware.**

---

## Supported hardware (pilot)

| Device | Price | Best for |
|--------|-------|----------|
| **Stripe Reader M2** | **~$59** | Handheld / mobile stations (pilot default) |
| Stripe Reader S700 | ~$299 | Fixed counter (scale-out) |
| Simulated reader | $0 | Staging + CI proof (shipped) |

**Integration:** `@stripe/terminal-js` + `/api/pos/terminal` — connect, tap/insert/swipe, receipt in POS.

---

## Competitor comparison

| | Toast | Square | Lightspeed | **OS Kitchen** |
|---|-------|--------|------------|----------------|
| Counter terminal | ~$799 proprietary | ~$299 reader | Partner hardware | **$59 M2** (Stripe) |
| Monthly terminal fee | Often bundled in plan | Included with Square POS | Varies | **No per-reader OS fee** (Stripe processing only) |
| Offline card | Limited | Square Offline | Varies | **Cash queue yes; card requires connection** (honest) |
| OS depth | POS-first | POS + payments | Retail + F&B | **Full kitchen OS** (KDS, integrations, B2B) |

**Sales line:** *"We don't lock you into $799 Toast hardware. Use Stripe's reader ecosystem — same rails as half the market — with a deeper operating system."*

---

## What works today (evidence)

| Capability | Evidence |
|------------|----------|
| Connection token + PaymentIntent API | `services/payments/stripe-terminal-service.ts` |
| Reader UI (connect, status, battery) | `components/pos/stripe-terminal-reader.tsx` |
| POS card checkout flow | `components/dashboard/pos-terminal-client.tsx` |
| Simulated reader E2E | `e2e/stripe-terminal-payment.spec.ts` |
| Unit tests | `tests/unit/stripe-terminal-client.test.ts` |

**Honesty:** Not production-certified until pilot site completes 30-day live capture runbook. Say **"preview — pilot-ready with Stripe-approved readers."**

---

## ROI for operator

- **Hardware savings:** M2 vs Toast counter bundle → **~$240–$740 per station** upfront
- **Single vendor for cards + online:** Stripe Checkout + Terminal same dashboard
- **No duplicate POS:** Card capture inside existing shift/register/audit spine

---

## Forbidden claims (until pilot sign-off)

- "PCI certified hardware bundle"
- "Works offline for card payments"
- "Included Tap to Pay on iPhone" (Phase 4 — not web pilot)

---

## Next step for pilot

1. DevOps: `STRIPE_SECRET_KEY` + Terminal enabled in Stripe Dashboard  
2. Ship 1× Reader M2 per mobile station  
3. Run staging simulated proof → live pilot capture  
4. Sign pilot readiness checklist in `docs/stripe-terminal-implementation-plan.md`
