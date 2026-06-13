# Case study milestone draft — [slug]

**Status:** Internal draft only — do not publish  
**Policy:** `case-study-template-p2-50-v1`  
**Canonical guide:** [`../case-study-template-p2-50.md`](../case-study-template-p2-50.md)  
**Long form (MKT-11):** [`../case-study-template.md`](../case-study-template.md)  
**Permission:** ☐ named signed ☐ anonymized signed ☐ pending

> Internal draft only — no published customer case study until publish gates pass (see docs/case-study-template.md).

Copy this file to `docs/case-studies/<slug>-milestone-draft.md` and replace every `[TBD]`.

---

## Header

| Field | Value |
|-------|-------|
| **Operator** | [Legal name] OR **Anonymized** ([segment], [region]) |
| **Segment** | ☐ Meal prep ☐ Ghost kitchen ☐ Catering ☐ Café / QSR |
| **Pilot start** | [TBD] |
| **Author** | [GTM] · [CS] · [Legal date] |

---

### Challenge

[TBD — 1–2 paragraphs: channel chaos, manual production, integration incidents, before stack]

| Before metric | Value | Source |
|---------------|-------|--------|
| Orders/week | [TBD] | Customer export |
| Tools in stack | [TBD] | Discovery interview |
| Integration incidents/month | [TBD] | Customer estimate |

---

### Solution

[TBD — modules actually deployed; honest BETA/LIVE labels per integration registry]

| Module | Used | Label |
|--------|------|-------|
| Order Hub | [TBD] | BETA |
| KDS | [TBD] | Qualified |
| Integration Health | [TBD] | BETA |
| Storefront / channel | [TBD] | BETA |

**Implementation timeline (W1):**

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Kickoff + Launch Wizard | CS |
| 1–2 | First channel live | Integration |
| 3–5 | KDS in service | Operator |
| 5–7 | Baseline metrics captured | CS + Ops |

---

### Results — W1

**Window:** Pilot week 1 · baseline capture (target until verified)

| Metric | W1 value | Notes |
|--------|----------|-------|
| Orders/day | [TBD] | `pilot-metrics-baseline` |
| Median KDS bump time (min) | [TBD] | KDS telemetry / pilot checklist |
| Integration health score (/100) | [TBD] | Health dashboard export |
| Labor % of revenue | [TBD] | Labor tracker |
| Repeat order rate (%) | [TBD — too early] | Order Hub |

**Narrative:** [TBD — what changed in week 1]

---

### Results — M1

**Window:** Day 30 checkpoint · verified exports only

| Metric | W1 | M1 | Δ | Verified source |
|--------|----|----|---|-----------------|
| Orders/day | [TBD] | [TBD] | [TBD] | Dashboard export |
| Median KDS bump time (min) | [TBD] | [TBD] | [TBD] | KDS telemetry |
| Integration health score (/100) | [TBD] | [TBD] | [TBD] | Health export |
| Labor % of revenue | [TBD] | [TBD] | [TBD] | Labor tracker |
| Repeat order rate (%) | [TBD] | [TBD] | [TBD] | Order Hub |

**Narrative:** [TBD]

---

### Results — M3

**Window:** Day 90 checkpoint · reference customer candidacy

| Metric | M1 | M3 | Δ | Verified source |
|--------|----|----|---|-----------------|
| Orders/day | [TBD] | [TBD] | [TBD] | Dashboard export |
| Median KDS bump time (min) | [TBD] | [TBD] | [TBD] | KDS telemetry |
| Integration health score (/100) | [TBD] | [TBD] | [TBD] | Health export |
| Labor % of revenue | [TBD] | [TBD] | [TBD] | Labor tracker |
| Repeat order rate (%) | [TBD] | [TBD] | [TBD] | Order Hub |

**Narrative:** [TBD — expansion, second channel, retention]

---

### Quote

> "[TBD — signed release wording only]"  
> — **[Name, Title]**, [Company]

**Quote approval:** ☐ Customer signed ☐ Legal reviewed

---

## Short form (sales email / deck)

```markdown
**Challenge:** [TBD]

**Solution:** OS Kitchen [modules actually used]

**Results:**
- **W1:** [TBD]
- **M1:** [TBD]
- **M3:** [TBD]

**Quote:** "[TBD]"
```

---

## Sign-off

| Step | Owner | Done |
|------|-------|------|
| Milestone draft complete | GTM | ☐ |
| W1 baseline PASS | Ops | ☐ |
| M1 verified exports | CS | ☐ |
| M3 verified exports | CS | ☐ |
| Customer permission | Legal | ☐ |
| `verify-claims` strict PASS | GTM | ☐ |
