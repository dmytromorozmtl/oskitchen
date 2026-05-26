# Beta applications — module audit

## Executive summary

KitchenOS previously exposed a **founder-only table** over `beta_applications` while the public `/beta` form wrote **`beta_leads`** via `submitBetaApplication`. That split meant the dashboard often looked empty despite healthy inbound. This release **unifies the command center on `beta_leads`**, extends the schema for a full beta-program lifecycle, and documents the legacy table.

---

## 1. Public `/beta` form

| Item | Current (after change) | Limitation | Risk | Growth impact | Recommendation | Priority |
|------|-------------------------|--------------|------|---------------|----------------|----------|
| UX | Premium hero, FAQ, progressive tabs, autosave draft | No server-side autosync | P2 onboarding friction | Better completion | Add optional account handoff later | P2 |
| UTM capture | Hidden fields from `?utm_*` query | Cookie bridge not implemented | P2 attribution gaps | Cleaner CAC reporting | Add `kos_utm` cookie mirroring Growth | P2 |
| Validation | Zod server-side | Client-side light | P1 typos | Minor support load | Mirror critical checks client-side | P2 |

---

## 2. Database

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Canonical row | `BetaLead` | Legacy `beta_applications` unused | Launch confusion | False empty inbox | Document + optional ETL | P1 |
| Pipeline | `program_stage` enum | Needs migration | P0 crash without migrate | Blocks ops | `prisma migrate deploy` | P0 |
| Cohort / invite / feedback | New tables | Empty until used | None | Feature completeness | Seed cohorts (auto) | P1 |

---

## 3. Anti-spam & abuse

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Honeypot | `website_hp` | Bots can adapt | Launch spam | Noise in CRM | Add Turnstile when traffic spikes | P2 |
| Duplicate | 2h dedupe by email | Collides with legit retries | P2 UX | Minor | Soft-merge UI in CRM | P3 |
| Rate limit | 8 / 24h per email | IP-based missing | P1 DDoS | Volume abuse | Edge rate limiter | P1 |

---

## 4. Permissions

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Dashboard | Same gate as Growth (`canAccessGrowthModule`) | Staff without GTM cannot see | Correct | Protects data | Keep | P0 |
| Nav / route gate | `gtmSurfaceAccess` extends staff allow-list | Must stay aligned with Growth | Misconfig | Leak | Centralize in growth-permissions | P1 |
| Superadmin | `workspace.moroz@gmail.com` bootstrap | N/A | N/A | Full visibility | Keep | P0 |

---

## 5. Scoring & analytics

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Fit score | Heuristic 0–100 | Not ML | P2 precision | Ranking quality | Optional model later | P2 |
| Dashboard charts | Snapshot on load | Not real-time | P3 | Founder perception | Add streaming later | P3 |
| Geography heatmap | Country field only | No lat/long | P2 | Geo strategy | Add structured region picker | P2 |

---

## 6. Founder workflow

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Kanban | Stage columns + select | No drag-drop yet | P3 UX | Slower triage | Add `@dnd-kit` lane moves | P2 |
| Email | Resend raw templates | No template studio | P2 brand | Ops polish | HTML templates + preview | P2 |
| CRM link | Links to Growth leads | No bidirectional deep link IDs | P2 | Context switching | Add shared “GTM profile” id | P2 |

---

## 7. Conversion tracking

| Item | Current | Limitation | Risk | Impact | Recommendation | Priority |
|------|---------|------------|------|--------|----------------|----------|
| Funnel | Stage-based aggregates | No product telemetry tie-in | P1 | Cannot prove activation | Wire `usage_events` + workspace link | P1 |
| Paid conversion | `CONVERTED` stage manual | No Stripe hook | P1 revenue truth | ARR reporting gap | Automate on subscription create | P1 |

---

## Priority legend

- **P0** — launch critical (permissions, migration, no crash)
- **P1** — onboarding / revenue truth
- **P2** — analytics & automation depth
- **P3** — UX polish
