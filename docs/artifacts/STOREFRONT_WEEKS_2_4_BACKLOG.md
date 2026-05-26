# Weeks 2–4 — storefront backlog (structured)

**Week 1:** [`STOREFRONT_WEEK1_EXECUTION.md`](STOREFRONT_WEEK1_EXECUTION.md)  
**Phase C detail:** [`PHASE_C_PILOT_HELLO.md`](PHASE_C_PILOT_HELLO.md)

---

## Status summary

| Week | Deliverable | Code | Ops / QA |
|------|-------------|------|----------|
| 2 | Media bucket + pilot | ✅ upload + `storefront:week2-complete` | 🟡 Vercel env + admin upload |
| 3 | Slider in builder | ✅ SLIDER section + editor | 🟡 product QA sign-off |
| 4 | Forms file-upload | ☐ backlog issue | ☐ separate sprint |

---

## Week 2 — Media pilot (`hello`)

### C1. Supabase bucket (automated)

```bash
set -a && source .env.production.local && set +a
npm run storefront:setup-media-bucket
npm run storefront:verify-media-bucket
```

| Task | Command / place | Status |
|------|-----------------|--------|
| Create bucket `storefront-media` | `storefront:setup-media-bucket` | ☐ |
| Vercel `STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media` | Production | ☐ |
| Redeploy | Vercel | ☐ |
| Upload test JPEG | `/dashboard/storefront/media` | ☐ |
| Public `/s/hello` shows image | Builder or theme URL | ☐ |

Manual fallback: Supabase Dashboard → Storage → New bucket → public read.

### C1 acceptance

- [ ] `STOREFRONT_WEEK1_MODE=1 npm run check-env:storefront` — media bucket **Set**
- [ ] No broken images on pilot storefront
- [ ] URLs use bucket host, not random external hosts

---

## Week 3 — Slider (code complete → QA)

**Implementation:** `docs/STOREFRONT_SLIDER_SECTION.md`  
**QA checklist:** [`STOREFRONT_SLIDER_QA_CHECKLIST.md`](STOREFRONT_SLIDER_QA_CHECKLIST.md)

| Task | Detail | Status |
|------|--------|--------|
| Builder → Add **Slider** section | ≥2 slides | ☐ |
| Media library URLs | From Week 2 bucket | ☐ |
| Public `/s/hello` | Arrows, swipe, `aria-label` | ☐ |
| Mobile preview | 375px — no layout shift | ☐ |
| Product sign-off | QA checklist | ☐ |

---

## Week 4 — Forms file-upload (deferred sprint)

**Does not block release.**

| Item | Status |
|------|--------|
| GitHub issue | Create from template: `.github/ISSUE_TEMPLATE/storefront-forms-file-upload.yml` |
| Field type `file` | ☐ |
| Storage + virus scan policy | ☐ |
| Turnstile on dynamic forms | ☐ (recommended in same sprint) |

---

## Commands cheat sheet

```bash
npm run storefront:setup-media-bucket
npm run storefront:verify-media-bucket
STOREFRONT_PILOT_SLUG=hello npm run storefront:seed-week1-redirects
npm run storefront:week1-complete
```

---

## Dependency graph

```mermaid
flowchart LR
  w1[Week 1 hardening]
  media[Week 2 Media]
  slider[Week 3 Slider QA]
  upload[Week 4 File upload]

  w1 --> media
  media --> slider
  slider --> upload
```
