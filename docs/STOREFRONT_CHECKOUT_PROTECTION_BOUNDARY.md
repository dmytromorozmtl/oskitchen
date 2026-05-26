# Checkout protection boundary

## Mechanisms

1. **Path detection:** `middleware.ts` stamps `x-kos-pathname`; `isStorefrontCheckoutPath` matches `/s/[slug]/checkout`.
2. **Theme tokens:** layout skips `.kos-storefront-root` scoped design vars on checkout; outer `--store-accent` uses **published** merge only.
3. **Nav/footer:** checkout uses **public** audience selection (published snapshot when available) — never draft DB rows for strangers.
4. **Legal HTML:** checkout client still renders terms/privacy conservatively; server may further harden by passing sanitized fragments (follow-up if HTML terms are enabled).

## Tests

`tests/unit/storefront-next-pass.test.ts` covers checkout path detection + navigation stripping + published merge noop.

## Non-goals (this pass)

No edits to Stripe Elements styling or pay button contrast classes.
