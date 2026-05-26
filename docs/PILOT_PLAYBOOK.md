# KitchenOS — Pilot Playbook

**Version:** 1.0 · **Date:** 19 May 2026  
**Production:** https://os-kitchen.com

Operational rhythm for the paid pilot. Strategy docs: [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md), [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md).

---

## Daily (~5 min)

- [ ] `bash scripts/ops/pilot-dashboard.sh`
- [ ] Sentry — new errors since yesterday
- [ ] Vercel — failed deployments or rollbacks
- [ ] Stripe — failed payments / past_due subscriptions
- [ ] If health degraded — see [Emergency](#emergency)

---

## Weekly (~30 min, Monday)

- [ ] `bash scripts/ops/weekly-pilot-report.sh` → edit `docs/pilot-reports/week-*.md`
- [ ] Team review of report (15 min)
- [ ] Operator check-ins for anyone at risk (activation &lt; 3 or support ticket)
- [ ] `bash scripts/ops/pilot-ready-check.sh` if deploy went out that week

---

## Monthly (~2 hours)

- [ ] Aggregate [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md) → insights doc
- [ ] Roadmap vs [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md) — adjust Q2/Q3 priorities
- [ ] Update [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md) if `capability-matrix.ts` changed
- [ ] NPS pulse to all active operators
- [ ] Review pilot metrics (activation, WAU, churn) against GA gates

---

## Quarterly

- [ ] Full roadmap review (CPO + eng)
- [ ] GA gate assessment ([PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md#pilot-success-metrics))
- [ ] Budget / headcount for H2
- [ ] Team retro

---

## Automation

| What | How |
|------|-----|
| Daily health (08:00 UTC) | Vercel Cron → `/api/cron/pilot-daily-health` |
| Daily ops dashboard | `bash scripts/ops/pilot-dashboard.sh` |
| Weekly report file | `bash scripts/ops/weekly-pilot-report.sh` |
| Pre-invite / post-deploy | `bash scripts/ops/pilot-ready-check.sh` |
| HTTP smoke | `bash scripts/ops/quick-acceptance.sh` |

Cron is on the production allowlist (`services/cron/production-manifest.ts`). Requires `CRON_SECRET` in Vercel.

---

## Emergency

| Symptom | First steps |
|---------|-------------|
| Health `degraded` | Vercel logs → Supabase status → DB connection string |
| Payment failures | Stripe Dashboard → customer → retry invoice |
| Cron failures | Vercel → Cron Jobs → logs for slug; verify `CRON_SECRET` |
| Auth / wrong redirect host | Supabase → Auth → URL config → Site URL = `https://os-kitchen.com` |
| Data inconsistency | Supabase SQL Editor; compare with Prisma models |

**Escalation order:** on-call eng → product → CEO for SEV-1 affecting all operators.

---

## Contacts (fill in)

| Role | Name | Channel |
|------|------|---------|
| Engineering | _[name]_ | _[email / Slack]_ |
| Support | _[email]_ | In-app + email |
| Ops | _[name]_ | |
| Product (CPO) | _[name]_ | |
| CEO | _[name]_ | |

---

## Document index

| Doc | Use |
|-----|-----|
| [PILOT_PLAYBOOK.md](PILOT_PLAYBOOK.md) | This file — daily/weekly rhythm |
| [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md) | 6-month strategy |
| [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md) | Honest sales claims |
| [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md) | Operator interviews |
| [ACCEPTANCE_VERDICT_19MAY.md](ACCEPTANCE_VERDICT_19MAY.md) | Technical acceptance |
| `docs/pilot-reports/` | Weekly reports |

---

## Quick commands

```bash
bash scripts/ops/pilot-dashboard.sh
bash scripts/ops/weekly-pilot-report.sh
bash scripts/ops/pilot-ready-check.sh
bash scripts/ops/quick-acceptance.sh
npm run vercel:crons:production   # after changing production-manifest
```
