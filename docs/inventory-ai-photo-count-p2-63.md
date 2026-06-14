# Inventory AI photo count (P2-63)

**Policy:** `inventory-ai-photo-count-p2-63-v1`  
**Updated:** 2026-06-16  
**MarketMan parity:** Shelf photo → AI item counts → physical count lines — comparable to MarketMan photo count, without claiming certified parity.

Gap closure for AI/Inventory task P2-63: photograph shelf → AI counts inventory → apply to open physical count.

## Flow

1. **Photo capture** — camera or gallery (`inventory-photo-count-camera-btn`)
2. **AI shelf count** — OpenAI Vision detects item labels and quantities
3. **Match ingredients** — fuzzy name match to workspace ingredients
4. **Apply to count** — writes counted quantities on open `IN_PROGRESS` inventory count

Route: `/dashboard/inventory/photo-count`

## Benchmark corpus

15 synthetic shelf scenarios with ground-truth item counts (no live OpenAI in CI).

| Metric | Threshold |
|--------|-----------|
| Item recall | ≥90% |
| Hallucination | 0% |

## CI

```bash
npm run check:inventory-ai-photo-count-p2-63
```

## Artifact

`artifacts/inventory-ai-photo-count-p2-63.json`
