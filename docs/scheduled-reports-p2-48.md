# Scheduled reports — Lightspeed parity (P2-48)

**Policy:** `scheduled-reports-p2-48-v1`  
**Department:** Analytics  
**Registry:** [`artifacts/scheduled-reports-p2-48-registry.json`](../artifacts/scheduled-reports-p2-48-registry.json)

---

## Lightspeed parity scope

Weekly **email PDF** digest for executive summary — operator inbox every Monday.

| Step | Source |
|------|--------|
| **Resolve weekly window** | Prior 7 UTC days ending today |
| **Run executive summary** | `executive_weekly_summary` report runner |
| **Generate PDF attachment** | jsPDF + autoTable server-side |
| **Email weekly digest** | Resend with PDF attachment + dedupe |

> **Lightspeed parity** — scheduled weekly report email. **BETA** directional reporting — **not audited** GL or tax reporting.

---

## Routes

- **Reports hub panel:** [`/dashboard/reports`](/dashboard/reports)
- **Cron:** `/api/cron/scheduled-reports-weekly` — Mondays 07:00 UTC

---

## Audit

```bash
npm run audit:scheduled-reports-p2-48
npm run check:scheduled-reports-p2-48
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Scheduled reports P2-48 audit step.
