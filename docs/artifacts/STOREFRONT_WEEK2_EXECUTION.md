# Week 2 — Media pilot execution pack

**Prerequisite:** Production `/s/hello` returns **200** (`npm run storefront:diagnose-deploy`).

**Bucket created:** you already ran `storefront:setup-media-bucket` successfully.

---

## Automated (5 min)

```bash
npm run storefront:week2-complete
```

This will:

1. Ensure bucket `storefront-media` exists in Supabase  
2. Patch `.env.production.local` with `STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media`  
3. Verify bucket list API  
4. Write [`WEEK2_MEDIA_SIGNOFF_RECORD.md`](WEEK2_MEDIA_SIGNOFF_RECORD.md)

---

## Vercel (10 min)

| Step | Action |
|------|--------|
| 1 | Settings → Environment Variables → Production |
| 2 | `STOREFRONT_SUPABASE_STORAGE_BUCKET` = `storefront-media` |
| 3 | **Redeploy** Production |

---

## Admin pilot (15 min)

| Step | Action | Pass |
|------|--------|------|
| 1 | `/dashboard/storefront/media` | Page loads | ☐ |
| 2 | Upload JPEG &lt; 8MB | URL copied | ☐ |
| 3 | Builder → home or Slider | Paste URL | ☐ |
| 4 | Public `/s/hello` | Image renders | ☐ |

---

## Week 3 (same day or next)

[`STOREFRONT_SLIDER_QA_CHECKLIST.md`](STOREFRONT_SLIDER_QA_CHECKLIST.md) — code is ready.

---

## Week 4

GitHub → **New issue** → template **Storefront — forms file upload**.
