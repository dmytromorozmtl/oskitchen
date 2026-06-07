# Forbidden claims manual audit

**Status:** Absolute Final Task 31 — June 2026 manual reconciliation  
**Policy:** `forbidden-claims-manual-audit-absolute-final-v1` (`lib/governance/forbidden-claims-manual-audit-policy.ts`)  
**Artifact:** `artifacts/forbidden-claims-manual-audit.json`  
**CI:** `npm run test:ci:forbidden-claims-manual-audit`

---

## Purpose

Reconcile the **183 raw pattern matches** reported in `artifacts/post-200-verification-report.json` (June 6 full-repo grep) into three buckets:

| Classification | Meaning |
|----------------|---------|
| **policy_doc** | Forbidden-phrase lists, governance policies, training docs, tests |
| **negation** | Explicit negation, caveats, matrix gaps, competitor deferrals |
| **real_claim** | Unqualified customer-facing overclaim — **must be 0** |

**Honesty rule:** Engineering references (SCIM routes, SSO schema, inventory services) are **not** marketing claims — they classify as `policy_doc` via implementation-path rules.

---

## Baseline reconciliation (183 → 0 real)

| Bucket | Count | Examples |
|--------|------:|----------|
| **policy_doc** | 121 | `docs/forbidden-claims-training.md`, `lib/governance/marketing-claims-governance-policy.ts`, `tests/unit/forbidden-claims-enforcement.test.ts` |
| **negation** | 59 | "Do not claim production SSO", "not rush-hour certified", "NOT included in pilot" |
| **real_claim (reviewed)** | 3 | Legacy landing copy lines — **remediated June 2026** |
| **Total** | **183** | Matches post-200 verification note |

### Three reviewed real_claim items (remediated)

1. **Unified inventory headline** — rephrased to POS-only depletion with matrix caveat (`docs/feature-maturity-matrix.md` cross-ref).
2. **"Production-certified" adjacent copy** — removed from public hero; replaced with "qualified maturity" wording per `docs/ai-moats-honest-positioning.md`.
3. **Live DoorDash phrasing** — qualified with BETA badge language on Integration Health surfaces.

---

## Live scan (marketing + policy surfaces)

Regenerate:

```bash
npx tsx scripts/audit-forbidden-claims-manual.ts --write
```

Scans:

- `components/marketing`, `components/landing`, `app/pricing`, `app/demo`, `app/integrations`
- `marketing/`, `config/marketing/`, `lib/public-copy.ts`, `app/page.tsx`
- Curated honesty docs (forbidden-claims training, sales-safe registry, maturity matrix, etc.)

**Pass criteria:** `liveScan.realClaimCount === 0`

---

## Classification rules

1. **Policy paths** — files under `forbidden-claims`, `governance`, `sales-safe`, maturity honesty docs → `policy_doc`.
2. **Implementation paths** — `app/api/`, `services/`, `lib/scim`, enterprise wiring → `policy_doc` (not GTM).
3. **Negation context** — surrounding 240 chars match `not`, `forbidden`, `roadmap`, `beta`, `do not sell`, etc.
4. **Marketing paths only** — `real_claim` assigned only when hit is in `components/marketing`, landing, pricing, demo, or `public-copy.ts` **without** qualifier.

---

## Human gate checklist

| # | Gate | Owner |
|---|------|-------|
| 1 | Baseline 183 reconciled in artifact | Engineering |
| 2 | Live marketing scan `realClaimCount: 0` | CI |
| 3 | `npm run verify-claims` PASS on release branch | Release |
| 4 | Sales training doc updated when blocklist changes | Sales |

---

## Related

- [`docs/sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)
- [`docs/forbidden-claims-training.md`](./forbidden-claims-training.md)
- [`marketing/forbidden-claims-training.md`](../marketing/forbidden-claims-training.md)
- `npm run test:ci:forbidden-claims-enforcement`
