# Case study template — Challenge → Solution → Results (P2-50)

**Policy:** `case-study-template-p2-50-v1`  
**Department:** Marketing  
**Registry:** [`artifacts/case-study-template-p2-50-registry.json`](../artifacts/case-study-template-p2-50-registry.json)  
**Fill-in scaffold:** [`docs/case-studies/_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md)  
**Publish gates (MKT-11):** [`docs/case-study-template.md`](./case-study-template.md)

---

## Purpose

Standard **internal draft** scaffold for design partner and pilot stories:

| Section | When | Audience |
|---------|------|------------|
| **Challenge** | Discovery / kickoff | GTM, CS, founder |
| **Solution** | Week 0–1 implementation plan | Sales deck sidebar |
| **Results W1** | End of pilot week 1 | Weekly pilot review |
| **Results M1** | 30-day checkpoint | Customer success QBR |
| **Results M3** | 90-day checkpoint | Reference customer candidacy |

> **Internal draft only** — OS Kitchen has **no published customer case study** until MKT-11 publish gates pass. Label W1 metrics as **(target)** until verified baseline PASS. Design partner list entries remain **not contacted** research targets until CRM logs outreach.

---

## Short form (email / deck)

```markdown
**Challenge:** [1 sentence — channel chaos, manual production, packing errors]

**Solution:** OS Kitchen [modules actually used — e.g. Order Hub + KDS + Integration Health]

**Results:**
- **W1:** [First live order · baseline metrics captured]
- **M1:** [Operational rhythm · verified KPI delta]
- **M3:** [Expansion / retention · verified KPI delta]

**Quote:** "[Signed operator voice — pending customer approval]"
```

---

## Milestone metric table (W1 / M1 / M3)

Copy into `docs/case-studies/<slug>-milestone-draft.md` from [`_MILESTONE_TEMPLATE.md`](./case-studies/_MILESTONE_TEMPLATE.md).

| Metric | W1 (week 1) | M1 (month 1) | M3 (month 3) | Verified source |
|--------|-------------|--------------|--------------|-----------------|
| Orders/day | [TBD] | [TBD] | [TBD] | `pilot-metrics-baseline` |
| Median KDS bump (min) | [TBD] | [TBD] | [TBD] | KDS telemetry |
| Integration health (/100) | [TBD] | [TBD] | [TBD] | Integration Health export |
| Labor % of revenue | [TBD] | [TBD] | [TBD] | Labor tracker |
| Repeat order rate (%) | [TBD — too early] | [TBD] | [TBD] | Order Hub |

---

## Workflow

1. **Define Challenge** — discovery notes, before metrics, stack pain.
2. **Define Solution** — modules actually deployed (BETA/LIVE per registry).
3. **Capture Results W1** — first live order, baseline smoke PASS.
4. **Capture Results M1/M3** — verified exports only; no fabricated operators.

---

## Related docs

- [`case-study-template.md`](./case-study-template.md) — MKT-11 publish gates + long form
- [`case-studies/_TEMPLATE.md`](./case-studies/_TEMPLATE.md) — full long-form scaffold
- [`pilot-case-study-draft-era17.md`](./pilot-case-study-draft-era17.md) — example internal draft
- [`forbidden-claims-training.md`](./forbidden-claims-training.md) — claims hygiene before publish

---

## Audit

```bash
npm run audit:case-study-template-p2-50
npm run check:case-study-template-p2-50
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` — Case study template P2-50 audit step.
