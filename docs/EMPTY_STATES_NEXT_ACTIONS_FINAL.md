# Empty States & Next Actions

## Shared component

- `components/dashboard/empty-state.tsx` — primary, secondary, demo, **help** link, configurable demo label.  
- `components/empty-state/actionable-empty-state.tsx` — re-export surface for imports organized under `/components/empty-state/*`.

## Required pattern

Each customer-facing empty state should include:

1. Plain-language **title**  
2. **Description** of what creates data  
3. **Primary CTA** (one per card)  
4. **Secondary CTA** when a second obvious path exists  
5. **Demo CTA** when demo data is safe (`/dashboard/demo/scenarios`)  
6. **Help / docs link** when a setup page clarifies the blocker

## Example applied

- `/dashboard/orders` — improved copy + CTAs for create, hub, demo, POS help link.

## Copy hygiene

Avoid vague “coming soon” on customer surfaces. Internal `/platform` pages may still reference roadmap honestly.
