# OS Kitchen Operator UX Speed Audit

**Date:** 2026-05-28  
**HEAD:** `064af17` @ `main`  
**Era 18 context:** 60 cycles of focus strips, next-action heroes, role-based landing, go-live command centers  
**Companion:** `docs/full-wow-product-breakthrough-audit-2026-05-28.md`

**Method:** Role-based task analysis against current UI paths, Era 18 wiring, competitor benchmarks (Toast, Square, TouchBistro, 7shifts). Click counts are **estimates** from dashboard depth, not instrumented telemetry.

---

## Executive UX Verdict

Era 18 ** materially improved operator clarity** — attention strips, single next-action heroes, collapsed secondary signals, persona default landing — but **did not achieve Square-level simplicity**. Nav breadth (~700 pages) still overwhelms owners. **WOW UX** requires one daily command surface per role, not 40 more row-level CTAs.

**Operator UX score: 81/100** (+3 vs Era 17). **Blocks +10:** launch wizard, owner briefing, cashier speed mode, table service beta.

---

## Role Task Matrix

| Role | Task | Current Flow | Ideal Flow | Friction | WOW Fix | Priority |
|------|------|--------------|------------|----------|---------|----------|
| **Owner** | Check today's ops health | Dashboard → Today → multiple strips | Open app → **Daily Briefing** single screen | 4–8 clicks; nav noise | Owner briefing command center | **P0** |
| **Owner** | Launch new location | Go-live hub + checklist + validation rows | **Launch wizard** 5 steps | 10+ clicks; cognitive load | One wizard with progress ring | **P0** |
| **Owner** | Review pilot readiness | Go-live project + platform ops panels | Briefing shows GO/NO-GO status | Multiple pages | Collapse into briefing | P1 |
| **Owner** | Connect Woo/Shopify | Integrations → wizard → health → live proof | Wizard with inline live test | 6–10 clicks | One-click channel proof | **P0** |
| **Owner** | View margins | Reports → financial → export | Briefing margin tile + drill | 5+ clicks | Real-time profit tile | P1 |
| **Cashier** | Start shift | POS → shifts → open | Login → **POS terminal** (Era 18 landing) | 2–3 clicks | Sustain role landing | sustain |
| **Cashier** | Ring sale | POS terminal | Same | Discount UI improved Era 18 | **Speed mode** minimal chrome | P1 |
| **Cashier** | Apply discount | Terminal discount UI Era 18 | Manager PIN inline | 2–4 taps | Preset discount keys | P2 |
| **Cashier** | Close shift | Shifts → closeout form + variance ack | Guided closeout hero | 5–7 clicks | Single closeout wizard | P1 |
| **Manager** | Fix stuck order | Order hub attention strip → row action | Today strip → hub row | 3–5 clicks | Smart alert → deep link | sustain |
| **Manager** | Approve variance | Shift close → ack form | Push notification → approve | Manual discovery | Manager alert | P1 |
| **Manager** | Override POS | Permission exists; UI scattered | Terminal manager PIN flow | Inconsistent | Unified override modal | P2 |
| **Server** | Open table | POS tables preview | Floor plan tap | Preview only | Table beta path | P2 |
| **Server** | Fire kitchen | Handheld preview | Handheld → send | Preview | Finish handheld E2E | P3 |
| **Server** | Split check | Not production-ready | Seat split UI | Missing | Table service roadmap | P2 |
| **Bartender** | Open tab | POS tabs preview | Tab screen | Preview | Rush tab UI | P3 |
| **Bartender** | Close tab | Tab close action | One-screen settle | 3–5 clicks | Tab speed layout | P3 |
| **Kitchen staff** | See queue | KDS daily → queue strip Era 18 | Login → **KDS** landing | 1–2 clicks | Sustain | sustain |
| **Kitchen staff** | Bump oldest | Bump-next hero Era 18 | Single hero CTA | 1 click | Sustain + haptic | sustain |
| **Kitchen staff** | Recall ticket | Recall-next hero | Same | 1–2 clicks | Sustain | sustain |
| **Expo** | Prioritize tickets | KDS attention strip allergen/overdue | Auto-sorted expo column | Manual scan | Smart KDS priority | P1 |
| **Packer** | Find pack task | Packing command center + strip | Login → packing queue | 2–3 clicks | Packer landing | P2 |
| **Packer** | Verify order | Packing verify console + row actions | Scan → verify | Manual | Scanner integration | P2 |
| **Delivery coord.** | Plan routes | Routes dashboard beta | Order hub filter → routes | Disconnected | Fulfillment center | P2 |
| **Marketer** | Build segment | CRM → segments | Segment builder | 4–6 clicks | Template segments | P2 |
| **Marketer** | Launch campaign | Growth preview | — | Preview broken | Defer or hide | P3 |
| **Accountant** | Export payroll | Staff payroll → export | Scheduled export | Preview limits | Certify export | P3 |
| **Accountant** | Margin report | Reports → financial | Briefing → margin | 4+ clicks | Margin spot-check link | P2 |
| **Support admin** | Impersonate tenant | Platform support → session | Session → workspace go-live link Era 18 | Improved Cycle 54–56 | Sustain deep links | sustain |
| **Enterprise admin** | Configure SSO | Settings SSO wizard Era 18 | Wizard + IdP test inline | IdP proof external | Inline proof status | **P0** |

---

## Role Summaries

### Owner (top 10 daily tasks)
1. Today ops snapshot · 2. Order exceptions · 3. Integration health · 4. Go-live/pilot status · 5. Staff issues · 6. Margin glance · 7. Storefront orders · 8. Inventory alerts · 9. Billing · 10. Support tickets

**Friction:** Dispersed across Today, go-live, integration health, order hub, reports. **Ideal:** Single **Owner Daily Briefing** with prioritized actions (Era 18 strips are precursors).

### Cashier (top 10)
Shift open, ring sale, modifiers, discounts, payments, receipts, void/refund (manager), shift close, loyalty lookup, gift card

**Friction:** Closeout still multi-step. **Era 18 win:** default landing to POS terminal.

### Manager (top 10)
Stuck orders, shift variance, discounts override, labor glance, KDS backlog, integration failures, go-live blockers, inventory counts, customer issues, reports export

**Friction:** Must know which hub to open. **Era 18 win:** order hub + Today attention strips.

### Kitchen / Expo (top 10)
View queue, bump, recall, allergen tickets, station filter, production board items, calendar today view, communicate delays, waste log, training SOP

**Friction:** Realtime expectations vs 15s poll fallback. **Era 18 win:** bump-next/recall-next heroes, queue clarity strip.

---

## Top 10 UX Breakthroughs (Recommended)

1. **Owner Daily Briefing** — single prioritized command center  
2. **Restaurant Launch Wizard** — hour-scale TTV for pilots  
3. **Cashier Speed Mode** — fullscreen minimal POS chrome  
4. **Smart Manager Alerts** — push/email for variance, stuck orders, integration down  
5. **Integration Fix Flow** — health center with guided remediation  
6. **Go-live Progress Ring** (started Era 18 Cycle 60) — extend to full wizard  
7. **Table Service Floor Plan** — TouchBistro-competitive beta  
8. **KDS Smart Priority Column** — allergen + SLA sorting  
9. **Packer Scan-First Console** — barcode-driven verify  
10. **Enterprise SSO Inline Proof** — test login from admin wizard  

---

## Required UI Components (Net-New)

| Component | Roles | Backend Needs | Priority |
|-----------|-------|---------------|----------|
| `OwnerDailyBriefingPanel` | owner, manager | Aggregator service: orders, KDS, integrations, go-live, metrics | **P0** |
| `LaunchWizardShell` | owner, implementation | Template apply + go-live project bootstrap | **P0** |
| `CashierSpeedModeLayout` | cashier | POS terminal layout flag | P1 |
| `ManagerAlertFeed` | manager | Alert rules engine (variance, stuck, webhook fail) | P1 |
| `IntegrationRemediationCard` | owner, ops | Live smoke status + fix steps | P1 |
| `FloorPlanCanvas` | server, manager | Table service state machine | P2 |
| `KdsPriorityColumn` | expo, kitchen | Ticket scoring service | P1 |
| `PilotSetupWizard` | owner, GTM | GO/NO-GO evaluator integration | **P0** |

---

## Competitor UX Benchmark

| Dimension | Toast/Square | OS Kitchen Today | Gap |
|-----------|--------------|-----------------|-----|
| Owner first-day setup | Hours (Square faster) | Days (nav complexity) | Launch wizard |
| Cashier sale taps | 2–3 optimized | 3–5 acceptable | Speed mode |
| Kitchen bump | Hardware-integrated expo | Software qualified | Smart priority |
| Manager mobile | Strong apps | Browser tablet UX Era 17 | Native optional P3 |
| Enterprise SSO setup | Okta wizard | Admin wizard UX good; proof missing | IdP PASS |

---

## UX Redesign Areas (Full Redesign — Not More Strips)

1. **Owner onboarding IA** — reduce default nav visible items by 40%  
2. **Today page** — evolve from focus mode to **Briefing**  
3. **Go-live** — wizard shell vs scattered project pages  
4. **Integrations hub** — single health center vs 5 dashboards  
5. **Reports** — role-based report packs vs full tree  
6. **Growth/marketing** — hide preview until beta or consolidate  
7. **Platform support** — sustain Era 18 deep links; add briefing for support admins  

**Stop doing:** Adding row-level next-action columns without measuring task-time reduction.
