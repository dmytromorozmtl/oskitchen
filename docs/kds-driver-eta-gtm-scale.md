# Driver ETA Tracking in KDS — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-145 feature-100 -->

> **pm-gtm-hero-banner** · **Driver ETA tracking** — **BETA** dispatch status + GPS ping countdown on KDS
>
> **estimated ETA** bands (on time / at risk / late) for active delivery tickets — **not live GPS certified**. Kitchen times expo handoff — **Do not claim** third-party courier accuracy.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `kds-driver-eta-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/kitchen/driver-eta`](/dashboard/kitchen/driver-eta) · [`components/kitchen/kds-driver-eta-screen.tsx`](../components/kitchen/kds-driver-eta-screen.tsx) · `kds-driver-eta-tracking-absolute-final-v1`  
**Related:** [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Delivery-heavy fast-casual or ghost kitchen with expo team timing handoff to couriers |
| Pain | Kitchen fires food too early or late relative to driver arrival — wants ETA visibility on KDS |
| Stack | OS Kitchen KDS + dispatch integration + optional GPS pings from delivery providers |
| Disqualifier | Requires live GPS certification, guaranteed courier ETA SLA, or DoorDash/Uber API parity contract |

### Sales-safe wedge

> “**Driver ETA tracking · BETA** — **estimated ETA** from dispatch status + GPS pings. **not live GPS certified** — **Do not claim** third-party courier accuracy in contract.”

**Pilot wedge:** Single-location delivery concept — T+1 mount KDS tablet at expo, T+3 run one delivery rush with founder on-site, T+7 review at-risk band accuracy.

---

## pm-gtm-demo-hook

**8-minute demo path** (expo → driver ETA → ticket cross-link):

1. Open [`/dashboard/kitchen/driver-eta`](/dashboard/kitchen/driver-eta) — walk hero banner **BETA** + **estimated ETA** honesty copy.
2. Show delivery ticket grid — on time / at risk / late badge bands.
3. Walk dispatch status badge + GPS freshness indicator on one active ticket.
4. Read **eta_countdown_labels** — `estimated ETA 12 min` vs GPS stale state.
5. Tap **View ticket** — kds_ticket_cross_link to Order Hub / KDS context.
6. Cross-link [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo) — expo handoff workflow.
7. Close with `/trust` — no “live GPS certified” or “guaranteed courier ETA” claims.

**Talk track:** “Expo timing layer for delivery — not a dispatch platform replacement.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this live GPS tracking?” | **not live GPS certified** — **estimated ETA** from dispatch status + ping velocity; stale GPS flagged honestly. |
| “DoorDash shows exact driver location.” | Third-party couriers vary — **Do not claim** parity with provider-native tracking without integration scope review. |
| “Can you guarantee ETA accuracy?” | **BETA** bands for kitchen handoff timing — no contractual ETA SLA; staging demo only in standard pilot. |
| “Does this replace dispatch software?” | No — **Driver ETA** is a KDS-facing view; dispatch optimization is separate roadmap scope. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Driver ETA tracking included — no separate dispatch module SKU on [`/pricing`](/pricing).
- **Multi-provider dispatch:** Included when delivery orders flow through OS Kitchen — not bundled as “GPS certified package.”
- **Enterprise ETA SLA RFP:** Custom enterprise minimum or decline — never list guaranteed courier ETA in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates delivery tracking language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Delivery-heavy concept prospect | “Pilot Week 1 — open `/dashboard/kitchen/driver-eta`, run one rush service, review at-risk bands.” |
| Ghost kitchen ops lead | “Discovery call — demo GPS fresh vs stale states on staging tenant with active deliveries.” |
| Enterprise RFP (GPS certification) | “Route to founder — attach RFP clause; **Do not claim** live GPS certification verbally.” |

Primary links: [`/dashboard/kitchen/driver-eta`](/dashboard/kitchen/driver-eta) · [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Live GPS certified tracking or contractual courier ETA accuracy  
- DoorDash/Uber/Olo native tracking parity without integration scope  
- Guaranteed sub-minute ETA refresh for all providers  
- Full competitor dispatch parity without **BETA** label  

**Always label:** **Driver ETA** · **BETA** · **estimated ETA** · **not live GPS certified** · **Do not claim** third-party courier accuracy · **sales-safe** talk tracks only  

**Human gate:** Founder + kitchen ops sign-off before any enterprise slide stating GPS or dispatch tracking scope.

---

## Wiring checklist

- [ ] `/trust` free of “live GPS certified” or “guaranteed courier ETA” forbidden claims  
- [ ] Sales deck links to `components/kitchen/kds-driver-eta-screen.tsx` honesty banner  
- [ ] Expo page cross-links to `/dashboard/kitchen/driver-eta`  
- [ ] Pilot Week 1 roadmap includes delivery rush driver ETA walkthrough  
