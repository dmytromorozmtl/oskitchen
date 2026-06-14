# P1-24 — ICP landing pages (meal prep + ghost kitchen)

**Policy:** `icp-landing-pages-p1-24-v1`  
**Registry:** [`artifacts/icp-landing-pages-p1-24.json`](../artifacts/icp-landing-pages-p1-24.json)

## Contract

`/meal-prep-software` and `/ghost-kitchen-software` lead with **operator pain points**, not feature lists:

1. **Pain-first hero** — H1/subtitle name the bottleneck (spreadsheets, tablets, blended P&L).
2. **Structured pain cards** — each pain includes `symptom`, `operatorCost`, and `solution`.
3. **Pain → fix bridge** — `IcpPainSolutionBridgeSection` maps every pain to an OS Kitchen workflow.

Content: `lib/marketing/icp-landing-pages-p1-24-content.ts`

## Verify

```bash
npm run check:icp-landing-pages-p1-24
npm run check:icp-landing-pages
```
