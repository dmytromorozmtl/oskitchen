# Field sales deferral (P3-93)

**Policy:** `field-sales-deferral-p3-93-v1`  
**Department:** Marketing  
**Status:** **DIGITAL-ONLY GTM** — no field sales team, local reps, or on-site visits  
**Registry:** [`artifacts/field-sales-deferral-p3-93.json`](../artifacts/field-sales-deferral-p3-93.json)

---

## Decision

OS Kitchen does **not** operate a Toast-style field sales force, territory managers, or on-site install reps. Go-to-market is **digital-only**: self-serve signup, book-a-demo, founder-led design partner outreach, and documentation-led onboarding.

Field sales is **out of scope for 2026** with no calendar date — we will not hire a local rep network before product-market fit and clear unit economics.

---

## Evaluate and buy today

| Channel | Path | Status |
|---------|------|--------|
| Self-serve Quick Start | `/quick-start` | BETA |
| Book a live demo | `/book-demo` | LIVE |
| Design partner program | `/pricing` | LIVE |
| Guided onboarding docs | `/kb` | BETA |

Public line: *No field sales team or on-site rep visits — self-serve signup, book a demo, or join the design partner program.*

---

## Sales / GTM

Do **not** promise:

- "Our field sales team will visit"
- "Local rep will contact you"
- "On-site visit from our team"

Do say:

- "We are **software-first and digital-only** — start with Quick Start, book a demo, or apply for the design partner program. Competitors like Toast win on bundled hardware and field reps; we win on unified cloud kitchen OS on devices you already have."

---

## Verify

```bash
npm run check:field-sales-deferral-p3-93
```

CI gate: `.github/workflows/ci.yml`

Cross-links: [`/roadmap`](../app/roadmap/page.tsx) Out of scope · [`docs/PRODUCT_ROADMAP_2026.md`](./PRODUCT_ROADMAP_2026.md)
