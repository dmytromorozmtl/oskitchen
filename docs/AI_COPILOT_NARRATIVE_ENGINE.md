# Narrative engine

The narrative engine wraps the optional OpenAI call. It must:

- Never run if `OPENAI_API_KEY` is missing.
- Never run if `deterministicOnly = true` or
  `aiNarrativeEnabled = false`.
- Never send a prompt that fails the outbound guardrail.
- Always fall back to the deterministic bullet summary on any failure.

## Status enum

```ts
type CopilotNarrativeStatus =
  | "OK"                    // narrative produced
  | "DISABLED_BY_SETTINGS"  // workspace turned AI off
  | "MISSING_API_KEY"       // OPENAI_API_KEY not set on server
  | "PROVIDER_ERROR"        // network error or non-200 from provider
  | "REDACTION_BLOCKED"     // outbound guardrail tripped
```

UI maps each status to a clear description; we never claim "AI ran"
when it didn't.

## Prompt shape

```
[system]
You are KitchenOS Copilot ...
Operating constraints:
- redacted operational summary only
- no invented numbers
- ...
Operator role: <role | omitted>
<mode-specific hint>

[user]
Operational summary for <rangeLabel>.
Summarise the situation in <= 6 sentences and recommend up to 3 next actions for the operator.
Do not introduce numbers or facts not present below.

<bulletSummary>
```

For chat, we additionally prepend the deterministic context block and
up to 20 prior `USER` / `ASSISTANT` turns.

## Provider call

- Model: `gpt-4o-mini`.
- `temperature: 0.2`.
- `max_tokens: 600`.
- Timeout: implicit (Node `fetch`); the action wrapper handles errors
  gracefully.

## Audit

Every narrative attempt writes one of:

- `narrative_generated` (success).
- `narrative_provider_error` (non-200 / network).
- `narrative_blocked` (guardrail).
- For chat: `chat_message_generated`, `chat_provider_error`,
  `chat_blocked`.
