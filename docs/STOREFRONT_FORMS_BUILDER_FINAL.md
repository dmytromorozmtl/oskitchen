# Storefront forms builder (final)

**Implemented:** `app/dashboard/storefront/forms/**`, `actions/storefront-forms.ts`, `services/storefront/storefront-form-service.ts`, `services/storefront/storefront-form-submission-service.ts`, `lib/storefront/forms.ts`, public form pages under `/s/[storeSlug]/contact`, catering, dynamic `p/[pageSlug]` with linked forms.

**Works:** CRUD, honeypot, rate limit (20/min), CSV export path if present in repo, link contact/catering forms on settings.

**Limits:** File uploads not implemented; spam heuristics are basic.

**Config:** Requires storefront overview saved first.

**QA:** Create form → submit on `/s/...` → row in submissions → conversion event name matches kind.

**Roadmap:** Field-level conditional logic, CAPTCHA provider hook.
