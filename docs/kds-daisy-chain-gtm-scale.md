# KDS Daisy-Chain Config — GTM & Sales Scale Playbook

<!-- pm-gtm: absolute-final-pm-marketing-full-scale-v1 task-138 feature-93 -->

> **pm-gtm-hero-banner** · **NCR Aloha parity** bump handoff — **BETA** daisy-chain config
>
> Prep → line → Expo links stored in settingsCenterJson. Routing rules assign the first station; daisy-chain defines the next screen after bump — **not proprietary** terminal hub sync.
>
> **pm-gtm-dark-mode-note:** Plain markdown — readable in GitHub light and dark themes.

**Policy:** `kds-daisy-chain-gtm-scale-absolute-final-v1`  
**Product surface:** [`/dashboard/kitchen/daisy-chain`](/dashboard/kitchen/daisy-chain) · [`components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx`](../components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx) · `kds-daisy-chain-config-absolute-final-v1`  
**Related:** [`/dashboard/kitchen/routing-rules`](/dashboard/kitchen/routing-rules) · [`objection-handling.md`](./objection-handling.md) · [`/trust`](/trust)

---

## pm-gtm-icp-profile

### Ideal buyer

| Attribute | Fit |
|-----------|-----|
| Model | Full-service kitchen with Prep, line, and Expo KDS screens needing bump-to-next-screen flow |
| Pain | Tickets stuck on wrong screen after bump; wants Aloha-style handoff without custom middleware |
| Stack | OS Kitchen multi-station KDS + routing rules; settingsCenterJson storage |
| Disqualifier | Requires certified NCR deployment, proprietary terminal hub sync, or hardware-certified bump relay today |

### Sales-safe wedge

> “**NCR Aloha parity** daisy-chain — toggle Prep → Grill → Expo **bump handoff** links. **BETA** config in dashboard — **not proprietary** hub sync.”

**Pilot wedge:** Single-location FSR with 3 KDS screens — T+1 configure links, T+3 verify bump preview on rush test order.

---

## pm-gtm-demo-hook

**10-minute demo path** (routing rules → daisy-chain → KDS bump):

1. Open [`/dashboard/kitchen/routing-rules`](/dashboard/kitchen/routing-rules) — show first-station assignment honesty.
2. Navigate to [`/dashboard/kitchen/daisy-chain`](/dashboard/kitchen/daisy-chain) — walk hero **BETA** banner.
3. Review enabled chain paths (Prep → Grill → Expo) — toggle one link off, show count badge update.
4. Scroll bump preview table — demonstrate next-screen resolution after bump.
5. Fire test order to KDS — bump at Prep, confirm handoff target (staging tenant).
6. Close with cross-link back to routing rules — separate concerns, no false “full Aloha certified” claim.

**Talk track:** “Routing picks the first screen; daisy-chain picks the next bump destination.”

---

## pm-gtm-objection-handling

| Objection | Response |
|-----------|----------|
| “Is this NCR Aloha certified?” | **NCR Aloha parity** UX reference — **BETA** config, not certified NCR deployment or support contract. |
| “Does bump sync to all terminals automatically?” | **not proprietary** terminal hub sync — handoff links in settingsCenterJson; not hardware relay certification. |
| “Toast has expo routing built in.” | Competitors vary — our wedge is explicit toggle per link + bump preview + routing-rules cross-link. |
| “We need 10 custom station chains.” | Enterprise SOW for extended links — standard pilot uses default Prep/line/Expo paths only. |

---

## pm-gtm-pricing-talk-track

- **Standard pilot:** Daisy-chain config included — no separate KDS routing SKU on [`/pricing`](/pricing).
- **Multi-station enterprise:** Custom chain design session in pilot Week 1 — eng-assisted toggle setup.
- **Certified NCR migration:** SI partner quote — never bundle “Aloha certified bump relay” in list pricing.
- Anchor **sales-safe** claims: **BETA** until `/trust` updates production bump SLO language.

---

## pm-gtm-primary-cta

| Motion | CTA |
|--------|-----|
| 3-screen KDS prospect | “Pilot Week 1 — configure daisy-chain links, run bump preview, test one rush order.” |
| Multi-station ops lead | “Discovery call — demo routing rules + daisy-chain cross-link on staging tenant.” |
| Enterprise RFP (certified KDS hub) | “Route to founder — attach RFP clause; no verbal-commit on proprietary hub sync.” |

Primary links: [`/dashboard/kitchen/daisy-chain`](/dashboard/kitchen/daisy-chain) · [`/dashboard/kitchen/routing-rules`](/dashboard/kitchen/routing-rules)

---

## pm-gtm-honesty-guardrails

**Do **not** claim:**

- Certified NCR Aloha deployment, interoperability, or support entitlement  
- Proprietary terminal hub sync or hardware-certified bump relay for all venues  
- That daisy-chain replaces routing rules for first-station assignment  
- Live production bump SLO without staging verification  

**Always label:** **NCR Aloha parity** (UX reference) · **BETA** · **bump handoff** scope · **not proprietary** hub sync · **sales-safe** talk tracks only  

**Human gate:** Founder + kitchen ops sign-off before any enterprise slide stating KDS bump or routing scope.

---

## Wiring checklist

- [ ] `/trust` free of “certified NCR” forbidden claims  
- [ ] Sales deck links to `components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx` honesty banner  
- [ ] Routing rules panel cross-links to `/dashboard/kitchen/daisy-chain`  
- [ ] Pilot Week 1 roadmap includes daisy-chain config after first KDS live  
