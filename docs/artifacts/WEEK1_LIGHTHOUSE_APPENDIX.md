# Week 1 — Lighthouse appendix

Fill after running on **staging**:

```bash
LHCI_BASE_URL=https://staging.yourdomain.com \
E2E_STORE_SLUG=your-slug \
npm run lighthouse:storefront
```

| Page | Performance score | LCP (ms) | Pass (≥0.85 / ≤2500ms) |
|------|-------------------|----------|-------------------------|
| `/s/{slug}/menu` | | | ☐ |
| `/s/{slug}/checkout` | | | ☐ |

**Run date:** ___________  
**Tester:** ___________

Thresholds: `lighthouserc.cjs` — performance ≥ 0.85, LCP ≤ 2500ms.
