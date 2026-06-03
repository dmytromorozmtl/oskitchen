# Native Mobile Deferral RFC

**Status:** **DEFERRED** — no native iOS/Android app through pilot  
**Decision date:** 2026-06-01  
**Audience:** Product, Engineering, Sales, Founder  
**Related:** [`native-mobile-app-plan.md`](./native-mobile-app-plan.md) (RN + white-label + push roadmap) · [`MOBILE_OPS_EXPERIENCE.md`](./MOBILE_OPS_EXPERIENCE.md) · [`investor-narrative-hold.md`](./investor-narrative-hold.md) · [`pen-test-plan.md`](./pen-test-plan.md)

---

## Executive decision

| Scope | Verdict | Rationale |
|-------|---------|-----------|
| **Native iOS app (App Store)** | **DEFER** | Pilot ICP runs on browsers/tablets; no App Review cycle blocker |
| **Native Android app (Play Store)** | **DEFER** | Same — web-first ops on existing hardware |
| **React Native / Expo monorepo** | **DEFER** | Duplicates PWA surfaces; splits engineering focus from P0 vault proof |
| **Responsive web + PWA** | **GO (maintain)** | Handheld POS, KDS tablet, driver routes — shipped |
| **Sales claim “native mobile app”** | **NO-GO** | Competitor tracker + maturity honesty |

**One-line:** OS Kitchen is **web-first on devices you already own** — not a downloadable native app in 2026 pilot scope.

---

## Context (June 2026)

| Signal | State |
|--------|-------|
| PWA manifest | `public/manifest.webmanifest` — standalone, shortcuts (handheld waiter) |
| Service worker | `public/sw.js` — installable shell |
| Handheld POS | `/dashboard/pos/handheld` |
| KDS tablet | `/dashboard/kitchen/tablet`, `/kds` |
| Driver mode | `/driver`, `/dashboard/routes/driver` |
| Offline POS queue | Expanded server-side queue — **not** native offline SDK |
| Pilot GO/NO-GO | **NO-GO** — mobile narrative secondary to vault + channel proof |
| Competitor gap | Toast/Square ship native apps — **acknowledged, not parity target for pilot** |

Existing product doc [`MOBILE_OPS_EXPERIENCE.md`](./MOBILE_OPS_EXPERIENCE.md) already states: *“Responsive layouts + PWA considerations; **no second app** required for MVP.”* This RFC **formalizes deferral** and sales boundaries.

---

## Options considered

### A — Build React Native app before pilot

**Rejected.** Engineering bandwidth must finish P0 staging proof, cross-channel live smoke, and first paid pilot. Native apps add App Store review, push notification infrastructure, and duplicate auth/session surfaces.

### B — White-label wrapper (Capacitor / WebView shell)

**Rejected for pilot.** Adds store submission and crash analytics without meaningful UX gain over installed PWA on kitchen tablets. Revisit only if a **signed enterprise deal** requires App Store presence.

### C — Web-first + PWA; defer native (selected)

**Accepted.** Matches ICP ($500K–$3M operators on iPads and Android tablets in browser). Aligns with “no proprietary hardware” positioning.

---

## What ships today (evidence)

| Surface | Route / asset | Maturity | Sales safe? |
|---------|---------------|----------|-------------|
| Installable PWA | `manifest.webmanifest`, `sw.js` | BETA | **YES** with “web app / PWA” wording |
| Handheld waiter | `/dashboard/pos/handheld` | BETA | **YES** — browser on phone/tablet |
| KDS fullscreen | `/kds`, kitchen tablet routes | BETA | **YES** — not “rush-hour certified” |
| Driver manifest | `/driver` | PARTIAL | **YES** with scope caveats |
| Stripe Terminal | Web SDK + optional reader | BETA | **YES** when configured — not native SDK claim |
| Push notifications (native) | — | **Not shipped** | **NO** |
| App Store / Play listing | — | **Not shipped** | **NO** |

---

## Pilot ICP guidance

| Operator ask | Response |
|--------------|----------|
| “Do you have an iPhone app?” | “We run in Safari/Chrome — add to Home Screen for a full-screen experience. No App Store download required.” |
| “We need offline on the line” | “POS offline queue is **partial+** — staging E2E in progress; not native offline card processing.” |
| “Drivers need a mobile app” | “Driver mode is web-based today; native driver app is on the roadmap after pilot metrics.” |
| “Enterprise requires MDM-managed app” | **Disqualify or defer** until Capacitor/enterprise wrapper RFC (post-pilot). |

---

## Revisit triggers (when to reopen native)

All **not** required for pilot; any **two** of below for **CONDITIONAL GO** on native exploration:

1. **Paid pilot LOI** explicitly names “App Store app required” (≥ 2 queued design partners)
2. **Pilot Week 4** PWA adoption metrics — &lt; 50% tablet install rate despite CS training
3. **Enterprise procurement** MDM / app-store mandate on signed deal &gt; $100k ARR
4. **P0 + Tier 2 proof PASS** — vault and staging stable (no split focus during proof)
5. **Pen test PASS** on web surfaces — native would reset security scope

**Target revisit:** Q4 2026 product steering or first enterprise MDM requirement — whichever comes first.

---

## Phase preview (if reopened)

| Phase | Deliverable | Exit |
|-------|-------------|------|
| 0 — RFC spike | Capacitor vs RN vs PWA-only decision doc | Founder sign-off |
| 1 — Shell | Auth + KDS read-only in store wrapper | TestFlight / internal track |
| 2 — Handheld POS | Parity with `/dashboard/pos/handheld` | Pilot operator sign-off |
| 3 — Push | Order-ready notifications (FCM/APNs) | Opt-in + consent policy |

**Not in scope even post-reopen:** Full offline SQLite sync, native Square/Toast SDK parity, drive-thru timer native module.

---

## Safe sales / marketing wording

**Allowed:**

- “Runs on iPads, Android tablets, and phones you already own — no extra hardware lease”
- “Install from the browser (PWA) for a full-screen kitchen experience”
- “Handheld POS in mobile browser”

**Not allowed:**

- “Download our iOS/Android app”
- “Native mobile app in the App Store / Play Store”
- “Offline-native POS like Toast”
- “Mobile app with push notifications” (until shipped)

Enforced via `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` and [`investor-narrative-hold.md`](./investor-narrative-hold.md).

---

## Engineering guardrails

| Rule | Detail |
|------|--------|
| No `ios/` or `android/` directories in pilot | Avoid accidental scope creep |
| PWA changes OK | Manifest, SW, responsive layouts for KDS/handheld |
| Public API mobile SDK | **Defer** — document REST only |
| Pen test scope | Native apps **out of scope** per [`pen-test-plan.md`](./pen-test-plan.md) |
| Nav maturity | Do not label mobile routes as `LIVE` unless pilot-proven |

---

## Registry & tracker

| Artifact | Value |
|----------|-------|
| `artifacts/competitor-feature-tracker.json` | Native handheld → competitor advantage; OS Kitchen = PWA BETA |
| Feature maturity matrix | `native_mobile: not_implemented` |
| Investor deck | Hold — see [`investor-narrative-hold.md`](./investor-narrative-hold.md) |

---

## Decision log

| Date | Decision | Approver |
|------|----------|----------|
| 2026-05-26 | MOBILE_OPS: no second app for MVP | Product |
| 2026-06-01 | **Formal DEFER native iOS/Android through pilot** | 30-action executor / Product |

---

## References

- Mobile ops strategy: [`MOBILE_OPS_EXPERIENCE.md`](./MOBILE_OPS_EXPERIENCE.md)
- KDS / tablet: [`MOBILE_KDS_DRIVER_MODES.md`](./MOBILE_KDS_DRIVER_MODES.md)
- PWA session notes: [`SESSION_31_PWA_KDS_AI.md`](./SESSION_31_PWA_KDS_AI.md)
- Handheld POS: `/dashboard/pos/handheld`
- June defer list: [`fullreport1june.md`](./fullreport1june.md) § explicit deferrals
