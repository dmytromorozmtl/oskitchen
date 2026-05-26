# Storefront theme validation & preview

**Implemented:** `lib/storefront/theme-validation.ts`, `services/storefront/storefront-theme-service.ts`, `app/dashboard/storefront/theme/page.tsx`, `components/storefront/theme/*` (asset, contrast, preset, layout previews).

**Works:** HTTPS-only media URLs; `javascript:` / `data:` rejected; contrast helper; preset/layout keys displayed; image `onError` fallback.

**Limits:** Preset keys are opaque strings (no live theme switcher beyond saved CSS vars on public site).

**Config:** None beyond valid URLs.

**QA:** Enter bad URL → save blocked by server assert; good HTTPS → preview renders.

**Roadmap:** Preset gallery from design tokens.
