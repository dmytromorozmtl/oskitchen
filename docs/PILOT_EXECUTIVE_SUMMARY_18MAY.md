# KitchenOS Pilot Readiness — Executive Summary

**Date:** 18 May 2026  
**Engineering status:** **READY FOR STAGING** · **READY FOR PILOT** after ops checklist (3–5 operators)  
**Target pilot segment:** Meal-prep and preorder operators (white-glove onboarding)

---

## What KitchenOS is

KitchenOS is a B2B platform for food operators: branded storefront preorders, kitchen production, packing, and delivery coordination, with optional WooCommerce/Shopify import (beta). One system replaces spreadsheets plus disconnected tools for order-to-kitchen flow.

---

## Readiness snapshot

| Dimension | Score | Notes |
|-----------|-------|-------|
| Code quality & CI gates | **92%** | typecheck, lint, 604 tests, build verified after `npm ci` |
| Security (static) | **88%** | Cron gate, tenancy helpers, CSRF/DSR, secrets scan clean |
| Infrastructure | **70%** | Staging deploy + Upstash + backfill pending ops |
| Sales-safe surface | **85%** | Capability sign-off doc + pilot nav profile |

---

## What we CAN sell (pilot)

- Online POS (cash + external terminal; **not** offline)
- Native storefront with Stripe checkout (when configured)
- Order → production → packing workflow
- Basic reporting and Today command center
- WooCommerce import (**beta**, per-tenant setup)

Source: `docs/CAPABILITY_SIGNOFF_SALES.md`

---

## What we must NOT sell yet

- Offline POS, Stripe Terminal hardware
- Uber Eats / DoorDash native integrations
- SMS notifications
- Enterprise SSO / SCIM
- SOC 2 attestation as “certified”
- Unlimited scale without monitoring

---

## Key risks (managed)

1. **Load testing** — not run at 100 concurrent operators; mitigated by monitoring + caps on aggregations.
2. **Integrations** — Woo/Shopify need per-tenant certification.
3. **Support** — run golden-path rehearsal before first paying customer.
4. **Distributed rate limits** — require Upstash before broad rollout.

---

## Timeline (suggested)

| Week | Milestone |
|------|-----------|
| W0 | Staging deploy, backfill, E2E pilot, Upstash |
| W1 | 1–2 design partners, daily monitoring |
| W2–3 | Expand to 3–5 paid pilots |
| W4 | Go/no-go for wider paid cohort |

---

## Budget placeholders (ops to fill)

| Item | Estimate |
|------|----------|
| Vercel Pro (cron + serverless) | TBD / 100 operators |
| Supabase (pool + storage) | TBD |
| Upstash Redis | TBD |
| Stripe fees | 2.9% + $0.30 per card charge |
| Support capacity | TBD hrs/week |

---

## Engineering artifacts

- `docs/PILOT_STAGING_RUNBOOK.md` — deploy steps
- `docs/PILOT_READINESS_18MAY.md` — technical readiness
- `docs/PILOT_KNOWN_ISSUES.md` — non-blockers
- `docs/CTO_FIXES_APPLIED.md` — full change log
- `bash scripts/ops/pilot-preflight.sh` — pre-deploy gate
