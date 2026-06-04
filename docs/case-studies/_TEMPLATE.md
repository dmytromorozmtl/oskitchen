# Case study draft — [slug]

**Status:** Internal draft only — do not publish  
**Policy:** `case-study-template-mkt11-v1`  
**Canonical guide:** [`../case-study-template.md`](../case-study-template.md)  
**Permission:** ☐ named signed ☐ anonymized signed ☐ pending

Copy this file to `docs/case-studies/<slug>-draft.md` and replace every `[TBD]`.

---

## Header block

| Field | Value |
|-------|-------|
| **Title** | [TBD] |
| **Subtitle** | [TBD] |
| **Customer** | [Legal name] OR **Anonymized** ([segment], [region]) |
| **Pilot dates** | [Start] – [End or ongoing] |
| **Author / reviewer** | [GTM] · [CS] · [Legal date] |

---

### 1 — At a glance (hero stats)

| Stat | Value | Source |
|------|-------|--------|
| Orders/day (pilot week) | [TBD] | `pilot-metrics-baseline` |
| Median bump time | [TBD] min | KDS telemetry / pilot checklist |
| Integration health score | [TBD]/100 | Integration Health export |
| Time to first live order | [TBD] | Launch Wizard / onboarding log |

---

### 2 — Customer profile

**Segment:** ☐ Meal prep ☐ Ghost kitchen ☐ Weekly preorder ☐ Catering ☐ Café / QSR  
**ICP fit:** ☐ $500K–$3M revenue ☐ 1–3 locations  
**Location:** [TBD] or **Withheld (anonymized)**  
**Team size:** [TBD]  
**Channels before pilot:** [TBD]  
**Plan:** Starter | Pro | Team

---

### 3 — The challenge (Before)

[TBD — 2–4 paragraphs from discovery notes]

| Metric | Value | How measured |
|--------|-------|--------------|
| Orders/week | [TBD] | Customer export |
| Tools in stack | [TBD] | Discovery interview |
| Integration incidents/month | [TBD] | Customer estimate |

---

### 4 — Why OS Kitchen

| Pillar | What they used | Honest label |
|--------|----------------|--------------|
| Unified Order Hub | [TBD] | BETA / LIVE per registry |
| KDS | [TBD] | Qualified |
| Storefront / preorder | [TBD] | BETA |
| Woo / Shopify channel | [TBD] | BETA |
| Integration Health | [TBD] | BETA |

**Implementation timeline (Week 1):**

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Kickoff + Launch Wizard | CS |
| 1–2 | First channel / storefront live | Integration |
| 3–5 | KDS + production board in service | Operator |
| 5–7 | Baseline metrics captured | CS + Ops |

---

### 5 — Results (After)

**Pilot window:** [TBD]

| Metric | Before | After | Δ | Verified source |
|--------|--------|-------|---|-----------------|
| Orders/day | [TBD] | [TBD] | [TBD] | `artifacts/pilot-metrics-baseline-summary.json` |
| Median bump time (min) | [TBD] | [TBD] | [TBD] | KDS / pilot checklist |
| Integration health score | [TBD] | [TBD] | [TBD] | Health dashboard export |

**Narrative:** [TBD]

---

### 6 — Quote

> "[TBD — signed release wording only]"  
> — **[Name, Title]**, [Company]

**Quote approval:** ☐ Customer signed ☐ Legal reviewed

---

### 7 — Stack context (optional, honest)

| Layer | Before | After | Notes |
|-------|--------|-------|-------|
| POS | [TBD] | OS Kitchen POS (software) | No hardware parity claim |
| E-commerce | [TBD] | [TBD] | Channel maturity per registry |
| KDS | [TBD] | OS Kitchen KDS | Realtime qualified |

**Limitations acknowledged:** [TBD]

---

### 8 — What's next

- [TBD — expansion modules, second location, additional channel]

---

## Short form (sales email / deck)

```markdown
**[Operator name OR anonymized segment]**
[Segment] · [1–3 locations] · [Plan tier]

**Challenge:** [TBD]

**Solution:** OS Kitchen [modules actually used]

**Results (pilot window, verified):**
- Orders/day: [before] → [after]
- Median bump time: [X] min → [Y] min
- Integration health score: [before] → [after]/100

**Quote:** "[TBD]"
```

---

## Sign-off

| Step | Owner | Done |
|------|-------|------|
| Internal draft complete | GTM | ☐ |
| Metrics baseline PASS | Ops | ☐ |
| Customer permission | Legal | ☐ |
| `smoke:pilot-case-study-draft` PASS | GTM | ☐ |
| `verify-claims` strict PASS | GTM | ☐ |
