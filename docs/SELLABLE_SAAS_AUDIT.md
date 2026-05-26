# KitchenOS — Sellable SaaS product audit

Audience: founders, sales, and engineering preparing demos through first paid customers.  
Date: May 2026. Scope: product experience vs launch readiness (not a security code review — see `SECURITY_REVIEW.md`).

Legend: **P0** launch blocker · **P1** important · **P2** nice-to-have.

---

## Landing page (`/`)

| Area | Works | Unfinished / weak | Blocks customers? | Fix | Priority |
|------|--------|-------------------|-------------------|-----|----------|
| Hero & CTAs | Premium layout, demo link, trial CTA | Industry sections could mirror `/solutions/*` inline | No | Add “Solutions” dropdown to header linking to vertical pages | P2 |
| Social proof | Testimonials block | Real logos/case studies missing | Trust on enterprise | Ship 2–3 beta quotes or anonymized metrics | P1 |
| Pricing | Pricing section present | Plan limits vs in-app gates must stay aligned | Confusion at checkout | Single source of truth in `lib/plans` + copy review | P1 |

---

## Signup / login

| Area | Works | Unfinished | Blocks? | Fix | Pri |
|------|--------|------------|---------|-----|-----|
| Auth | Supabase email/password | No SSO | Mid-market | Post-launch SAML/OAuth | P2 |
| Redirects | `redirect` query safe-internal path after login/signup | Marketing links must pass param | Broken deep links | Document `?redirect=/demo/meal-prep` for campaigns | P1 |
| Onboarding trap | New users get `onboardingCompleted: false` | — | No | — | — |

---

## Onboarding (`/onboarding`)

| Area | Works | Unfinished | Blocks? | Fix | Pri |
|------|--------|------------|---------|-----|-----|
| Wizard | Multi-step, progress, demo import | Some steps still “thin” vs PRD (channel wizards) | Partial | Deep-link steps from dashboard checklist | P1 |
| Resume | Server saves step | Reopen from Settings | No | Done | — |
| Skip | Optional skips | — | No | — | — |

---

## Dashboard home (`/dashboard`)

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| KPI-style snapshot, attention panel, quick actions | Live “failed webhooks” depth vs hub | No | Wire counts to webhook/integration health | P1 |
| Charts | Trend chart | More owner KPIs | No | Revenue/channel widgets | P2 |

---

## Order hub

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Internal + incoming tables; empty state | Grouping, drawer, timeline, bulk actions per PRD | Ops at scale | Phase 8 scope | P1 |
| Copy | Renamed to incoming-channel framing | — | No | — | — |

---

## Integrations / sales channels

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Hub + Woo/Shopify/Uber pages; encrypted credentials | Full multi-step wizards + import preview | Self-serve clarity | Phase 6 | P1 |
| Webhooks log | Empty state + table | Replay UI | Power users | Replay + filters | P1 |

---

## Menus / menu items

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Menu board DnD; menu-item manager | Empty states polished | No | Channel publish UX | P2 |

---

## Kitchen production

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Table + kitchen screen entry | Board views, stations, allergen callouts | Dense kitchens | Phase 9 | P1 |

---

## Packing & labels

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| PDF/CSV paths | QR/thermal presets, verify UX | Fulfillment teams | Phase 10 | P1 |

---

## Customers (CRM)

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Aggregate list | Detail drawer, tags, allergies | Sales workflows | Phase 13 | P2 |

---

## Analytics

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| DB-backed counters + empty state | Charts + deterministic insights | Owner trust | Phase 11 | P1 |

---

## Inventory lite

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| If module exists in branch | Demand forecast PRD | — | Phase 12 | P2 |

---

## Billing

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Plan display + Stripe hooks | Usage meters in-app | Trial conversion | Usage bars + emails | P1 |

---

## Settings

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Kitchen fields + guided setup card | Tabbed Business/Ops/Security/Developer | Founders | Phase 15 | P1 |

---

## Mobile

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Responsive shell + tables | Touch targets on production/packing | Floor staff | Larger tap targets | P1 |

---

## Error handling / empty states

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| `EmptyState` component; `lib/error-messages` started | Consistent use + toast copy audit | Confusion | Sweep remaining pages | P1 |

---

## Performance

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Build passes | jspdf on packing route heavy | Slow mobile | Dynamic import PDF | P1 |

---

## Security (summary)

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Encrypted integration secrets; middleware auth | Formal checklist | Compliance narrative | `SECURITY_REVIEW.md` | P1 |

---

## Demo mode

| Works | Gaps | Blocks? | Fix | Pri |
|-------|------|---------|-----|-----|
| Seeded workspace per vertical; banner; no keys | Explicit “exit demo” education | Mixing data fear | Banner copy + reset docs | P1 |

---

### Top launch blockers (P0)

1. **Migrate + generate**: production deploy must run `prisma migrate deploy` + `prisma generate` so onboarding/demo fields exist.
2. **Real integrations**: never label simulated connections as “live verified” without successful test connection.
3. **Environment**: Supabase + DB + optional Stripe/Resend documented for Vercel.

### Next waves (P1)

Order hub operational depth, integration wizards, analytics charts, settings tabs, performance (dynamic PDF).
