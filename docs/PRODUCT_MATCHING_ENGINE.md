# Product matching engine

Pure module: `lib/product-mapping/matching-engine.ts`.

Inputs:

- `externalTitle: string`
- `externalSku?: string | null`
- `externalCategory?: string | null`
- `externalProductId?: string | null`
- `provider?: ProductMappingProvider | null`
- `aliasIndex: Map<normalizedTitle, internalProductId>`
- `approvedExternalIndex: Map<externalProductId, internalProductId>`
- `candidates: { id, title, sku, brandId, category }[]`

Outputs (`MatchOutcome`):

- `candidateId: string | null` (only when confidence ≥ HIGH)
- `candidate: CandidateProduct | null` (the row for the suggestion)
- `score: number` (0..1)
- `label: ProductMappingConfidence` (`EXACT_SKU` … `NONE`)
- `reasons: MatchReason[]`

## Normalisation

```
normalizeTitle: NFKD → strip accents → strip provider suffixes
                ("(Shopify)", "(WooCommerce)", …)
                → lowercase → keep alphanumerics → collapse whitespace.

normalizeSku: trim → uppercase → keep [A-Z0-9-].
```

## Ladder (deterministic, top-down)

1. **Exact SKU.** `normalizeSku(external) == normalizeSku(candidate.sku)`. Label `EXACT_SKU`, score 1.
2. **Exact external id (previously approved).** Looked up via `approvedExternalIndex`. Label `EXACT_SKU`, score 1.
3. **Exact normalized title.** Label `EXACT_TITLE`, score 0.95.
4. **Alias match.** `aliasIndex.get(normalizedTitle)`. Label `HIGH`, score 0.92.
5. **Token similarity.** `max(jaccard, containment * 0.9)`. Label
   derived from `classifyScore(score)`:
   - ≥ 0.95 → `EXACT_TITLE`
   - ≥ 0.8 → `HIGH`
   - ≥ 0.55 → `MEDIUM`
   - > 0 → `LOW`
   - else → `NONE`
6. **Category + title similarity.** When external category is
   present, allows pulling the best candidate up by 0.15
   (capped at 0.7). Threshold 0.45.
7. **NO_MATCH.** No candidate returned for attaching, but the best
   guess (if any) is still surfaced in `reasons` for operator
   inspection.

## Attaching the candidate

`shouldAttachCandidate(label)` returns true only for `EXACT_SKU`,
`EXACT_TITLE`, `HIGH`, and `MANUAL`. For `MEDIUM`, `LOW`, or `NONE`
the service stores the match reasons but leaves
`internalProductId = null`, forcing the operator to pick the target.

This is the **P0 safety rule** identified in the audit: the previous
implementation attached candidates as soon as the raw score reached
0.5, which let medium-confidence rows be approved with one click.
