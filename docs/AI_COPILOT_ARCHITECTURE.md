# AI Copilot architecture

> Route: `/dashboard/copilot` (the spec refers to it as
> `/dashboard/ai-copilot`; we kept the existing route to avoid
> breaking navigation and the legacy `services/ai/copilot.ts` import
> path).

## Files

```
lib/ai/
├── copilot-types.ts         # core types (capabilities, source defs, action types)
├── copilot-permissions.ts   # canUseCopilot(scope, capability) + role grants
├── copilot-redaction.ts     # redactText, maskEmail, maskPhone, detectLeakRisks
├── copilot-prompts.ts       # safety preamble + buildSystemPrompt / buildChatMessages
├── copilot-sources.ts       # source registry (orders, production, …) + role gating
├── copilot-tools.ts         # tool catalogue the copilot may *draft*
└── copilot-guardrails.ts    # final outbound prompt guardrail + caps

services/ai/
├── copilot-service.ts                 # state-bearing API used by UI + actions
├── deterministic-insights-service.ts  # always-on deterministic snapshot
└── copilot.ts                         # legacy helper (still used by old page; preserved)

actions/copilot.ts                     # server actions (chat, drafts, settings)
```

## Request flow

1. **UI** server component (e.g. `/dashboard/copilot/page.tsx`) calls
   `requireSessionUser`, builds an actor scope, and checks
   `canUseCopilot(scope, "copilot.view")`.
2. `buildDeterministicSnapshot(userId)` reuses
   `loadExecutiveOverview` to produce a fixed bullet summary. This
   path **never** calls AI and runs on every page render.
3. If AI narrative is enabled in `CopilotSettings`, the page calls
   `generateNarrative`:
   - Reads `OPENAI_API_KEY` server-side (never serialised to client).
   - Builds the prompt via `buildNarrativePrompt`.
   - Runs `runOutboundGuardrail` to redact + check for leak risks.
   - Fires the OpenAI request; falls back to deterministic on any
     failure / non-200.
4. Every AI call writes a `CopilotAuditEvent` row.

## Chat flow

1. `chatTurnAction` (`actions/copilot.ts`) is a server action invoked
   from the client `ChatThread` component.
2. The server action:
   - Re-checks `canUseCopilot(scope, "copilot.chat")`.
   - Creates / updates `CopilotConversation`.
   - Persists the user message in `CopilotMessage` with the configured
     redaction level.
   - Builds the prompt with the deterministic snapshot as context and
     up to 20 prior `USER` / `ASSISTANT` turns.
   - Runs the outbound guardrail before any provider call.
   - Persists the assistant reply with the narrative status in
     metadata.
3. Tool calls are *not* allowed in the chat path. Action drafts are
   created via the explicit Action Drafts form (or a future tool-call
   path, gated by the same guardrails).

## Action draft lifecycle

```
                 +-----------+    approve    +----------+   execute   +-----------+
   NEEDS_APPROVAL│   DRAFT   │──────────────▶│ APPROVED │────────────▶│ EXECUTED  │
                 +-----------+               +----------+             +-----------+
                       │                          │
                  reject│                     cancel│
                       ▼                          ▼
                  +-----------+              +-----------+
                  │ REJECTED  │              │ CANCELLED │
                  +-----------+              +-----------+
```

Only `EXECUTED` produces a side effect (currently: creating a
`KitchenTask` for `create_task` drafts). Every transition writes an
audit row.

## What the copilot *cannot* do

- Touch operational tables before approval + execution.
- Send a prompt that fails the outbound guardrail.
- Reveal the `OPENAI_API_KEY` to the client or include it in any
  payload.
- Read sources the operator is not allowed to read.
- Run when `deterministicOnly` is true.
