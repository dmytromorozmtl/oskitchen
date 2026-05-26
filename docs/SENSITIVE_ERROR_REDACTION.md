# Sensitive error redaction

## Goals

- **Display-time only** — stored database values are not rewritten by this pass.
- Preserve **first-line operational context** (HTTP status, validation class, short free text).
- Strip **credentials, tokens, URLs with secrets, and long entropy blobs** before any HTML render.

## API

| Function | Purpose |
|----------|---------|
| `redactSensitiveText(input, options?)` | Full-string redaction pass (ordered regex groups). |
| `toSafeErrorPreview(input, maxLength?, options?)` | Redact → normalize whitespace → truncate; returns `{ text, redacted }`. |

Optional flags:

- `redactEmail` — masks email-shaped substrings (default **off** to preserve support context).
- `redactPhone` — masks long digit runs (default **off**).

## UI contract

- When `redacted === true`, show subtle copy: **“Sensitive details redacted”** (via `SensitiveErrorPreview`).
- **Never** render `payloadJson`, auth headers, signing secrets, or raw partner payloads in these surfaces unless a future permission-gated sanitizer exists.

## Patterns

See `lib/security/redaction-patterns.ts`. Extend with **more specific** patterns before generic token matchers.

## Tests

`npm test` includes `tests/unit/sensitive-redaction.test.ts` (bearer, Stripe, DB URL, API key KV, long hex, harmless string, truncation).
