# KitchenOS — Marketing, Pricing & Claims Audit

**Date:** 2026-05-15

---

## 1. Sources reviewed

- `app/page.tsx` and marketing components (`components/landing/*`).
- `components/landing/features.tsx` — **strong honest positioning** (POS Terminal clarifies no native Stripe Terminal hardware integration; capability maturity language).
- Existing alignment docs: `docs/MARKETING_PRICING_CAPABILITY_ALIGNMENT.md`, `docs/MARKETING_SAFE_CLAIMS_AUDIT.md`, `docs/HONEST_CAPABILITY_MATRIX.md`.

---

## 2. Claim categories

| Category | Guidance | KitchenOS stance |
|----------|----------|-------------------|
| SOC2 / SSO / SCIM | Legal/compliance | **Do not claim shipped** unless trust page lists audited controls with dates. |
| Offline POS / proprietary hardware | Hardware | **Avoid** — features.tsx already points readers to honest limitations. |
| Uber / marketplace deep sync | Integrations | Label **beta / setup / partner** per registry entry. |
| SMS notifications | Comms | Treat as **roadmap** unless Twilio/etc. wired. |
| Accounting / payroll | Ecosystem | Position as **export + operational truth**, not ledger replacement. |

---

## 3. SEO / OG

- **P2:** verify root layout metadata helpers include OG + Twitter tags for `/`, `/pricing` (if distinct), primary product pages.
- Resource articles: ensure canonical URLs + meta descriptions per page.

---

## 4. Pricing

- Reference `docs/PRICING_SCENARIOS.md` + billing settings.
- **Risk:** Public pricing must match Stripe price IDs in env — **P1** commercial ops check before campaigns.

---

## 5. CTAs

- Hierarchy: `Book demo`, `Signup`, `Explore demo` should be consistent across landing + `/beta`.
- **P2:** align verb choice (“Request access” vs “Start trial”) with actual billing mode.

---

## 6. Fixes applied this pass

- No marketing copy edits required beyond existing honest baseline; engineering pass focused on storefront performance + hygiene.
- **Recommendation:** schedule a **copy-only** PR referencing `docs/MARKETING_PRICING_CAPABILITY_ALIGNMENT_NEXT_PASS.md` if present.

---

## 7. Backlog

- Add structured data (JSON-LD Organization) **P3**.
- Localize key trust statements **P3** (FR readiness).
