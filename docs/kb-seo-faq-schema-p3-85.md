# Knowledge base SEO — FAQPage schema (P3-85)

**Policy:** `kb-seo-faq-schema-p3-85-v1`  
**Updated:** 2026-06-16  
**Route:** `/kb` (home view, no search query)

Gap closure: FAQPage JSON-LD + visible FAQ section on the Knowledge Base home page for Google Featured Snippets eligibility.

---

## Implementation

| Layer | Path |
|-------|------|
| FAQ content (8 entries) | `lib/kb/kb-faq-content.ts` |
| JSON-LD builder | `lib/kb/kb-faq-schema.ts` |
| Visible + schema component | `components/kb/kb-faq-section.tsx` |
| FAQPage schema primitive | `components/seo/schema-org.tsx` → `FAQSchema` |
| KB home wiring | `components/kb/kb-pages.tsx` → `KbHomeView` |

## FAQPage JSON-LD shape

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

## Featured Snippets rules

- **Visible content matches schema** — FAQ answers render on `/kb` below category grid
- **8 curated Q&As** — onboarding, integrations, KDS, invoice scanner, pricing, support
- **Honest claims** — LIVE integrations note PASS/SKIPPED per tenant; AI-assisted invoice wording
- **Answer length** — ≤600 chars per answer for snippet-friendly targets
- **Locales** — en/fr/es content; JSON-LD follows active `?lang=` param

## FAQ entry IDs

1. `what-is-os-kitchen`
2. `quick-start-time`
3. `integrations-live`
4. `shopify-setup`
5. `kds-basics`
6. `invoice-scanner`
7. `pricing-trial`
8. `get-support`

## CI

```bash
npm run check:kb-seo-faq-schema-p3-85
```

## Artifact

`artifacts/kb-seo-faq-schema-p3-85.json`
