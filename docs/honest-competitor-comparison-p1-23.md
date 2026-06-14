# P1-23 — Honest competitor comparison pages

**Policy:** `honest-competitor-comparison-p1-23-v1`  
**Registry:** [`artifacts/honest-competitor-comparison-p1-23.json`](../artifacts/honest-competitor-comparison-p1-23.json)

## Contract

`/compare/toast`, `/compare/square`, and `/compare/lightspeed` compare **LIVE operational software only**:

- OS Kitchen cells must be labeled `LIVE`, `BETA`, or `SKIPPED` — never unlabeled green checkmarks.
- **No hardware rows** — payment terminals, proprietary devices, and reader bundles are out of scope.
- Honesty banner on compare landing explains the LIVE-only methodology.

Row definitions live in `lib/marketing/honest-competitor-comparison-p1-23-content.ts`.

## Verify

```bash
npm run check:honest-competitor-comparison-p1-23
npm run check:competitor-comparison-pages
```
