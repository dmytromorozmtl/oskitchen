# Week 1 — storefront hardening sign-off

**Generated:** 2026-05-17 · `npm run storefront:week1-artifacts`
**Pilot slug:** `hello`

## Summary

| Workstream | Code ready | Ops / env | Verified |
|------------|------------|-----------|----------|
| Turnstile | ✅ | 🟡 add Vercel keys | ☐ |
| Redirects | ✅ | 🟡 STOREFRONT_REDIRECTS_ENABLED | ☐ smoke |
| Lighthouse | ✅ | ☐ run LHCI | ☐ appendix signed |
| Env critical | — | 🔴 | — |
| Media bucket (Phase C) | ✅ | ✅ configured | ☐ pilot upload |
| Slider builder | ✅ | Week 3 QA | ☐ product sign-off |
| Forms file-upload | backlog | Week 4 sprint | — |

---

## 1. Turnstile

| Step | Status |
|------|--------|
| Cloudflare widget created | ☐ |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → Vercel Production + Preview | ☐ |
| `TURNSTILE_SECRET_KEY` → Vercel Production + Preview | ☐ |
| Redeploy prod + staging | ☐ |
| `/s/hello/contact` submit (no 500) | ☐ |
| `/s/hello/checkout` with widget visible | ☐ |

Setup guide: [`STOREFRONT_TURNSTILE_VERCEL_SETUP.md`](STOREFRONT_TURNSTILE_VERCEL_SETUP.md)

**Staging test keys (always pass):** see guide § Test mode.

---

## 2. Redirects

| Step | Status |
|------|--------|
| `npm run storefront:seed-week1-redirects` | ☐ |
| `STOREFRONT_REDIRECTS_ENABLED=true` in Vercel Production | ☐ |
| Redeploy | ☐ |
| `npm run smoke:storefront-redirects` | ☐ |

Smoke hosts:

- Production: `https://xn---production-xijza32a.vercel.app`
- Staging: `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app`

---

## 3. Lighthouse

| Page | Scores (auto if LHCI ran) | Perf ≥ 85 | LCP ≤ 2500ms |
|------|---------------------------|-----------|--------------|
| `/s/hello/menu` | _run lighthouse:storefront_ | ☐ | ☐ |
| `/s/hello/checkout` | _run lighthouse:storefront_ | ☐ | ☐ |

Appendix: [`WEEK1_LIGHTHOUSE_APPENDIX.md`](WEEK1_LIGHTHOUSE_APPENDIX.md)

---

## 4. Approvals

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | ☐ |
| Product | | | ☐ |

**Week 1 complete when:** Turnstile live, redirects smoke PASS, Lighthouse appendix signed, `storefront:week1-verify` no critical failures.
