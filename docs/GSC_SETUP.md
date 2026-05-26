# Google Search Console — Setup (15 minutes)

**Blocks:** SEO score, Core Web Vitals, indexing of 65+ sitemap URLs.  
**Do this before** new blog posts, compare pages, or paid search.

---

## Steps

1. Open [Google Search Console](https://search.google.com/search-console).
2. **Add property** → URL prefix: `https://os-kitchen.com`
3. **Verify ownership** (pick one):
   - **HTML tag** — add to `app/layout.tsx` metadata `verification.google` (env `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), or
   - **DNS TXT** — add record at domain registrar (recommended for production).
4. **Submit sitemap:** `https://os-kitchen.com/sitemap.xml`
5. **Request indexing** for high-intent URLs:
   - `/`
   - `/pricing`
   - `/solutions/meal-prep`
   - `/compare/toast`
   - `/roi-calculator`
6. Enable **email alerts** for coverage errors and manual actions.

---

## Optional: verification via environment

Add to Vercel production env:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

The root layout can expose this in metadata when set (see `lib/marketing/site-verification.ts` if present).

---

## After verification

| Task | Frequency |
|------|-----------|
| Check Coverage report | Weekly |
| Review Core Web Vitals | Weekly |
| Inspect URL after publishing new solution/compare page | Per publish |
| Compare clicks vs GA4 organic | Monthly |

---

## Automate before manual steps

```bash
npm run gtm:gsc-preflight
npm run gtm:gsc-preflight:strict   # exit 1 until live google-site-verification meta exists
```

Checks: health + DB latency snippet, `robots.txt`, `sitemap.xml` (≥50 URLs), blog paths in sitemap, featured blog 200, `/deck`, live GSC meta tag.

Passes required checks when production is up. Use `--strict` after setting `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` on Vercel.

## Success criteria

- [ ] Property shows **Verified**
- [ ] Sitemap status **Success** with ~65 URLs discovered
- [ ] No critical Coverage errors on `/solutions/*` and `/compare/*`
