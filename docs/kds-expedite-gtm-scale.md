# KDS Expedite Screen — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-139 feature-94 -->

> **pm-gtm-hero-banner** · **Expedite screen** — **BETA** full-screen priority routing for rush service
>
> Hero ticket + priority queue + rush banner on tablet landscape. Uses the same **priority routing** engine as main KDS rush mode — **not rush-hour certified** for every venue.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `kds-expedite-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/kitchen/expedite`](/dashboard/kitchen/expedite) · [`components/kitchen/kds-expedite-screen.tsx`](../components/kitchen/kds-expedite-screen.tsx) · `kds-expedite-screen-absolute-final-v1`  
**Related:** [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | High-volume FSR or fast-casual with dedicated expo runner and rush-hour visibility gaps |
| Pain | Expo staff loses track of overdue tickets; wants full-screen priority queue separate from line KDS |
| Stack | OS Kitchen KDS + rush mode; tablet landscape at expo pass |
| Disqualifier | Requires certified rush-hour SLO, proprietary expo hub sync, or sub-second guaranteed bump relay |

### Sales-safe wedge

> “**Expedite screen — BETA polish** — hero ticket, priority queue, 44px touch targets. Same **priority routing** as rush mode — **not rush-hour certified** in contract.”

**Pilot wedge:** Single-location rush service — T+1 mount tablet at expo, T+3 run simulated rush with founder on-site.

---

## pm-gtm-demo-hook

**8-minute demo path** (expo → expedite → rush bump):

1. Open [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo) — click **Expedite screen** link in header.
2. Walk hero banner — **BETA** label and **not rush-hour certified** honesty copy.
3. Show rush level banner + active/overdue badge row when queue populated.
4. Tap hero ticket — deep link to Order Hub / KDS ticket context.
5. Scroll priority **Expedite screen** queue — rank badges, elapsed time, reason chips.
6. Rotate to tablet landscape — show dark-mode polish and 44px touch targets.
7. Close with `/trust` — no “rush-hour SLO guaranteed” claim.

**Talk track:** “Expo visibility layer — not a separate certified rush platform.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Do you guarantee rush-hour performance?” | **not rush-hour certified** — **BETA** expedite UI uses existing **priority routing** engine; no contractual SLO. |
| “Toast has expo mode built in.” | Competitors vary — our wedge is dedicated full-screen queue + hero ticket + honest **BETA** label. |
| “Is this a separate KDS product?” | No — same rush/priority engine; **Expedite screen** is a polished expo-facing view, not proprietary hub sync. |
| “We need certified bump timing.” | Escalate to founder — do not verbal-commit rush SLO; staging demo only in standard pilot. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Expedite screen included — no separate expo module SKU on [`/pricing`](/pricing).
- **Multi-station enterprise:** Tablet hardware + mount quote via SI partner — not bundled as “certified rush package.”
- **Rush-hour SLA RFP:** Custom enterprise minimum or decline — never list guaranteed rush performance in standard pricing.
- Anchor **sales-safe** claims until `/trust` updates production rush language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Rush-service FSR prospect | “Pilot Week 1 — mount expo tablet, open `/dashboard/kitchen/expedite`, run one simulated rush.” |
| Fast-casual ops lead | “Discovery call — demo hero ticket + queue on staging tenant with overdue badges.” |
| Enterprise RFP (rush SLO) | “Route to founder — attach RFP clause; no verbal-commit on rush-hour certification.” |

Primary links: [`/dashboard/kitchen/expedite`](/dashboard/kitchen/expedite) · [`/dashboard/kitchen/expo`](/dashboard/kitchen/expo)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Rush-hour certified performance or contractual expo SLO for all venues  
- Separate proprietary priority engine beyond existing KDS rush mode  
- Sub-second bump relay or hardware-certified expo hub sync  
- Toast/Square expo parity without **BETA** label  

**Always label:** **Expedite screen** · **BETA** · **priority routing** (shared engine) · **not rush-hour certified** · **sales-safe** talk tracks only  

**Human gate:** Founder + kitchen ops sign-off before any enterprise slide stating rush or expo scope.

---

## Wiring checklist

- [ ] `/trust` free of “rush-hour SLO” forbidden claims  
- [ ] Sales deck links to `components/kitchen/kds-expedite-screen.tsx` honesty banner  
- [ ] Expo page cross-links to `/dashboard/kitchen/expedite`  
- [ ] Pilot Week 1 roadmap includes expo tablet expedite walkthrough  
