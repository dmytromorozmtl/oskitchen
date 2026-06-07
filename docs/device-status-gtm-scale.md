# Device Status Dashboard — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-135 feature-90 -->

> **pm-gtm-hero-banner** · Clover parity device grid — **Configuration only** for registers/terminals, **Stripe** reader sync
>
> Status reflects saved configuration and Stripe reader sync — **not proprietary hub telemetry**. Do **not** claim live heartbeat on all device types or certified Clover hardware management.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `device-status-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/devices`](/dashboard/devices) · [`components/dashboard/devices/device-status-dashboard.tsx`](../components/dashboard/devices/device-status-dashboard.tsx) · `device-status-dashboard-absolute-final-v1`  
**Related:** [`/dashboard/integration-health`](/dashboard/integration-health) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Multi-location operator with Stripe readers + OS Kitchen POS registers needing one status view |
| Pain | Devices scattered across settings pages; ops wants Clover-style location grid before rush hour |
| Stack | Stripe Terminal configured; OS Kitchen registers/terminals in hardware fleet |
| Disqualifier | Needs proprietary hub telemetry, MDM fleet management, or certified Clover device provisioning out of the box |

### Sales-safe wedge

> “**Clover parity** location-grouped grid — online/offline for **Stripe** readers, **Configuration only** labels for registers until live heartbeat ships. **not proprietary hub telemetry**.”

**Pilot wedge:** ≤5-location operator with 1–3 Stripe readers — demo `/dashboard/devices` attention banner and Integration Health strip.

---

## pm-gtm-demo-hook

**12-minute demo path** (devices → integration health → hardware settings):

1. Open [`/dashboard/devices`](/dashboard/devices) — walk summary cards (total, online, configured, offline).
2. Show location-grouped grid — **Clover parity** badges per device type (register, terminal, reader).
3. Highlight honesty banner — registers show **Configuration only**; readers reflect **Stripe** sync.
4. Click offline device — attention banner counts needs-attention devices.
5. Pivot to [`/dashboard/integration-health`](/dashboard/integration-health) — device strip links back to fleet view.
6. Close with manage readers link — no claim of live heartbeat on all hardware types.

**Talk track:** “This is honest fleet visibility — not a proprietary device hub.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this like Clover’s device hub?” | **Clover parity** UX — location grid, online/offline badges, attention alerts. Under the hood: **Configuration only** for POS until heartbeat ships; **not proprietary hub telemetry**. |
| “Are all devices live-monitored?” | No — registers/terminals show saved configuration status. **Stripe** readers sync online/offline when credentials configured. |
| “Can you remote-reboot my printer?” | **Not available** — no MDM or remote device control in this release. |
| “Square shows device health in dashboard.” | Competitors vary — our wedge is honest labels + Integration Health Center wiring, not false LIVE badges. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Device status dashboard included on Enterprise / multi-location tiers — no separate hardware monitoring SKU on [`/pricing`](/pricing).
- **Stripe readers:** Requires Stripe Terminal configuration — eng-assisted pairing in pilot Week 1; not bundled as “free hardware monitoring.”
- **Certified SI hardware rollout:** Custom SOW for multi-reader fleets — never list “Clover parity MDM” in standard pricing.
- Anchor **sales-safe** claims: grid is BETA posture until `/trust` updates heartbeat roadmap.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| Stripe reader prospect | “Pilot Week 1 — pair reader, open `/dashboard/devices`, verify online badge after sync.” |
| Multi-location ops lead | “Discovery call — demo location grid + attention banner; share Integration Health Center link.” |
| RFP hardware fleet clause | “Route to founder — attach honesty doc; no verbal-commit on MDM or hub telemetry dates.” |

Primary links: [`/dashboard/devices`](/dashboard/devices) · [`/dashboard/integration-health`](/dashboard/integration-health)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Live heartbeat or remote management for all POS registers and terminals today  
- Proprietary hub telemetry or MDM-equivalent fleet control  
- Certified Clover hardware provisioning or Square Device Dashboard parity  
- That “online” on registers means network-connected hardware monitoring  

**Always label:** **Configuration only** · **not proprietary hub telemetry** · **Stripe** reader sync scope · **Clover parity** (UX reference, not certification) · **sales-safe** talk tracks only  

**Human gate:** Founder + ops sign-off before any enterprise slide stating device fleet monitoring scope.

---

## Wiring checklist

- [ ] `/trust` free of “live device monitoring” forbidden claims  
- [ ] Sales deck links to `components/dashboard/devices/device-status-dashboard.tsx` honesty banner language  
- [ ] Integration Health Center strip points to `/dashboard/devices`  
- [ ] Demo script uses **Configuration only** label for register rows  
