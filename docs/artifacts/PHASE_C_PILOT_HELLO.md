# Phase C pilot — store `hello`

**Weeks 2–4** — media bucket, slider content, forms backlog.

---

## C1. Media bucket (Supabase)

### One-time (platform)

**Automated (recommended):**

```bash
set -a && source .env.production.local && set +a
npm run storefront:setup-media-bucket
npm run storefront:verify-media-bucket
```

**Manual fallback:** Supabase → **Storage** → bucket `storefront-media` (public read).

2. Vercel Production:
   - `STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media`
   - (Supabase URL + service role already in P0 matrix)
3. Redeploy.

### Pilot validation

1. Admin → `/dashboard/storefront/media`
2. Upload JPEG (<5MB).
3. Copy URL → use in theme or slider.
4. **Pass:** Image loads on public `/s/hello` without pasting external HTTPS.

```bash
STOREFRONT_WEEK1_MODE=1 npm run check-env:storefront
# Expect media bucket check: Set
```

---

## C2. Slider on `hello`

**Code:** shipped — QA: [`STOREFRONT_SLIDER_QA_CHECKLIST.md`](STOREFRONT_SLIDER_QA_CHECKLIST.md)

1. Admin → **Builder** → Add section → **Slider**.
2. Add ≥2 slides (use Media library URLs from C1).
3. Public `/s/hello` → arrows work; swipe on mobile; section has `aria-label`.

**Acceptance:** No layout shift; images from bucket URLs only.

---

## C3. Mobile preview

Already in Preview tab (375 / 768 / full). Spot-check slider + menu on mobile viewport.

---

## C4. Forms file-upload — backlog

| Status | Note |
|--------|------|
| ☐ Sprint | File upload fields not in E2E scope |
| ✅ Done | Contact honeypot + rate limit — `e2e/storefront-forms-contact.spec.ts` |

Track in issue: “Storefront forms file-upload E2E”.

---

## Commands

```bash
npm run storefront:list-slugs          # confirm hello
STOREFRONT_PILOT_SLUG=hello npm run storefront:seed-week1-redirects  # Week 1 redirects in DB
```
