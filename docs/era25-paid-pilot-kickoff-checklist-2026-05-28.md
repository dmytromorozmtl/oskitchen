# era25 Paid Pilot Kickoff Checklist

**Status:** **BLOCKED until GO decision + human sign-off**

**Policy:** `era25-paid-pilot-go-convergence-v1` · Backlog `KOS-E25-002-PILOT-GO`  
**Date:** 2026-05-28

---

## Purpose

Human kickoff checklist after honest `decision: GO` in `artifacts/pilot-gono-go-summary.json`. **Never fake GO.**

---

## Pre-requisites (automated checks)

| Check | Command / artifact |
|-------|-------------------|
| Breakthrough ready | `npm run ops:validate-owner-daily-briefing-breakthrough-era25 -- --json` |
| GO evaluator | `npm run smoke:pilot-gono-go` |
| Forbidden claims | `npm run smoke:pilot-forbidden-claims-enforcement` |
| ICP qualified | `PILOT_ICP_*` env + artifact |
| LOI recorded | `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` |

---

## Rollback / NO-GO

- Any GO/NO-GO regression → **NO-GO** — re-run evaluator
- Forbidden claims FAIL → block contract cutover
- P0 proof regression → halt kickoff

---

## Leadership sign-off

- [ ] GO artifact reviewed (`artifacts/pilot-gono-go-summary.json`)
- [ ] ICP fit confirmed by sales lead
- [ ] Support capacity confirmed for week 1
- [ ] Kickoff date scheduled

**Sign-off:** _pending — human required_

---

## CI cert chain

```bash
npm run test:ci:paid-pilot-go-convergence-era25
npm run test:ci:paid-pilot-go-convergence-era25:cert
npm run test:ci:commercial-pilot-runbook:cert
```
