# Engineering video walkthrough — repository tour

**Purpose:** Record once; onboard hire #2, advisors, and future contractors without live founder narration  
**Duration:** **35–40 minutes** (internal — not for marketing)  
**Policy:** `bus-factor-mitigation-absolute-final-v1`  
**Companion:** [`demo-video-script-today.md`](./demo-video-script-today.md) (90s **sales** demo — different audience)

---

## Recording setup

| # | Item |
|---|------|
| 1 | 1920×1080 screen capture + system audio |
| 2 | Staging workspace logged in (not production secrets on screen) |
| 3 | IDE: VS Code / Cursor with repo root visible |
| 4 | Terminal font ≥ 14px; hide `.env.local` values |
| 5 | Upload to private drive / Loom; link in onboarding doc only |

**Filename suggestion:** `os-kitchen-engineering-walkthrough-YYYY-MM.mp4`

---

## Chapter map

| Chapter | Time | Topic |
|---------|------|-------|
| 1 | 0:00–5:00 | Repository map + monolith rationale |
| 2 | 5:00–10:00 | App Router, dashboard shell, tenant layout |
| 3 | 10:00–15:00 | Server Actions, services, Prisma |
| 4 | 15:00–20:00 | API routes, webhooks, cron |
| 5 | 20:00–25:00 | CI matrix + local dev commands |
| 6 | 25:00–30:00 | Deploy path (staging only) |
| 7 | 30:00–35:00 | Incidents, runbooks, on-call reality |
| 8 | 35:00–40:00 | ADRs, bus factor, next steps for hire #2 |

---

## Chapter 1 — Repository map (0:00–5:00)

**Show:** Top-level folders in IDE.

**Narration outline:**

- `app/` — Next.js App Router; 600+ dashboard routes under `app/dashboard/`
- `components/` — UI; `components/ui/` = shadcn primitives
- `actions/` + `services/` — mutations and business logic (ADR 0001)
- `lib/` — shared utilities, design policies, compliance
- `prisma/` — schema; 399 models — always scope by `workspaceId`
- `docs/` — runbooks, ADRs, GTM; **start here when stuck**
- `tests/` + `e2e/` — Vitest + Playwright

**Point to:** [`docs/adr/0001-monolith-nextjs-server-actions.md`](./adr/0001-monolith-nextjs-server-actions.md)

---

## Chapter 2 — Dashboard shell (5:00–10:00)

**Show:** Browser `/dashboard/today` + `components/dashboard/dashboard-shell.tsx`.

- Skip link + main landmark (a11y)
- Navigation IA — FOH/BOH groupings
- `dashboard-layout-content.tsx` — auth, billing, module gates
- Theme toggle + offline indicator

---

## Chapter 3 — Data layer (10:00–15:00)

**Show:** Trace one flow — e.g. order create.

- `requireTenantActor()` / workspace scoping
- Service file in `services/orders/`
- Prisma query with `workspaceId` in `where`
- ESLint `kitchenos/require-owner-scope`

**Point to:** ADR 0002 tenant workspace scoping.

---

## Chapter 4 — Integrations (15:00–20:00)

**Show:** `app/api/webhooks/` sample + Integration Health UI.

- INLINE webhook processing (ADR 0003)
- Rate limiting on mutations
- Cron routes vs production allowlist (ADR 0005)
- Supabase stack (ADR 0004)

---

## Chapter 5 — CI (20:00–25:00)

**Show:** Terminal + `.github/workflows/` (high level).

```bash
npm run lint
npm run typecheck
npm test
npm run test:ci:governance-bundles
```

- Reference [`ci-e2e-tier-matrix.md`](./ci-e2e-tier-matrix.md)
- Forbidden claims CI — sales copy safety

---

## Chapter 6 — Deploy path (25:00–30:00)

**Show:** [`migration-deployment-process.md`](./migration-deployment-process.md) — **staging only**.

- Prisma migrate deploy
- Vercel preview vs production
- Rollback: Vercel instant rollback — not git revert alone
- **Bus factor honesty:** production deploy founder-approved until onboarding complete

---

## Chapter 7 — Incidents (30:00–35:00)

**Show:** Runbook index + `/api/health`.

- Sev-1/2/3 definitions [`incident-response-process.md`](./incident-response-process.md)
- Webhook + cron runbooks
- On-call = founder today; backup plan in [`bus-factor-mitigation.md`](./bus-factor-mitigation.md)

---

## Chapter 8 — Close (35:00–40:00)

**Narration outline:**

- Read `docs/engineering-onboarding.md` — your 2-week checklist
- ADR folder — propose ADR before big architectural changes
- Bus factor target: **2** by Q4 2026
- Questions → `#engineering` or founder direct

---

## Post-recording checklist

| # | Action |
|---|--------|
| 1 | Store video link in password manager / Notion (not public URL) |
| 2 | Update [`bus-factor-mitigation.md`](./bus-factor-mitigation.md) scorecard — video recorded |
| 3 | Add link to [`engineering-onboarding.md`](./engineering-onboarding.md) Day 1 |
| 4 | Optional: 90s excerpt for sales — use [`demo-video-script-today.md`](./demo-video-script-today.md) instead |

---

## Human gate

- **Do not** publish this walkthrough on YouTube or Product Hunt
- **Do not** show production env vars or customer PII
- Blur API keys if terminal visible
