# Copilot privacy &amp; redaction

## Redaction levels

```ts
type CopilotRedactionLevel =
  | "NONE"
  | "OPERATIONAL_SUMMARY"
  | "PII_REDACTED"
  | "FULL_INTERNAL_ALLOWED";
```

Default for new workspaces: **`PII_REDACTED`**.

| Level | Secrets stripped | Emails / phones / addresses masked | Free-text notes redacted |
|-------|:---:|:---:|:---:|
| `NONE` | ✅ | ❌ | ❌ |
| `OPERATIONAL_SUMMARY` | ✅ | ✅ | ✅ |
| `PII_REDACTED` | ✅ | ✅ | ❌ |
| `FULL_INTERNAL_ALLOWED` | ✅ | ❌ | ❌ |

Secrets (API keys, bearer tokens, credit-card-like runs) are always
stripped regardless of level.

## Redaction helpers (`lib/ai/copilot-redaction.ts`)

- `maskEmail` — `ada@example.com` → `ada***@example.com`.
- `maskPhone` — `+1 415-555-0123` → `***0123`.
- `maskAddress` — drops house numbers and truncates to 60 chars.
- `redactText(text, level)` — applies the level rules to free text.
- `detectLeakRisks(text)` — returns booleans for secret / email /
  phone / card matches.
- `stricterRedaction(a, b)` — picks whichever is stricter.

## Outbound guardrail (`lib/ai/copilot-guardrails.ts`)

`runOutboundGuardrail(prompt, level)` is the **only** function that
clears a prompt to hit the AI provider:

- Strips secrets / tokens / cards regardless of level.
- Masks emails / phones / addresses except at
  `FULL_INTERNAL_ALLOWED`.
- Re-runs `detectLeakRisks` after redaction. If anything still
  matches, the guardrail returns `{ ok: false, reason }` and the
  caller MUST fall back to the deterministic summary.
- Caps prompts at 16 000 chars (`prompt_too_large` rejection).

The chat / narrative services both pipe their full message body
through the guardrail. If it trips, the user sees the deterministic
answer plus a "redaction guard tripped on `<reason>`" line.

## What we never log

- The OpenAI API key (only ever read via `getServerEnv`).
- Raw user / assistant content with `redactionLevel = NONE` to the
  audit log — the audit metadata stores event type + counts, never the
  prompt body.
- Customer email / phone / address values; those are masked before
  being attached as metadata.
